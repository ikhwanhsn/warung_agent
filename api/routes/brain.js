import { stubRouter } from "../libs/stubExpress.js";

export async function createBrainRouter() {
  return stubRouter("routes/brain");
}
