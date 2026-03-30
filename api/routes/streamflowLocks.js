import { stubRouter } from "../libs/stubExpress.js";

export async function createStreamflowLocksRouter() {
  return stubRouter("routes/streamflowLocks");
}
