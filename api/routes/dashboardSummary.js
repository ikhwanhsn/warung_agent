import { stubRouter } from "../libs/stubExpress.js";

export async function createDashboardSummaryRouterRegular() {
  return stubRouter("routes/dashboardSummary");
}
