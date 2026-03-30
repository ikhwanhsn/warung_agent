/** Spend / proxy guardrails are not active in stub build. */
export class SentinelBudgetError extends Error {
  constructor(message) {
    super(message);
    this.name = "SentinelBudgetError";
  }
}

/**
 * @param {string} [_scope]
 * @returns {typeof fetch}
 */
export function getSentinelFetch(_scope) {
  return globalThis.fetch.bind(globalThis);
}
