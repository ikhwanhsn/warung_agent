import { stubRouter } from "../../../libs/stubExpress.js";

export async function createXApiRouter() {
  return stubRouter("routes/partner/x-api");
}
