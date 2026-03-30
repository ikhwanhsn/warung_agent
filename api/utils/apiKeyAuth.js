/**
 * Optional API key gate when API_KEY or API_KEYS is set.
 *
 * @param {(req: import("express").Request) => boolean} shouldSkip
 */
export function requireApiKey(shouldSkip) {
  const single = (process.env.API_KEY || "").trim();
  const multi = (process.env.API_KEYS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const allowed = new Set(
    [...multi, ...(single ? [single] : [])].filter(Boolean),
  );

  if (allowed.size === 0) {
    return function apiKeyAuthDisabled(_req, _res, next) {
      next();
    };
  }

  return function apiKeyAuth(req, res, next) {
    if (shouldSkip(req)) return next();

    const fromHeader =
      (req.headers["x-api-key"] && String(req.headers["x-api-key"])) ||
      (req.headers["api-key"] && String(req.headers["api-key"])) ||
      (req.headers["authorization"] &&
        String(req.headers["authorization"]).replace(/^Bearer\s+/i, "")) ||
      "";

    const key = fromHeader.trim();
    if (!key || !allowed.has(key)) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Valid API key required (X-API-Key, api-key, or Authorization Bearer).",
      });
      return;
    }

    next();
  };
}
