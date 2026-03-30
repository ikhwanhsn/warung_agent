import {
  type FC,
  type ReactNode,
  useMemo,
  useCallback,
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { PrivyProvider, usePrivy, useLoginWithSiws, useLogout } from "@privy-io/react-auth";
import {
  useWallets as usePrivySolanaWallets,
  useSignTransaction,
  useSignMessage,
} from "@privy-io/react-auth/solana";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { Connection } from "@solana/web3.js";
import { toast } from "@/hooks/use-toast";

/** Detect installed Solana wallet extensions (for showing only installed wallets vs. minimal list for new users). */
function detectInstalledWallets(): { hasSolana: boolean } {
  if (typeof window === "undefined") return { hasSolana: false };
  const w = window as Window & {
    phantom?: { solana?: unknown };
    solflare?: unknown;
    backpack?: unknown;
  };
  const hasSolana = !!(w.phantom?.solana || w.solflare || w.backpack);
  return { hasSolana };
}

/** Wallet list for Privy: only installed Solana wallets, or fallback for new users. */
function getWalletListForSolana(detected: { hasSolana: boolean }): string[] {
  return detected.hasSolana ? ["detected_solana_wallets"] : ["phantom", "solflare"];
}

/** Default wallet list for login modal (Solana only). */
function getDefaultWalletList(detected: { hasSolana: boolean }): string[] {
  return detected.hasSolana ? ["detected_solana_wallets"] : ["phantom", "solflare"];
}

/** Login modal: only email and wallet (no social logins); wallet list is controlled by getDefaultWalletList / getWalletListForChain. */
const MINIMAL_LOGIN_OPTIONS = { loginMethods: ["email", "wallet"] as const };

const USDC_MINT = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);
const MAINNET_RPC =
  import.meta.env.VITE_SOLANA_RPC_URL || "https://rpc.ankr.com/solana";

export const connection = new Connection(MAINNET_RPC);

export interface WalletContextState {
  connection: Connection;
  connected: boolean;
  connecting: boolean;
  address: string | null;
  shortAddress: string | null;
  solBalance: number | null;
  usdcBalance: number | null;
  network: string;
  connect: () => Promise<void>;
  /** Connect Solana wallet via Privy (after email login if needed). */
  connectForChain: (chain: "solana") => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: unknown) => Promise<VersionedTransaction>;
  /** Sign and send a legacy Transaction (e.g. for FuelAgentModal). Returns signature. */
  sendTransaction: (
    transaction: Transaction,
    options?: { skipPreflight?: boolean; maxRetries?: number }
  ) => Promise<string>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  publicKey: PublicKey | null;
  connectSolana: () => Promise<void>;
  openLoginModal: () => void;
  isPrivyMounted: boolean;
  requestConnect: (option: "email" | "solana") => void;
  /** Always `solana` when a Solana wallet is connected; otherwise null. */
  effectiveChain: "solana" | null;
}

const WalletContext = createContext<WalletContextState | null>(null);

export function useWalletContext(): WalletContextState {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within WalletContextProvider");
  }
  return context;
}

function signatureToBase64(sig: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < sig.length; i++)
    binary += String.fromCharCode(sig[i]);
  return btoa(binary);
}

const SIWS_403_ORIGIN_KEY = "privy_siws_403_origin";
function getSiws403Origin(): string | null {
  try {
    return typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem(SIWS_403_ORIGIN_KEY)
      : null;
  } catch {
    return null;
  }
}
function setSiws403Origin(origin: string): void {
  try {
    if (typeof sessionStorage !== "undefined")
      sessionStorage.setItem(SIWS_403_ORIGIN_KEY, origin);
  } catch {}
}

/** Known Privy SDK keys from @privy-io/react-auth (context-CcPjcQxY) – clear all so refresh stays disconnected. */
const PRIVY_LOCAL_KEYS = [
  "privy:token",
  "privy:refresh_token",
  "privy:pat",
  "privy:id_token",
  "privy:caid",
  "privy:state_code",
  "privy:code_verifier",
  "privy:headless_oauth",
  "privy:oauth_disable_signup",
  "privy:connections",
  "WALLETCONNECT_DEEPLINK_CHOICE",
];
const PRIVY_COOKIE_NAMES = ["privy-token", "privy-refresh-token", "privy-id-token", "privy-session"];

