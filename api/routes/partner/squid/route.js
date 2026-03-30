import { stubRouter } from "../../../libs/stubExpress.js";

export async function createSquidRouteRouter() {
  return stubRouter("routes/partner/squid/route");
}
