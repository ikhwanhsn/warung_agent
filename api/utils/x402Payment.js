/**
 * Bridges dynamic per-request payment (playground proxy) to @x402/express when configured.
 * Set X402_EVM_PAYTO and/or X402_SVM_PAYTO (and optional X402_FACILITATOR_URL) to enable.
 * If @x402 packages are missing or no payTo is set, payment checks are skipped (dev / recovery).
 */

/** @type {{ server: object | null, paymentMiddleware: Function | null } | null} */
let cached = null;

function priceToX402Price(price) {
  if (price == null) return "$0.01";
  const s = String(price).trim();
  if (s.startsWith("$")) return s;
  const n = Number(s);
  if (Number.isFinite(n)) return `$${n}`;
  return "$0.01";
}

async function loadCore() {
  const [{ paymentMiddleware, x402ResourceServer }, { HTTPFacilitatorClient }, { ExactEvmScheme }, { ExactSvmScheme }] =
    await Promise.all([
      import("@x402/express"),
      import("@x402/core/server"),
      import("@x402/evm/exact/server"),
      import("@x402/svm/exact/server"),
    ]);

  const facilitatorUrl =
    (process.env.X402_FACILITATOR_URL || "").trim() || "https://facilitator.x402.org";
  const facilitator = new HTTPFacilitatorClient({ url: facilitatorUrl });
  const server = new x402ResourceServer(facilitator);
  server.register("eip155:8453", new ExactEvmScheme());
  server.register("solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp", new ExactSvmScheme());
  return { paymentMiddleware, server };
}

async function getOrCreateX402() {
  if (cached) return cached;
  try {
    cached = await loadCore();
  } catch (err) {
    console.warn(
      "[x402] Payment packages unavailable or misconfigured; paid proxy bypass enabled:",
      err instanceof Error ? err.message : err,
    );
    cached = { server: null, paymentMiddleware: null };
  }
  return cached;
}

/**
 * Warm facilitator / schemes so the first paid request is faster.
 */
export async function warmX402ResourceServer() {
  await getOrCreateX402();
}

/**
 * @returns {Promise<{ requirePayment: (options: Record<string, unknown>) => import("express").RequestHandler, settlePaymentAndSetResponse: (res: import("express").Response, req: import("express").Request) => Promise<void> }>}
 */
export async function loadX402Payment() {
  const { paymentMiddleware, server } = await getOrCreateX402();

  /**
   * @param {Record<string, unknown>} options
   */
  function requirePayment(options) {
    const resource = String(options?.resource || "").trim() || "/api/playground-proxy";
    const method = String(options?.method || "POST").toUpperCase();
    const price = priceToX402Price(options?.price);
    const description = String(options?.description || "Payment required");
    const discoverable = options?.discoverable !== false;

    const evmPayTo = (process.env.X402_EVM_PAYTO || "").trim();
    const svmPayTo = (process.env.X402_SVM_PAYTO || "").trim();

    if ((!evmPayTo && !svmPayTo) || !paymentMiddleware || !server) {
      return async (_req, _res, next) => next();
    }

    /** @type {Record<string, unknown>} */
    const accepts = evmPayTo
      ? { scheme: "exact", price, network: "eip155:8453", payTo: evmPayTo }
      : { scheme: "exact", price, network: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp", payTo: svmPayTo };

    const routeKey = `${method} ${resource}`;
    const routes = {
      [routeKey]: {
        accepts,
        description,
        discoverable,
      },
    };

    return paymentMiddleware(routes, server, undefined, undefined, false);
  }

  /**
   * Legacy hook: @x402/express settles on response end when payment middleware runs.
   */
  async function settlePaymentAndSetResponse(_res, _req) {
    /* noop — settlement handled by middleware */
  }

  return { requirePayment, settlePaymentAndSetResponse };
}