/** Clear any Privy-related IndexedDB databases (SDK or WalletConnect may use them). */
function clearPrivyIndexedDB(): void {
  try {
    if (typeof indexedDB === "undefined" || !indexedDB.databases) return;
    indexedDB.databases?.().then((dbs) => {
      dbs.forEach((db) => {
        if (db.name && (db.name.toLowerCase().includes("privy") || db.name.toLowerCase().includes("walletconnect"))) {
          indexedDB.deleteDatabase(db.name);
        }
      });
    }).catch(() => {});
  } catch {}
}

function clearPrivySessionStorage(): void {
  try {
    if (typeof localStorage !== "undefined") {
      PRIVY_LOCAL_KEYS.forEach((k) => localStorage.removeItem(k));
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.toLowerCase().includes("privy")) localStorage.removeItem(key);
      });
    }
    if (typeof sessionStorage !== "undefined") {
      const keys = Object.keys(sessionStorage);
      keys.forEach((key) => {
        if (key.toLowerCase().includes("privy")) sessionStorage.removeItem(key);
      });
    }
    if (typeof document !== "undefined" && document.cookie) {
      const hostname = window.location.hostname;
      const path = "/";
      const expire = "expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";
      PRIVY_COOKIE_NAMES.forEach((name) => {
        document.cookie = `${name}=; path=${path}; ${expire}`;
        document.cookie = `${name}=; path=${path}; domain=${hostname}; ${expire}`;
        if (hostname.indexOf(".") > 0)
          document.cookie = `${name}=; path=${path}; domain=.${hostname}; ${expire}`;
      });
    }
    clearPrivyIndexedDB();
  } catch {
    // ignore
  }
}

/** When set, user chose to disconnect; after refresh we force logout so wallet doesn't auto-reconnect. */
const DISCONNECTED_BY_USER_KEY = "warung_wallet_disconnected_by_user";
function setDisconnectedByUserFlag(): void {
  try {
    if (typeof sessionStorage !== "undefined")
      sessionStorage.setItem(DISCONNECTED_BY_USER_KEY, "1");
  } catch {}
}
function clearDisconnectedByUserFlag(): void {
  try {
    if (typeof sessionStorage !== "undefined")
      sessionStorage.removeItem(DISCONNECTED_BY_USER_KEY);
  } catch {}
}
function getDisconnectedByUserFlag(): boolean {
  try {
    return typeof sessionStorage !== "undefined" && sessionStorage.getItem(DISCONNECTED_BY_USER_KEY) === "1";
  } catch {
    return false;
  }
}

