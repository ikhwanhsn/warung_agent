import { stubRouter } from "../../../libs/stubExpress.js";

export async function createSmartMoneyRouter() {
  return stubRouter("routes/partner/nansen/smart-money");
}
