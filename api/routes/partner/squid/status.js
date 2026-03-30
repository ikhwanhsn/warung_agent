import { stubRouter } from "../../../libs/stubExpress.js";

export async function createSquidStatusRouter() {
  return stubRouter("routes/partner/squid/status");
}
