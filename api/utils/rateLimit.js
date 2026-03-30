/**
 * In-memory rate limiter (dual-window when strict: burst + sustained).
 * Keyed by req.ip (set trust proxy when behind a reverse proxy).
 *
 * @param {{
 *   windowMs?: number,
 *   max?: number,
 *   burstWindowMs?: number,
 *   burstMax?: number,
 *   strict?: boolean,
 *   skip?: (req: import("express").Request) => boolean,
 * }} opts
 */
export default function rateLimit(opts = {}) {
  const windowMs = Number(opts.windowMs) > 0 ? Number(opts.windowMs) : 60_000;
  const max = Number(opts.max) > 0 ? Number(opts.max) : 100;
  const strict = opts.strict === true;
  const burstWindowMs =
    strict && Number(opts.burstWindowMs) > 0 ? Number(opts.burstWindowMs) : 0;
  const burstMax = strict && Number(opts.burstMax) > 0 ? Number(opts.burstMax) : 0;
  const skip = typeof opts.skip === "function" ? opts.skip : () => false;

  /** @type {Map<string, { windowStart: number, count: number, burstStart: number, burstCount: number }>} */
  const buckets = new Map();

  function getKey(req) {
    const ip =
      (typeof req.ip === "string" && req.ip) ||
      req.socket?.remoteAddress ||
      "unknown";
    return ip;
  }

  return function rateLimitMiddleware(req, res, next) {
    if (skip(req)) return next();

    const key = getKey(req);
    const now = Date.now();
    let b = buckets.get(key);
    if (!b) {
      b = { windowStart: now, count: 0, burstStart: now, burstCount: 0 };
      buckets.set(key, b);
    }

    if (now - b.windowStart >= windowMs) {
      b.windowStart = now;
      b.count = 0;
    }
    if (burstWindowMs > 0 && now - b.burstStart >= burstWindowMs) {
      b.burstStart = now;
      b.burstCount = 0;
    }

    b.count += 1;
    if (burstWindowMs > 0) b.burstCount += 1;

    if (
      burstWindowMs > 0 &&
      burstMax > 0 &&
      b.burstCount > burstMax
    ) {
      res.setHeader("Retry-After", String(Math.ceil(burstWindowMs / 1000)));
      res.status(429).json({
        success: false,
        error: "Too many requests (burst limit)",
      });
      return;
    }

    if (b.count > max) {
      res.setHeader("Retry-After", String(Math.ceil(windowMs / 1000)));
      res.status(429).json({
        success: false,
        error: "Too many requests",
      });
      return;
    }

    next();
  };
}
