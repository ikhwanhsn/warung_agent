/**
 * Trusted browser origins: inject server API key so clients never embed it.
 * Uses the same key as API_KEY (first key if API_KEYS is set).
 */
const TRUSTED_ORIGIN_SUFFIXES = [
  "syraa.fun",
  "vercel.app",
  "localhost",
  "127.0.0.1",
];

function isTrustedOrigin(origin) {
  if (!origin || typeof origin !== "string") return false;
  try {
    const u = new URL(origin);
    const host = u.hostname.toLowerCase();
    return TRUSTED_ORIGIN_SUFFIXES.some(
      (s) => host === s || host.endsWith(`.${s}`),
    );
  } catch {
    return false;
  }
}

function pickInjectKey() {
  const single = (process.env.API_KEY || "").trim();
  if (single) return single;
  const first = (process.env.API_KEYS || "").split(",")[0]?.trim();
  return first || "";
}

export function injectTrustedOriginApiKey(req, _res, next) {
  const origin = req.headers.origin;
  if (!isTrustedOrigin(typeof origin === "string" ? origin : "")) {
    next();
    return;
  }

  const key = pickInjectKey();
  if (!key) {
    next();
    return;
  }

  const hasKey =
    req.headers["x-api-key"] ||
    req.headers["api-key"] ||
    (req.headers.authorization &&
      /^Bearer\s+\S+$/i.test(String(req.headers.authorization)));

  if (!hasKey) {
    req.headers["x-api-key"] = key;
  }

  next();
}
