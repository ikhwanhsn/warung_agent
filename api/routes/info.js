import { stubRouter } from "../libs/stubExpress.js";

export async function createInfoRouter() {
  return stubRouter("routes/info");
}
