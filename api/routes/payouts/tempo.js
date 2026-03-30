import { stubRouter } from "../../libs/stubExpress.js";

export function createTempoPayoutRouter() {
  return stubRouter("routes/payouts/tempo");
}
