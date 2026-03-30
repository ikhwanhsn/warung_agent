import { stubRouter } from "../libs/stubExpress.js";

export async function createExaSearchRouter() {
  return stubRouter("routes/exa-search");
}
