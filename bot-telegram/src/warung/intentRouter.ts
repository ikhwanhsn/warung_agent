import { parseIntent } from "./intentParser.js";
import { isGreeting } from "./scopeGuard.js";

export type RoutedIntent =
  | "help"
  | "history"
  | "reset"
  | "greeting"
  | "commerce"
  | "catalog_question"
  | "unknown";

export interface IntentRouteResult {
  route: RoutedIntent;
  confidence: number;
  reason: string;
}

const CATALOG_QUESTION_HINT =
  /\b(apa\s+saja|apa aja|ada|stok|tersedia|menu|list|daftar|pilihan|jenis|varian|jual|punya|barang|produk|katalog)\b/i;

export function routeUserIntent(textRaw: string): IntentRouteResult {
  const text = textRaw.trim();
  const lower = text.toLowerCase();

  if (!text) {
    return { route: "unknown", confidence: 1, reason: "empty_input" };
  }
  if (lower === "/help" || /^help$/i.test(lower)) {
    return { route: "help", confidence: 1, reason: "help_command_or_keyword" };
  }
  if (lower === "/history" || /\briwayat\b/i.test(lower)) {
    return { route: "history", confidence: 0.98, reason: "history_keyword" };
  }
  if (lower === "/reset") {
    return { route: "reset", confidence: 1, reason: "reset_command" };
  }
  if (isGreeting(text)) {
    return { route: "greeting", confidence: 0.95, reason: "greeting_pattern" };
  }

  const parsed = parseIntent(text);
  if (parsed.intent !== "unknown") {
    return { route: "commerce", confidence: 0.9, reason: "parser_detected_commerce_intent" };
  }
  if (CATALOG_QUESTION_HINT.test(text)) {
    return { route: "catalog_question", confidence: 0.8, reason: "catalog_question_pattern" };
  }
  return { route: "unknown", confidence: 0.5, reason: "fallback_unknown" };
}
