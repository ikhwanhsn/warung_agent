import { stubRouter } from "../../libs/stubExpress.js";

export async function createUserPromptsRouter() {
  return stubRouter("routes/agent/userPrompts");
}
