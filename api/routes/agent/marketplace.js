import { stubRouter } from "../../libs/stubExpress.js";

export async function createAgentMarketplaceRouter() {
  return stubRouter("routes/agent/marketplace");
}
