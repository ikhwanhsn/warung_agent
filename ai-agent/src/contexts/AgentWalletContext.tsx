import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { PublicKey } from "@solana/web3.js";
import { useWalletContext } from "@/contexts/WalletContext";
import { toast } from "sonner";
import { agentWalletApi } from "@/lib/chatApi";

const STORAGE_KEY = "warung_agent_anonymous_id";
const LAMPORTS_PER_SOL = 1e9;
const USDC_MINT_MAINNET = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

/** Fetch agent wallet SOL + USDC from chain (same way as user wallet in WalletNav). */
async function fetchAgentBalanceFromChain(
  connection: import("@solana/web3.js").Connection,
  agentAddress: string
): Promise<{ solBalance: number; usdcBalance: number }> {
  const pubkey = new PublicKey(agentAddress);
  const [solLamports, tokenAccounts] = await Promise.all([
    connection.getBalance(pubkey, "confirmed"),
    connection.getParsedTokenAccountsByOwner(pubkey, { mint: USDC_MINT_MAINNET }),
  ]);
  const solBalance = solLamports / LAMPORTS_PER_SOL;
  const accounts = tokenAccounts?.value ?? (Array.isArray(tokenAccounts) ? tokenAccounts : []);
  const usdcBalance = accounts.reduce((sum, acc) => {
    const ui = acc?.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
    return sum + (Number(ui) || 0);
  }, 0);
  return { solBalance, usdcBalance };
}

export interface AgentWalletState {
  ready: boolean;
  anonymousId: string | null;
  agentAddress: string | null;
  agentShortAddress: string | null;
  agentSolBalance: number | null;
  agentUsdcBalance: number | null;
  /** User avatar URL generated when wallet was created */
  avatarUrl: string | null;
  /** Connected user wallet address (Solana), used for agent wallet */
  connectedWalletAddress: string | null;
  connectedWalletShort: string | null;
  /** Always `solana` when a wallet is linked; otherwise null. */
  connectedChain: "solana" | null;
  /** Transient: amount just debited (for -$X.XX effect); cleared after animation */
  lastDebitUsd: number | null;
  /** Refetch SOL/USDC balance (e.g. after a tool call). */
  refetchBalance: () => Promise<void>;
  /** Fetch current agent wallet balances from chain (same as dropdown). Use before completion so chat sees correct balance. */
  getAgentWalletBalances: () => Promise<{ usdcBalance: number; solBalance: number } | null>;
  /** Show debit effect (e.g. -0.01) then clear after a short delay. */
  reportDebit: (amountUsd: number) => void;
  /** Update avatar URL in real-time (e.g. after generating new avatar). */
  updateAvatarUrl: (newAvatarUrl: string | null) => void;
}

const AgentWalletContext = createContext<AgentWalletState | null>(null);

