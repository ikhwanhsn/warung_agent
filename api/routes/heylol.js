import { stubRouter } from "../libs/stubExpress.js";

export async function createHeyLolRouter() {
  return stubRouter("routes/heylol");
}
