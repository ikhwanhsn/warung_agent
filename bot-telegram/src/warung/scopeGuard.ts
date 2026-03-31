import type { ParsedIntent, WarungAssistantPayload } from "./types.js";
import { WARUNG_TAGLINE_ID } from "./copy.js";

// ─── Greeting patterns ─────────────────────────────────────────────

/** Common Indonesian spelling "hallo" (double L) must match — users rarely type exact "halo". */
const GREETING_RE =
  /^(hi|halo|hallo|hai|hei|hello|hey|howdy|p|ping|test|tes|yo|hei bot|halo bot|hallo bot|hi bot)\b/i;

/** "Who is this" / intro — reset shopping and answer warmly, not search catalog. */
const IDENTITY_INTRO_RE =
  /^(halo|hallo|hai|hei|hi|hello)[\s,]*\s*(siapa|kamu|ini|itu|apa|what|who)\b/i;
const IDENTITY_SHORT_RE = /^(siapa|kamu)\s+(ini|kamu|siapa|itu)\b/i;

const SHOPPING_KEYWORD_IN_GREETING =
  /\b(kopi|beli|pesan|order|checkout|indomie|beras|telur|sayur|mie|roti|kecap|ayam|ikan|buah|daging|susu|tahu|tempe|sarden|minuman|grocery|espresso|latte|cappuccino|sembako|warung)\b/i;

function looksLikeShoppingMixedWithGreeting(t: string): boolean {
  return SHOPPING_KEYWORD_IN_GREETING.test(t);
}

/** True for hi/hallo + identity chitchat ("hallo, siapa ini") — not a product search. */
export function isSocialIntroMessage(text: string): boolean {
  const t = text.trim();
  if (!t || t.length > 80) return false;
  if (looksLikeShoppingMixedWithGreeting(t)) return false;
  if (IDENTITY_SHORT_RE.test(t)) return true;
  if (IDENTITY_INTRO_RE.test(t)) return true;
  return false;
}

/** True when the message is a pure social greeting or intro (no shopping mixed in). */
export function isGreeting(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isSocialIntroMessage(t)) return true;
  if (t.length > 40) return false;
  if (!GREETING_RE.test(t)) return false;
  if (looksLikeShoppingMixedWithGreeting(t)) return false;
  return true;
}

export function greetingResponse(): WarungAssistantPayload {
  return {
    content: `Halo, aku Warung Agent. Aku bantu belanja kopi dan kebutuhan warung lewat chat di Telegram.

Bisa cari barang kayak kopi, mie, beras, sayur, atau buah. Bisa juga lihat toko terdekat dengan perkiraan harga dan jarak. Kalau sudah cocok, checkout di sini dan bayar pakai QRIS. Ada pertanyaan soal kopi atau grocery juga boleh.

Tulis saja yang kamu butuh, misalnya beli indomie, kopi latte dua, yang paling murah, atau apa beda arabica sama robusta.`,
  };
}

// ─── Out-of-scope shopping ──────────────────────────────────────────

const ELECTRONICS =
  /\b(laptop|notebook|handphone|hp|smartphone|iphone|ipad|android\s*phone|tablet|televisi|tv\s*led|kamera|drone|headset|earphone|airpods|ps5|playstation|xbox|monitor|pc\s+gaming|macbook|smartwatch)\b/i;

const TRAVEL_HOSPITALITY =
  /\b(tiket\s+pesawat|tiket\s+kereta|booking\s+hotel|pesan\s+hotel|villa\b|penginapan|paket\s+wisata|liburan\s+ke|tour\s+travel|boarding\s+pass)\b/i;

const VEHICLE_PROPERTY =
  /\b(beli\s+motor|beli\s+mobil|sewa\s+mobil|rental\s+mobil|jual\s+rumah|beli\s+rumah|kpr\b|apartemen\s+dijual)\b/i;

const FINANCE_DIGITAL = /\b(saham\b|crypto|bitcoin|ethereum|forex\b|nft\b|token\s+coin)\b/i;

const MARKETPLACE_APPS =
  /\b(pesan\s+gojek|order\s+grab|grab\s+car|tokopedia|shopee|lazada|bukalapak|marketplace\s+online)\b/i;

export function isOutOfScopeShoppingRequest(userText: string, intent: ParsedIntent): boolean {
  const wants =
    intent.intent === "buy_food" ||
    intent.intent === "buy_product" ||
    intent.intent === "send_item";
  if (!wants) return false;
  const hay = `${userText} ${intent.item ?? ""}`;
  return (
    ELECTRONICS.test(hay) ||
    TRAVEL_HOSPITALITY.test(hay) ||
    VEHICLE_PROPERTY.test(hay) ||
    FINANCE_DIGITAL.test(hay) ||
    MARKETPLACE_APPS.test(hay)
  );
}

export function isNonCommerceMessage(userText: string, intent: ParsedIntent): boolean {
  if (intent.intent !== "unknown") return false;
  const t = userText.trim();
  const lower = t.toLowerCase();
  if (lower.length < 2) return false;

  // Greetings are handled separately with a warm response — don't reject them here.
  if (isGreeting(t)) return false;

  if (/^(apa kabar|apa\s+kabar|gimana kabar|how are you)/i.test(lower)) return true;
  if (/\b(cuaca|weather|prakiraan\s+cuaca)\b/i.test(lower)) return true;
  if (/\b(siapa\s+itu|siapa\s+presiden|kapan\s+pemilu|berita\s+terbaru)\b/i.test(lower)) return true;

  if (
    /\b(bagaimana cara|gimana cara|apa itu|jelaskan tentang|kenapa bisa|mengapa\b|tolong jelaskan)\b/i.test(
      lower,
    )
  ) {
    if (
      /\b(kopi|beli|pesan|grocery|warung|checkout|indomie|beras|sayur|harga|bayar|telur|minuman|sembako)\b/i.test(
        lower,
      )
    ) {
      return false;
    }
    return true;
  }

  return false;
}

export function clarifyOutsideCatalogShopping(): WarungAssistantPayload {
  return {
    content: `Itu di luar yang bisa aku bantu di sini.

**Warung Agent** cuma untuk belanja kopi dan grocery: minuman kopi, mie, beras, sayur, buah, telur, dan kebutuhan warung sejenis. Aku tidak jual elektronik, tiket, hotel, kendaraan, investasi, atau pesanan marketplace lain.

Kalau mau lanjut belanja, sebut barang yang masuk kategori itu, misalnya beli kopi 2 atau beli beras 1.

_${WARUNG_TAGLINE_ID}_`,
  };
}

export function clarifyNonCommerceTopic(): WarungAssistantPayload {
  return {
    content: `Hmm, itu di luar yang bisa aku bantu.

Fokusku di kopi dan grocery: cari produk, bandingkan harga, pilih toko, sampai bayar lewat QRIS. Pertanyaan seputar kopi atau grocery juga boleh, misalnya apa beda arabica dan robusta, atau indomie enaknya campur apa.

Kalau mau belanja, tulis saja kebutuhanmu, misalnya beli kopi, beli indomie, atau yang paling murah.

_${WARUNG_TAGLINE_ID}_`,
  };
}
