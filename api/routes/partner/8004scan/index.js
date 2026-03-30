import { stubRouter } from "../../../libs/stubExpress.js";

export async function create8004scanRouter() {
  return stubRouter("routes/partner/8004scan");
}
