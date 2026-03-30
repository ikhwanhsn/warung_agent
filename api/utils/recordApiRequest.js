/**
 * Fire-and-forget request insight hook (optional DB wiring later).
 * @param {import("express").Request} _req
 * @param {import("express").Response} _res
 * @param {number} _durationMs
 * @param {{ paid?: boolean }} _meta
 */
export function recordApiRequest(_req, _res, _durationMs, _meta) {
  /* intentionally empty */
}
