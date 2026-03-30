import { stubRouter } from "../libs/stubExpress.js";

export async function createPlaygroundShareRouter() {
  return stubRouter("routes/playgroundShare");
}
