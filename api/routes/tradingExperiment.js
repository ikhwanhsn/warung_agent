import { stubRouter } from "../libs/stubExpress.js";

export function createTradingExperimentRouter() {
  return stubRouter("routes/tradingExperiment");
}
