import { stubRouter } from "../../libs/stubExpress.js";

export async function createMppV1Router() {
  return stubRouter("routes/mpp/v1");
}
