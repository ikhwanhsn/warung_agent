import { stubRouter } from "../../../libs/stubExpress.js";

export async function createTokenGodModeRouter() {
  return stubRouter("routes/partner/nansen/token-god-mode");
}
