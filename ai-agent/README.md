# Warung Agent (UI)

Vite + React (TypeScript) agent interface, based on [syra_agent/ai-agent](https://github.com/ikhwanhsn/syra_agent/tree/main/ai-agent).

## This fork

- **Solana only** — Privy is configured with `walletChainType: "solana-only"`; Base / EVM wallet UI and agent-wallet paths are removed.
- **Privy** — email login + Solana wallets (Phantom, Solflare, detected wallets).
- **`api/`** — pair with the `../api` package for chat, agent wallet, marketplace routes.

## Run locally

```bash
cd ai-agent
npm install
# Repo root `.npmrc` / `ai-agent/.npmrc` sets legacy-peer-deps. If npm OOMs: NODE_OPTIONS=--max-old-space-size=8192 npm install
npm run dev
```

Env (typical): `VITE_PRIVY_APP_ID`, optional `VITE_PRIVY_CLIENT_ID`, `VITE_API_URL` / RPC as in `src/lib/chatApi.ts` and `WalletContext`.

| Script | Description |
|--------|-------------|
| `npm run build` / `npm run build:dev` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` / `npm run test:watch` | Tests |
| `npm run lint` | Lint |

## Tech stack

| Layer | Technology |
|-------|------------|
| Build | Vite, TypeScript |
| UI | React, shadcn-ui, Tailwind, Radix |
| Wallet | Privy (**Solana only** in this repo) |
