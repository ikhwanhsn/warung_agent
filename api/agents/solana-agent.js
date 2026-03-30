import { stubRouter } from "../libs/stubExpress.js";

export async function createSolanaAgentRouter() {
  return stubRouter("agents/solana-agent");
}
