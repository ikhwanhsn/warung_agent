import { stubRouter } from "../../../libs/stubExpress.js";

export async function createQuicknodeRouter() {
  return stubRouter("routes/partner/quicknode");
}
