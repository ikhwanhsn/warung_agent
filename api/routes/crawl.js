import { stubRouter } from "../libs/stubExpress.js";

export async function createCrawlRouter() {
  return stubRouter("routes/crawl");
}