function AgentWalletContextInner({ children }: { children: ReactNode }) {
  const { connection, address: solanaAddress, effectiveChain } = useWalletContext();
  const connectedWalletAddress =
    effectiveChain === "solana" && solanaAddress ? solanaAddress : null;
  const connectedChain: "solana" | null = connectedWalletAddress ? "solana" : null;

  const [ready, setReady] = useState(false);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [agentAddress, setAgentAddress] = useState<string | null>(null);
  const [agentSolBalance, setAgentSolBalance] = useState<number | null>(null);
  const [agentUsdcBalance, setAgentUsdcBalance] = useState<number | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [lastDebitUsd, setLastDebitUsd] = useState<number | null>(null);
  const initRef = useRef(false);
  const debitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refetchTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const pendingWelcomeRef = useRef(false);
  const [pendingWelcomeFunding, setPendingWelcomeFunding] = useState(false);

  useEffect(() => {
    if (connectedWalletAddress && connectedChain === "solana") {
      setReady(false);
      pendingWelcomeRef.current = false;
      setPendingWelcomeFunding(false);
      agentWalletApi
        .getOrCreateByWallet(connectedWalletAddress, "solana")
        .then(async (res) => {
          const { anonymousId: id, agentAddress: addr, avatarUrl: avatar, isNewWallet, fundingSuccess, fundingError, fundingPending } = res;
          setAnonymousId(id);
          setAgentAddress(addr);
          setAvatarUrl(avatar || null);
          try {
            const { solBalance, usdcBalance } = await fetchAgentBalanceFromChain(connection, addr);
            setAgentSolBalance(solBalance);
            setAgentUsdcBalance(usdcBalance);
          } catch {
            setAgentSolBalance((prev) => prev);
            setAgentUsdcBalance((prev) => prev);
          }
          if (isNewWallet === true) {
            if (fundingPending === true) {
              pendingWelcomeRef.current = true;
              setPendingWelcomeFunding(true);
              toast.info("Setting up your $1 credit…", { duration: 4000 });
            } else if (fundingSuccess === true) {
              toast.success("Welcome! You received $1 free ($0.50 SOL + $0.50 USDC) for testing.");
            } else if (fundingSuccess === false) {
              try {
                const { solBalance, usdcBalance } = await fetchAgentBalanceFromChain(connection, addr);
                setAgentSolBalance(solBalance);
                setAgentUsdcBalance(usdcBalance);
                if (usdcBalance > 0 || solBalance > 0) {
                  toast.success("Your free $1 was added. Balance updated.");
                } else {
                  const reason = fundingError || "Treasury or network issue.";
                  toast.error(`Free $1 could not be added. ${reason} You can still deposit to your agent wallet.`, { duration: 8000 });
                }
              } catch {
                const reason = fundingError || "Treasury or network issue.";
                toast.error(`Free $1 could not be added. ${reason} You can still deposit to your agent wallet.`, { duration: 8000 });
              }
            }
          }
        })
        .catch(() => {})
        .finally(() => setReady(true));
      return;
    }

    pendingWelcomeRef.current = false;
    setPendingWelcomeFunding(false);
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    let id = stored?.trim() || null;
    if (!id) {
      id =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `anon-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      if (typeof localStorage !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, id);
        } catch {
          // ignore (e.g. private mode)
        }
      }
    }
    if (id) {
      setAnonymousId(id);
      setReady(true);
      initRef.current = true;
      agentWalletApi
        .getOrCreate(id)
        .then(async (res) => {
          const { agentAddress: addr, avatarUrl: avatar } = res;
          setAgentAddress(addr);
          setAvatarUrl(avatar || null);
          try {
            const { solBalance, usdcBalance } = await fetchAgentBalanceFromChain(connection, addr);
            setAgentSolBalance(solBalance);
            setAgentUsdcBalance(usdcBalance);
          } catch {
            setAgentSolBalance(null);
            setAgentUsdcBalance(null);
          }
        })
        .catch(() => {
          setAgentAddress(null);
          setAgentSolBalance(null);
          setAgentUsdcBalance(null);
        });
    } else {
      setReady(false);
      agentWalletApi
        .getOrCreate()
        .then(async (res) => {
          const { anonymousId: newId, agentAddress: addr, avatarUrl: avatar, isNewWallet, fundingSuccess, fundingError, fundingPending } = res;
          if (typeof localStorage !== "undefined") {
            localStorage.setItem(STORAGE_KEY, newId);
          }
          setAnonymousId(newId);
          setAgentAddress(addr);
          setAvatarUrl(avatar || null);
          if (isNewWallet === true) {
            if (fundingPending === true) {
              pendingWelcomeRef.current = true;
              setPendingWelcomeFunding(true);
              toast.info("Setting up your $1 credit…", { duration: 4000 });
            } else if (fundingSuccess === true) {
              toast.success("You received $1 free ($0.50 SOL + $0.50 USDC) for testing.");
            } else if (fundingSuccess === false) {
              try {
                const { solBalance, usdcBalance } = await fetchAgentBalanceFromChain(connection, addr);
                setAgentSolBalance(solBalance);
                setAgentUsdcBalance(usdcBalance);
                if (usdcBalance > 0 || solBalance > 0) {
                  toast.success("Your free $1 was added. Balance updated.");
                } else {
                  toast.error(`Free $1 could not be added. ${fundingError || "Try again or deposit manually."}`, { duration: 8000 });
                }
              } catch {
                toast.error(`Free $1 could not be added. ${fundingError || "Try again or deposit manually."}`, { duration: 8000 });
              }
            }
          }
        })
        .catch(() => {
          setAnonymousId(null);
          setAgentAddress(null);
          setAvatarUrl(null);
        })
        .finally(() => {
          initRef.current = true;
          setReady(true);
        });
    }
  }, [connectedWalletAddress, connectedChain, connection]);

  const refetchBalance = useCallback(async () => {
    if (!agentAddress) return;
    try {
      const { solBalance: sol, usdcBalance: usdc } = await fetchAgentBalanceFromChain(connection, agentAddress);
      setAgentSolBalance(sol);
      setAgentUsdcBalance(usdc);
    } catch {
      setAgentSolBalance((prev) => prev);
      setAgentUsdcBalance((prev) => prev);
    }
  }, [agentAddress, connection]);

  const getAgentWalletBalances = useCallback(async (): Promise<{ usdcBalance: number; solBalance: number } | null> => {
    if (!agentAddress) return null;
    try {
      return await fetchAgentBalanceFromChain(connection, agentAddress);
    } catch {
      return null;
    }
  }, [agentAddress, connection]);

  useEffect(() => {
    if (!agentAddress) return;
    let cancelled = false;
    const pollMs = pendingWelcomeFunding ? 3000 : 30000;
    function fetchBalance() {
      fetchAgentBalanceFromChain(connection, agentAddress!)
        .then(({ solBalance: sol, usdcBalance: usdc }) => {
          if (!cancelled) {
            setAgentSolBalance(sol);
            setAgentUsdcBalance(usdc);
            if ((sol > 0 || usdc > 0) && pendingWelcomeRef.current) {
              pendingWelcomeRef.current = false;
              setPendingWelcomeFunding(false);
              toast.success("Welcome! You received $1 free ($0.50 SOL + $0.50 USDC) for testing.");
            }
          }
        })
        .catch(() => {
          if (!cancelled) {
            setAgentSolBalance((prev) => prev);
            setAgentUsdcBalance((prev) => prev);
          }
        });
    }
    fetchBalance();
    const interval = setInterval(fetchBalance, pollMs);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [agentAddress, connection, pendingWelcomeFunding]);

  const reportDebit = useCallback(
    (amountUsd: number) => {
      if (debitTimeoutRef.current) clearTimeout(debitTimeoutRef.current);
      refetchTimeoutsRef.current.forEach((t) => clearTimeout(t));
      refetchTimeoutsRef.current = [];
      setLastDebitUsd(amountUsd);
      setAgentUsdcBalance((prev) =>
        prev != null ? Math.max(0, prev - amountUsd) : null
      );
      refetchBalance();
      refetchTimeoutsRef.current = [
        setTimeout(refetchBalance, 2000),
        setTimeout(refetchBalance, 5000),
      ];
      debitTimeoutRef.current = setTimeout(() => {
        setLastDebitUsd(null);
        debitTimeoutRef.current = null;
      }, 2800);
    },
    [refetchBalance]
  );

  useEffect(
    () => () => {
      if (debitTimeoutRef.current) clearTimeout(debitTimeoutRef.current);
      refetchTimeoutsRef.current.forEach((t) => clearTimeout(t));
      refetchTimeoutsRef.current = [];
    },
    []
  );

  const agentShortAddress = agentAddress
    ? `${agentAddress.slice(0, 4)}...${agentAddress.slice(-4)}`
    : null;

  const connectedWalletShort = connectedWalletAddress
    ? `${connectedWalletAddress.slice(0, 4)}...${connectedWalletAddress.slice(-4)}`
    : null;

  const updateAvatarUrl = useCallback((newAvatarUrl: string | null) => {
    setAvatarUrl(newAvatarUrl);
  }, []);

  const value = useMemo<AgentWalletState>(
    () => ({
      ready,
      anonymousId,
      agentAddress,
      agentShortAddress,
      agentSolBalance,
      agentUsdcBalance,
      avatarUrl,
      connectedWalletAddress,
      connectedWalletShort,
      connectedChain,
      lastDebitUsd,
      refetchBalance,
      getAgentWalletBalances,
      reportDebit,
      updateAvatarUrl,
    }),
    [
      ready,
      anonymousId,
      agentAddress,
      agentShortAddress,
      agentSolBalance,
      agentUsdcBalance,
      avatarUrl,
      connectedWalletAddress,
      connectedWalletShort,
      connectedChain,
      lastDebitUsd,
      refetchBalance,
      getAgentWalletBalances,
      reportDebit,
      updateAvatarUrl,
    ]
  );

  return (
    <AgentWalletContext.Provider value={value}>{children}</AgentWalletContext.Provider>
  );
}

export function useAgentWallet(): AgentWalletState {
  const ctx = useContext(AgentWalletContext);
  if (!ctx) throw new Error("useAgentWallet must be used within AgentWalletProvider");
  return ctx;
}

export function AgentWalletProvider({ children }: { children: ReactNode }) {
  return <AgentWalletContextInner>{children}</AgentWalletContextInner>;
}
