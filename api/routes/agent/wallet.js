import { stubRouter } from "../../libs/stubExpress.js";

export async function createAgentWalletRouter() {
  return stubRouter("routes/agent/wallet");
}
