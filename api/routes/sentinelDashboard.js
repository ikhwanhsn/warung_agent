import { stubRouter } from "../libs/stubExpress.js";

export async function createSentinelDashboardRouter() {
  return stubRouter("routes/sentinelDashboard");
}