/** Check if any Privy auth token exists in storage (run before PrivyProvider mounts). If none, user cleared data or never logged in – treat as disconnected. */
function hasPrivyTokenInStorage(): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    if (localStorage.getItem("privy:token")) return true;
    const keys = Object.keys(localStorage);
    for (const k of keys) {
      if (k.toLowerCase().includes("privy") && localStorage.getItem(k)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

type ConnectOption = "email" | "solana";

const WalletContextInner: FC<{
  children: ReactNode;
  pendingConnectOption: ConnectOption | null;
  setPendingConnectOption: (v: ConnectOption | null) => void;
  /** When true, there was no Privy token in storage at page load (e.g. user cleared browser data) – force disconnected until user connects again. */
  noPrivyTokenOnLoad: boolean;
  /** Detected installed wallets; used to show only installed or fallback for new users. */
  installedWallets: { hasSolana: boolean };
}> = ({
  children,
  pendingConnectOption,
  setPendingConnectOption,
  noPrivyTokenOnLoad,
  installedWallets,
}) => {
  const requestConnect = useCallback(
    (option: ConnectOption) => setPendingConnectOption(option),
    [setPendingConnectOption]
  );
  const { ready: privyReady, authenticated, login, connectWallet } =
    usePrivy();
  const { logout } = useLogout({
    onSuccess: () => {
      clearPrivySessionStorage();
      // Clear again after delays – Privy may re-write storage async after logout
      setTimeout(clearPrivySessionStorage, 50);
      setTimeout(clearPrivySessionStorage, 200);
    },
  });
  const { generateSiwsMessage, loginWithSiws } = useLoginWithSiws();
  const { wallets: solanaWallets, ready: solanaWalletsReady } =
    usePrivySolanaWallets();
  const { signTransaction: privySignTransaction } = useSignTransaction();
  const { signMessage: privySignMessage } = useSignMessage();

  const siwsAttemptedForRef = useRef<string | null>(null);
  const justDisconnectedRef = useRef(false);
  const loginModalJustOpenedRef = useRef(false);

  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  /** When true, UI shows disconnected immediately; cleared when Privy authenticated becomes false */
  const [forceDisconnected, setForceDisconnected] = useState(false);
  /** Once user explicitly connects (auth + wallet), stop treating noPrivyTokenOnLoad as disconnected so they see connected. */
  const [noTokenOverriddenByConnect, setNoTokenOverriddenByConnect] = useState(false);

  const solanaWallet = solanaWallets?.[0] ?? null;
  const address = solanaWallet?.address ?? null;
  const publicKey = address ? new PublicKey(address) : null;
  const connected = !!(authenticated && solanaWallet);

  const connecting =
    !privyReady || (authenticated && !solanaWalletsReady);

  const shortAddress = address
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : null;

  // On mount: if user had disconnected before refresh, or there was no Privy token (e.g. cleared browser data), force logout so wallet doesn't auto-reconnect
  const didApplyDisconnectOnMountRef = useRef(false);
  useEffect(() => {
    if (!privyReady || didApplyDisconnectOnMountRef.current) return;
    const shouldForceLogout = getDisconnectedByUserFlag() || noPrivyTokenOnLoad;
    if (!shouldForceLogout) return;
    didApplyDisconnectOnMountRef.current = true;
    setForceDisconnected(true);
    if (getDisconnectedByUserFlag()) clearDisconnectedByUserFlag();
    logout()
      .then(() => {
        clearPrivySessionStorage();
        setTimeout(clearPrivySessionStorage, 50);
        setTimeout(clearPrivySessionStorage, 200);
      })
      .catch(() => {});
  }, [privyReady, logout, noPrivyTokenOnLoad]);

  // Clear forceDisconnected when:
  // - Fully logged out (no auth + no wallets) so we don't keep it true forever, or
  // - User has connected (auth + wallets) so connect flow shows correctly
  useEffect(() => {
    const noWallets = !solanaWallets || solanaWallets.length === 0;
    if (!authenticated && noWallets) {
      setForceDisconnected(false);
    } else if (authenticated && !noWallets) {
      setForceDisconnected(false);
      setNoTokenOverriddenByConnect(true); // user connected; stop treating noPrivyTokenOnLoad as disconnected
      clearDisconnectedByUserFlag(); // user connected again; next refresh can stay connected
    }
  }, [authenticated, solanaWallets]);

  useEffect(() => {
    if (!publicKey || !connected) {
      setSolBalance(null);
      setUsdcBalance(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const balance = await connection.getBalance(publicKey, "confirmed");
        if (!cancelled) setSolBalance(balance / LAMPORTS_PER_SOL);
        const tokenAccounts =
          await connection.getParsedTokenAccountsByOwner(publicKey, {
            mint: USDC_MINT,
          });
        if (!cancelled) {
          if (tokenAccounts.value.length > 0) {
            const total = tokenAccounts.value.reduce(
              (sum, acc) =>
                sum +
                (Number(acc.account.data.parsed.info.tokenAmount.uiAmount) || 0),
              0
            );
            setUsdcBalance(total);
          } else setUsdcBalance(0);
        }
      } catch {
        if (!cancelled) setUsdcBalance(0);
      }
    })();
    const interval = setInterval(() => {
      if (!publicKey || !connected) return;
      connection
        .getBalance(publicKey, "confirmed")
        .then((b) => !cancelled && setSolBalance(b / LAMPORTS_PER_SOL));
      connection
        .getParsedTokenAccountsByOwner(publicKey, { mint: USDC_MINT })
        .then((ta) => {
          if (cancelled) return;
          if (ta.value.length > 0)
            setUsdcBalance(
              ta.value.reduce(
                (s, a) =>
                  s +
                  (Number(a.account.data.parsed.info.tokenAmount.uiAmount) ||
                    0),
                0
              )
            );
          else setUsdcBalance(0);
        });
    }, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [publicKey, connected]);

  useEffect(() => {
    const wallet = solanaWallets?.[0];
    if (!privyReady || authenticated || !wallet?.address) return;
    if (justDisconnectedRef.current) return;
    if (loginModalJustOpenedRef.current) return;
    if (siwsAttemptedForRef.current === wallet.address) return;
    // Don't trigger Phantom sign (SIWS) when user disconnected or cleared data – would open wallet on refresh
    if (forceDisconnected || noPrivyTokenOnLoad || didApplyDisconnectOnMountRef.current) return;
    if (!hasPrivyTokenInStorage()) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    if (origin && getSiws403Origin() === origin) return;
    siwsAttemptedForRef.current = wallet.address;

    let cancelled = false;
    (async () => {
      try {
        const message = await generateSiwsMessage({ address: wallet.address });
        const encodedMessage = new TextEncoder().encode(message);
        const result = await privySignMessage({
          message: encodedMessage,
          wallet,
        });
        const rawSig = result?.signature;
        const signatureBase64 =
          typeof rawSig === "string"
            ? rawSig
            : rawSig instanceof Uint8Array
              ? signatureToBase64(rawSig)
              : ArrayBuffer.isView(rawSig)
                ? signatureToBase64(
                    new Uint8Array(
                      (rawSig as ArrayBufferView).buffer,
                      (rawSig as ArrayBufferView).byteOffset,
                      (rawSig as ArrayBufferView).byteLength
                    )
                  )
                : Array.isArray(rawSig)
                  ? signatureToBase64(new Uint8Array(rawSig))
                  : "";
        if (cancelled || !signatureBase64) return;
        await loginWithSiws({ message, signature: signatureBase64 });
      } catch (e: unknown) {
        if (!cancelled) {
          siwsAttemptedForRef.current = null;
          const msg =
            e &&
            typeof e === "object" &&
            "message" in e
              ? String((e as { message: unknown }).message)
              : String(e);
          const is403 =
            msg.includes("403") ||
            msg.includes("not allowed") ||
            (e &&
              typeof e === "object" &&
              "status" in e &&
              (e as { status: number }).status === 403);
          if (is403 && typeof window !== "undefined") {
            const currentOrigin = window.location.origin;
            setSiws403Origin(currentOrigin);
            toast({
              title: "Solana login blocked (403)",
              description: `Add "${currentOrigin}" in Privy Dashboard → Configuration → Clients → your client → Allowed origins. Or sign in with email first, then connect your Solana wallet.`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Solana sign-in failed",
              description:
                msg ||
                "Try logging in with email first, then connect your Solana wallet.",
              variant: "destructive",
            });
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    privyReady,
    authenticated,
    solanaWallets,
    forceDisconnected,
    noPrivyTokenOnLoad,
    generateSiwsMessage,
    loginWithSiws,
    privySignMessage,
  ]);

  const connect = useCallback(async () => {
    if (!privyReady) return;
    if (!authenticated) {
      login(MINIMAL_LOGIN_OPTIONS);
      return;
    }
    connectWallet();
  }, [privyReady, authenticated, login, connectWallet]);

  const openLoginModal = useCallback(() => {
    if (privyReady) {
      loginModalJustOpenedRef.current = true;
      login(MINIMAL_LOGIN_OPTIONS);
      setTimeout(() => {
        loginModalJustOpenedRef.current = false;
      }, 25000);
    }
  }, [privyReady, login]);

  const connectForChain = useCallback(
    async (chain: "solana") => {
      if (chain !== "solana") return;
      if (!privyReady) return;
      const walletList = getWalletListForSolana(installedWallets);

      if (!authenticated) {
        loginModalJustOpenedRef.current = true;
        login(MINIMAL_LOGIN_OPTIONS);
        setTimeout(() => {
          loginModalJustOpenedRef.current = false;
        }, 25000);
        return;
      }
      if (solanaWallets?.[0]) return;
      connectWallet({ walletList, walletChainType: "solana-only" });
    },
    [privyReady, authenticated, solanaWallets, login, connectWallet, installedWallets]
  );

  useEffect(() => {
    if (!pendingConnectOption || !privyReady) return;
    const option = pendingConnectOption;
    setPendingConnectOption(null);
    if (option === "email") {
      login(MINIMAL_LOGIN_OPTIONS);
      return;
    }
    connectForChain(option);
  }, [pendingConnectOption, privyReady, login, connectForChain, setPendingConnectOption]);

  const disconnect = useCallback(async () => {
    justDisconnectedRef.current = true;
    siwsAttemptedForRef.current = null;
    setSolBalance(null);
    setUsdcBalance(null);
    setForceDisconnected(true);
    setDisconnectedByUserFlag(); // so refresh stays disconnected
    try {
      await logout();
      clearPrivySessionStorage();
      setTimeout(clearPrivySessionStorage, 100);
    } catch (e) {
      setForceDisconnected(false);
      throw e;
    } finally {
      setTimeout(() => {
        justDisconnectedRef.current = false;
      }, 3000);
    }
  }, [logout]);

  const connectSolana = useCallback(async () => {
    if (!authenticated) {
      login(MINIMAL_LOGIN_OPTIONS);
      return;
    }
    connectWallet({
      walletList: getWalletListForSolana(installedWallets),
      walletChainType: "solana-only",
    });
  }, [authenticated, login, connectWallet, installedWallets]);

  const signTransaction = useCallback(
    async (transaction: unknown) => {
      if (!solanaWallet) throw new Error("No Solana wallet connected");
      const tx =
        transaction &&
        typeof (transaction as { serialize: () => Uint8Array }).serialize ===
          "function"
          ? (transaction as { serialize: () => Uint8Array }).serialize()
          : new Uint8Array(transaction as ArrayBuffer);
      const { signedTransaction } = await privySignTransaction({
        transaction: tx,
        wallet: solanaWallet,
      });
      return VersionedTransaction.deserialize(signedTransaction);
    },
    [solanaWallet, privySignTransaction]
  );

  const sendTransaction = useCallback(
    async (
      transaction: Transaction,
      options?: { skipPreflight?: boolean; maxRetries?: number }
    ) => {
      if (!solanaWallet || !publicKey) throw new Error("No Solana wallet connected");
      // Use "finalized" so the blockhash is on all RPC nodes (avoids "Blockhash not found" when load-balanced)
      const { blockhash } = await connection.getLatestBlockhash("finalized");
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      const serialized = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      const { signedTransaction } = await privySignTransaction({
        transaction: serialized,
        wallet: solanaWallet,
      });
      const sig = await connection.sendRawTransaction(
        new Uint8Array(signedTransaction),
        {
          skipPreflight: options?.skipPreflight ?? false,
          maxRetries: options?.maxRetries ?? 3,
          preflightCommitment: "finalized",
        }
      );
      return sig;
    },
    [solanaWallet, publicKey, privySignTransaction, connection]
  );

  const signMessage = useCallback(
    async (message: Uint8Array) => {
      if (!solanaWallet) throw new Error("No Solana wallet connected");
      const result = await privySignMessage({ message, wallet: solanaWallet });
      return typeof result === "object" && result?.signature
        ? new Uint8Array(result.signature as ArrayBuffer)
        : new Uint8Array(0);
    },
    [solanaWallet, privySignMessage]
  );

  const effectivelyDisconnected = forceDisconnected || (noPrivyTokenOnLoad && !noTokenOverriddenByConnect);
  const effectiveChain: "solana" | null = (() => {
    if (effectivelyDisconnected) return null;
    const solanaConnected = !!(authenticated && solanaWallets?.[0]);
    return solanaConnected ? "solana" : null;
  })();
  const contextValue: WalletContextState = useMemo(
    () => ({
      connection,
      connected: effectivelyDisconnected ? false : connected,
      connecting: effectivelyDisconnected ? false : connecting,
      address: effectivelyDisconnected ? null : address,
      shortAddress: effectivelyDisconnected ? null : shortAddress,
      solBalance,
      usdcBalance,
      network: "Solana Mainnet",
      connect,
      connectForChain,
      disconnect,
      signTransaction,
      sendTransaction,
      signMessage,
      publicKey: effectivelyDisconnected ? null : publicKey,
      connectSolana,
      openLoginModal,
      isPrivyMounted: true,
      requestConnect,
      effectiveChain,
    }),
    [
      forceDisconnected,
      noPrivyTokenOnLoad,
      noTokenOverriddenByConnect,
      effectivelyDisconnected,
      connection,
      connected,
      connecting,
      address,
      shortAddress,
      solBalance,
      usdcBalance,
      connect,
      connectForChain,
      disconnect,
      signTransaction,
      sendTransaction,
      signMessage,
      publicKey,
      connectSolana,
      openLoginModal,
      requestConnect,
      effectiveChain,
    ]
  );

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || "";
const PRIVY_CLIENT_ID = import.meta.env.VITE_PRIVY_CLIENT_ID || "";

const FALLBACK_WALLET_STATE: WalletContextState = {
  connection,
  connected: false,
  connecting: false,
  address: null,
  shortAddress: null,
  solBalance: null,
  usdcBalance: null,
  network: "Solana Mainnet",
  connect: async () => {},
  connectForChain: async () => {},
  disconnect: async () => {},
  signTransaction: async () => {
    throw new Error("Wallet not configured");
  },
  sendTransaction: async () => {
    throw new Error("Wallet not configured");
  },
  signMessage: async () => {
    throw new Error("Wallet not configured");
  },
  publicKey: null,
  connectSolana: async () => {},
  openLoginModal: () => {},
  isPrivyMounted: false,
  requestConnect: () => {},
  effectiveChain: null,
};

export const WalletContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Check before any clear: if no Privy token in storage at load (e.g. user cleared browser data), force disconnected until they connect again
  const [noPrivyTokenOnLoad] = useState(
    () => typeof window !== "undefined" && !hasPrivyTokenInStorage()
  );
  // Clear Privy session before mount when user previously disconnected (per Privy docs: logout clears session; we clear storage before Privy reads it on refresh)
  const [mountPrivy] = useState(() => {
    if (typeof window !== "undefined" && getDisconnectedByUserFlag()) {
      clearPrivySessionStorage();
      clearDisconnectedByUserFlag();
    }
    return !!PRIVY_APP_ID?.trim();
  });
  const [pendingConnectOption, setPendingConnectOption] =
    useState<ConnectOption | null>(null);

  const requestConnectWhenDeferred = useCallback((option: ConnectOption) => {
    setPendingConnectOption(option);
  }, []);

  if (!PRIVY_APP_ID?.trim()) {
    return (
      <WalletContext.Provider value={FALLBACK_WALLET_STATE}>
        {children}
      </WalletContext.Provider>
    );
  }

  if (!mountPrivy) {
    return (
      <WalletContext.Provider
        value={{
          ...FALLBACK_WALLET_STATE,
          isPrivyMounted: false,
          requestConnect: requestConnectWhenDeferred,
        }}
      >
        {children}
      </WalletContext.Provider>
    );
  }

  const installedWallets = useMemo(() => detectInstalledWallets(), []);
  const defaultWalletList = useMemo(
    () => getDefaultWalletList(installedWallets),
    [installedWallets]
  );

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      {...(PRIVY_CLIENT_ID ? { clientId: PRIVY_CLIENT_ID } : {})}
      config={{
        appearance: {
          walletChainType: "solana-only",
          walletList: defaultWalletList,
        },
        embeddedWallets: {
          solana: { createOnLogin: "users-without-wallets" },
        },
        externalWallets: {
          solana: {
            connectors: toSolanaWalletConnectors({ shouldAutoConnect: false }),
          },
        },
      }}
    >
      <WalletContextInner
        pendingConnectOption={pendingConnectOption}
        setPendingConnectOption={setPendingConnectOption}
        noPrivyTokenOnLoad={noPrivyTokenOnLoad}
        installedWallets={installedWallets}
      >
        {children}
      </WalletContextInner>
    </PrivyProvider>
  );
};

export default WalletContextProvider;
