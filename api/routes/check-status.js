import { stubRouter } from "../libs/stubExpress.js";

export async function createCheckStatusRouter() {
  return stubRouter("routes/check-status");
}
