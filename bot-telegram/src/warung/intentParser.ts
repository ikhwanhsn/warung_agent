import type { ParsedIntent, WarungIntentKind } from "./types.js";

// ─── Indonesian number word → digit mapping ─────────────────────────

const ID_NUMBER_MAP: Record<string, number> = {
  satu: 1, sebuah: 1,
  dua: 2,
  tiga: 3,
  empat: 4,
  lima: 5,
  enam: 6,
  tujuh: 7,
  delapan: 8,
  sembilan: 9,
  sepuluh: 10,
  sebelas: 11,
  selusin: 12,
};

const ID_NUMBER_WORDS = Object.keys(ID_NUMBER_MAP).join("|");
const ID_NUMBER_RE = new RegExp(`\\b(${ID_NUMBER_WORDS})\\b`, "i");

// ─── Indonesian ordinal → index mapping ─────────────────────────────

const ID_ORDINAL_MAP: Record<string, number> = {
  pertama: 1, kesatu: 1,
  kedua: 2,
  ketiga: 3,
  keempat: 4,
  kelima: 5,
  keenam: 6,
  ketujuh: 7,
  kedelapan: 8,
  kesembilan: 9,
  kesepuluh: 10,
};

const ID_ORDINAL_RE = new RegExp(
  `\\b(${Object.keys(ID_ORDINAL_MAP).join("|")})\\b`,
  "i",
);

export { ID_NUMBER_MAP, ID_NUMBER_RE, ID_ORDINAL_MAP, ID_ORDINAL_RE };

export function parseIndonesianNumber(word: string): number | null {
  return ID_NUMBER_MAP[word.trim().toLowerCase()] ?? null;
}

/**
 * Extract the first number (digit or Indonesian word) from free-form text.
 * Returns null when no number is found.
 */
export function extractNumberFromText(text: string): number | null {
  const t = text.trim().toLowerCase();
  const digitMatch = t.match(/\b(\d{1,2})\b/);
  if (digitMatch) {
    const n = parseInt(digitMatch[1], 10);
    if (n >= 1 && n <= 99) return n;
  }
  const wordMatch = t.match(ID_NUMBER_RE);
  if (wordMatch) return ID_NUMBER_MAP[wordMatch[1].toLowerCase()] ?? null;
  return null;
}

/**
 * Extract ordinal position from text: "yang kedua" → 2, "nomor 3" → 3.
 */
export function extractOrdinalFromText(text: string): number | null {
  const t = text.trim().toLowerCase();
  const nomorMatch = t.match(/\b(?:nomor|no\.?)\s*(\d{1,2})\b/);
  if (nomorMatch) return parseInt(nomorMatch[1], 10);
  const ordMatch = t.match(ID_ORDINAL_RE);
  if (ordMatch) return ID_ORDINAL_MAP[ordMatch[1].toLowerCase()] ?? null;
  return null;
}

/**
 * Quantity from natural phrases: "beli 3 pcs", "pesan tiga", "2 bungkus".
 * Prefer this over the first digit in text when user combines item name + purchase intent.
 */
export function extractPurchaseQuantity(text: string): number | null {
  const t = text.trim().toLowerCase();
  const afterVerb = t.match(/\b(?:beli|pesan|order|ambil)\s+(\d{1,2})\b/);
  if (afterVerb) {
    const n = parseInt(afterVerb[1], 10);
    if (n >= 1 && n <= 99) return n;
  }
  const pcs = t.match(/\b(\d{1,2})\s*(?:pcs?|buah|ikat|pack|bungkus|dus|box)\b/);
  if (pcs) {
    const n = parseInt(pcs[1], 10);
    if (n >= 1 && n <= 99) return n;
  }
  const xpat = t.match(/\b(\d{1,2})\s*x\b|\bx\s*(\d{1,2})\b/);
  if (xpat) {
    const n = parseInt(xpat[1] || xpat[2] || "", 10);
    if (n >= 1 && n <= 99) return n;
  }
  const wordAfterVerb = t.match(
    new RegExp(`\\b(?:beli|pesan|order|ambil)\\s+(${ID_NUMBER_WORDS})\\b`, "i"),
  );
  if (wordAfterVerb) {
    const n = ID_NUMBER_MAP[wordAfterVerb[1].toLowerCase()];
    if (n && n >= 1 && n <= 99) return n;
  }
  const wordQty = t.match(new RegExp(`\\b(${ID_NUMBER_WORDS})\\s*(?:pcs?|buah|ikat|pack|bungkus)\\b`, "i"));
  if (wordQty) {
    const n = ID_NUMBER_MAP[wordQty[1].toLowerCase()];
    if (n && n >= 1 && n <= 99) return n;
  }
  return null;
}

