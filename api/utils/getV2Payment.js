import { loadX402Payment } from "./x402Payment.js";

/**
 * x402 V2 payment helpers for playground proxy and future paid paths.
 * @returns {Promise<{ requirePayment: Function, settlePaymentAndSetResponse: Function }>}
 */
export async function getV2Payment() {
  return loadX402Payment();
}
