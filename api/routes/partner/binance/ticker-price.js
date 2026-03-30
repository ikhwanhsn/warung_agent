import { stubRouter } from "../../../libs/stubExpress.js";

export async function createBinanceTickerPriceRouter() {
  return stubRouter("routes/partner/binance/ticker-price");
}
