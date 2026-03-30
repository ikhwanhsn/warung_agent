import { stubRouter } from "../../../libs/stubExpress.js";

export async function createTrendingJupiterRouter() {
  return stubRouter("routes/partner/jupiter/trending");
}
