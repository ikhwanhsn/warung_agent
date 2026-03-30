import { stubRouter } from "../../libs/stubExpress.js";

export function createPredictionGameRouter() {
  return stubRouter("routes/prediction-game");
}
