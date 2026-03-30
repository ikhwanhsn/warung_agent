import { stubRouter } from "../libs/stubExpress.js";

export async function createBrowserUseRouter() {
  return stubRouter("routes/browserUse");
}
