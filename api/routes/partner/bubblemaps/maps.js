import { stubRouter } from "../../../libs/stubExpress.js";

export async function createBubblemapsMapsRouter() {
  return stubRouter("routes/partner/bubblemaps/maps");
}
