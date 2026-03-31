function isLocalUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

function resolvePublicUrl(envValue: string | undefined, fallback: string): string {
  const trimmed = envValue?.trim();
  if (!trimmed) return fallback;
  return isLocalUrl(trimmed) ? fallback : trimmed;
}

/** Main Warung chat app (Vite). Override in .env for production. */
export const WARUNG_APP_URL = resolvePublicUrl(
  process.env.NEXT_PUBLIC_WARUNG_APP_URL,
  "https://warungagent.fun",
);

/** Public documentation site. */
export const WARUNG_DOCS_URL = resolvePublicUrl(
  process.env.NEXT_PUBLIC_WARUNG_DOCS_URL,
  "https://docs.warungagent.fun/docs",
);

/** Public hosted AI agent app. */
export const WARUNG_AGENT_URL = resolvePublicUrl(
  process.env.NEXT_PUBLIC_WARUNG_AGENT_URL,
  "https://agent.warungagent.fun",
);

/** Telegram bot (opens in Telegram app or web). */
export const WARUNG_TELEGRAM_BOT_URL = resolvePublicUrl(
  process.env.NEXT_PUBLIC_WARUNG_TELEGRAM_BOT_URL,
  "https://t.me/warungagent_bot",
);
