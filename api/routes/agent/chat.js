import { stubRouter } from "../../libs/stubExpress.js";

export async function createAgentChatRouter() {
  return stubRouter("routes/agent/chat");
}
