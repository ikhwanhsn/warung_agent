import { stubRouter } from "../libs/stubExpress.js";

export async function createInternalResearchRouter() {
  return stubRouter("routes/internalResearch");
}
