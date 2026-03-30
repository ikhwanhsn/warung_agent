import type { ParsedIntent, WarungIntentKind } from "./types";

function detectIntentKind(t: string): WarungIntentKind {
  if (/\b(kirim|antar|delivery|titip)\b/i.test(t)) return "send_item";
  if (/\b(beli|pesan|order|mau\s+beli|checkout)\b/i.test(t)) {
    if (
      /\b(kopi|minuman|minum|es\s|teh|jus|makan|nasi|apel|buah|snack|food|sayur|beras|indomie|mi\s|telur|roti|gula|minyak|kecap|cabai|wortel|kentang|bayam|stroberi|strawberry|alpukat|matcha)\b/i.test(
        t
      )
    )
      return "buy_food";
    return "buy_product";
  }
  return "unknown";
}

/**
 * Rule-based intent extraction for Indonesian / casual commerce phrases.
 */
export function parseIntent(raw: string): ParsedIntent {
  const text = raw.trim();
  const t = text.toLowerCase();

  const intent = detectIntentKind(t);

  let quantity = 1;
  let rest = t
    .replace(/^\s*(beli|pesan|order|mau\s+beli|mau|checkout)\s+/i, "")
    .replace(/^\s*(kirim|antar)\s+/i, "")
    .trim();

  const qtyTail = rest.match(/\b(\d{1,2})\s*$/);
  if (qtyTail) {
    const n = parseInt(qtyTail[1], 10);
    if (Number.isFinite(n) && n >= 1) quantity = Math.min(99, n);
    rest = rest.replace(/\b\d{1,2}\s*$/, "").trim();
  }

  const locationMatch = t.match(/\b(di|ke|dari)\s+([a-z0-9\s]{2,40})/i);
  const location = locationMatch ? locationMatch[2].trim() : null;

  const budgetMatch = t.match(/(?:budget|maks|max)\s*(?:rp\.?|rp)?\s*([\d.]+)\s*k?/i);
  let budget: number | null = null;
  if (budgetMatch) {
    const num = parseFloat(budgetMatch[1].replace(/\./g, ""));
    if (Number.isFinite(num)) budget = t.includes("k") ? num * 1000 : num;
  }

  const item =
    rest.length > 0 && !/^(yang|itu|ini|satu|dua|tiga)$/i.test(rest)
      ? rest.replace(/\s+/g, " ").trim()
      : null;

  const notes = /\b(tanpa\s+gula|pedas|extra)\b/i.test(t) ? text : null;

  return {
    intent,
    item,
    quantity: quantity < 1 ? 1 : quantity,
    location,
    budget,
    notes,
  };
}
