import { stubRouter } from "../libs/stubExpress.js";

export async function createAgentSignalRouter() {
  return stubRouter("agents/create-signal");
}
