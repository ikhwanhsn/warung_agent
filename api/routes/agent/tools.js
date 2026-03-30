import { stubRouter } from "../../libs/stubExpress.js";

export async function createAgentToolsRouter() {
  return stubRouter("routes/agent/tools");
}
