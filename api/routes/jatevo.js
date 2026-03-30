import { stubRouter } from "../libs/stubExpress.js";

export async function createJatevoRouter() {
  return stubRouter("routes/jatevo");
}
