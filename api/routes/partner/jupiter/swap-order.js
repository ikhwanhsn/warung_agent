import { stubRouter } from "../../../libs/stubExpress.js";

export async function createJupiterSwapOrderRouter() {
  return stubRouter("routes/partner/jupiter/swap-order");
}
