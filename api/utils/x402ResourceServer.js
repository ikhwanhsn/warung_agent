import { warmX402ResourceServer } from "./x402Payment.js";

/**
 * Best-effort eager init so the first x402 call does not wait on facilitator /supported.
 */
export async function ensureX402ResourceServerInitialized() {
  await warmX402ResourceServer();
}