// ─── Intent-kind detection ──────────────────────────────────────────

function detectIntentKind(t: string): WarungIntentKind {
  if (/\b(kirim|antar|delivery|titip)\b/i.test(t)) return "send_item";
  if (/\b(beli|pesan|order|mau\s+beli|checkout|mau\s+pesan)\b/i.test(t)) {
    if (
      /\b(kopi|espresso|latte|cappuccino|americano|cold\s*brew|biji\s*kopi|kopi\s*bubuk|minuman|minum|es\s|teh|jus|susu|coklat|makan|nasi|apel|buah|snack|food|sayur|sembako|grocery|beras|indomie|mie\s|mi\s|instan|telur|roti|gula|garam|merica|bawang|minyak|kecap|cabai|wortel|kentang|bayam|kangkung|tomat|stroberi|strawberry|alpukat|matcha|keju|sarden|kacang|biskuit|tahu|tempe|jeruk|pir|ikan|ayam|daging)\b/i.test(
        t,
      )
    )
      return "buy_food";
    return "buy_product";
  }
  return "unknown";
}

// ─── Main parser ────────────────────────────────────────────────────

export function parseIntent(raw: string): ParsedIntent {
  const text = raw.trim();
  const t = text.toLowerCase();

  const intent = detectIntentKind(t);

  let quantity = 1;
  let quantityExplicit = false;

  // Strip known buy/send prefixes (longest match first to avoid partial strips)
  let rest = t
    .replace(
      /^\s*(saya\s+mau\s+beli|aku\s+mau\s+beli|mau\s+beli|saya\s+mau|aku\s+mau|beli|pesan|order|mau|checkout)\s+/i,
      "",
    )
    .replace(/^\s*(kirim|antar)\s+/i, "")
    .trim();

  // Trailing digit: "sarden 2"
  const qtyTail = rest.match(/\b(\d{1,2})\s*$/);
  if (qtyTail) {
    const n = parseInt(qtyTail[1], 10);
    if (Number.isFinite(n) && n >= 1) {
      quantity = Math.min(99, n);
      quantityExplicit = true;
    }
    rest = rest.replace(/\b\d{1,2}\s*$/, "").trim();
  }

  // Trailing Indonesian number word: "sarden dua"
  if (!quantityExplicit) {
    const wordTailRe = new RegExp(`\\b(${ID_NUMBER_WORDS})\\s*$`, "i");
    const wordTailMatch = rest.match(wordTailRe);
    if (wordTailMatch) {
      const n = ID_NUMBER_MAP[wordTailMatch[1].toLowerCase()];
      if (n) {
        quantity = n;
        quantityExplicit = true;
        rest = rest.slice(0, wordTailMatch.index).trim();
      }
    }
  }

  // Leading digit: "2 sarden"
  if (!quantityExplicit) {
    const qtyLead = rest.match(/^(\d{1,2})\s+/);
    if (qtyLead) {
      const n = parseInt(qtyLead[1], 10);
      if (Number.isFinite(n) && n >= 1) {
        quantity = Math.min(99, n);
        quantityExplicit = true;
        rest = rest.replace(/^\d{1,2}\s+/, "").trim();
      }
    }
  }

  // Leading Indonesian number word: "dua sarden"
  if (!quantityExplicit) {
    const wordLeadRe = new RegExp(`^(${ID_NUMBER_WORDS})\\s+`, "i");
    const wordLeadMatch = rest.match(wordLeadRe);
    if (wordLeadMatch && rest.length > wordLeadMatch[0].length) {
      const n = ID_NUMBER_MAP[wordLeadMatch[1].toLowerCase()];
      if (n) {
        quantity = n;
        quantityExplicit = true;
        rest = rest.slice(wordLeadMatch[0].length).trim();
      }
    }
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
    rest.length > 0 && !/^(yang|itu|ini)$/i.test(rest)
      ? rest.replace(/\s+/g, " ").trim()
      : null;

  const notes = /\b(tanpa\s+gula|pedas|extra)\b/i.test(t) ? text : null;

  return {
    intent,
    item,
    quantity: quantity < 1 ? 1 : quantity,
    quantityExplicit,
    location,
    budget,
    notes,
  };
}
