import { stubRouter } from "../libs/stubExpress.js";

export async function createSignalRouterRegular() {
  return stubRouter("routes/signal (preview)");
}

export async function createSignalRouter() {
  return stubRouter("routes/signal (x402)");
}
