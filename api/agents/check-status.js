import { stubRouter } from "../libs/stubExpress.js";

export async function createCheckStatusAgentRouter() {
  return stubRouter("agents/check-status");
}
