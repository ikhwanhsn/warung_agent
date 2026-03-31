/** Main Warung chat app (Vite). Override in .env for production. */
export const WARUNG_APP_URL =
  process.env.NEXT_PUBLIC_WARUNG_APP_URL ?? "https://warungagent.fun";

/** Public documentation site. */
export const WARUNG_DOCS_URL =
  process.env.NEXT_PUBLIC_WARUNG_DOCS_URL ?? "https://docs.warungagent.fun/docs";

/** Public hosted AI agent app. */
export const WARUNG_AGENT_URL =
  process.env.NEXT_PUBLIC_WARUNG_AGENT_URL ?? "https://agent.warungagent.fun";

/** Telegram bot (opens in Telegram app or web). */
export const WARUNG_TELEGRAM_BOT_URL =
  process.env.NEXT_PUBLIC_WARUNG_TELEGRAM_BOT_URL ??
  "https://t.me/warungagent_bot";
