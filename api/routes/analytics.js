import { stubRouter } from "../libs/stubExpress.js";

export async function createAnalyticsRouter() {
  return stubRouter("routes/analytics");
}
