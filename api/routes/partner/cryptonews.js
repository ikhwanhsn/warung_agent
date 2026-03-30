import { stubRouter } from "../../libs/stubExpress.js";

export async function createCryptonewsRouter() {
  return stubRouter("routes/partner/cryptonews (mount /)");
}

export async function createNewsRouterRegular() {
  return stubRouter("routes/partner/cryptonews (preview news)");
}

export async function createSentimentRouterRegular() {
  return stubRouter("routes/partner/cryptonews (preview sentiment)");
}
