import type { ParsedIntent, WarungAssistantPayload } from "./types";
import { WARUNG_TAGLINE_ID } from "./copy";

const ELECTRONICS =
  /\b(laptop|notebook|handphone|hp|smartphone|iphone|ipad|android\s*phone|tablet|televisi|tv\s*led|kamera|drone|headset|earphone|airpods|ps5|playstation|xbox|monitor|pc\s+gaming|macbook|smartwatch)\b/i;

const TRAVEL_HOSPITALITY = /\b(tiket\s+pesawat|tiket\s+kereta|booking\s+hotel|pesan\s+hotel|villa\b|penginapan|paket\s+wisata|liburan\s+ke|tour\s+travel|boarding\s+pass)\b/i;

const VEHICLE_PROPERTY = /\b(beli\s+motor|beli\s+mobil|sewa\s+mobil|rental\s+mobil|jual\s+rumah|beli\s+rumah|kpr\b|apartemen\s+dijual)\b/i;

const FINANCE_DIGITAL = /\b(saham\b|crypto|bitcoin|ethereum|forex\b|nft\b|token\s+coin)\b/i;

const MARKETPLACE_APPS = /\b(pesan\s+gojek|order\s+grab|grab\s+car|tokopedia|shopee|lazada|bukalapak|marketplace\s+online)\b/i;

/** User clearly wants to buy / order something we do not support (outside kopi & grocery). */
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

/** Small talk or general questions — not a grocery/coffee shopping request. */
export function isNonCommerceMessage(userText: string, intent: ParsedIntent): boolean {
  if (intent.intent !== "unknown") return false;
  const t = userText.trim();
  const lower = t.toLowerCase();
  if (lower.length < 2) return false;

  if (/^(halo|hai|hei|hi|ping|p|test|tes|help|halo\s+bot)$/i.test(lower)) return true;
  if (/^(apa kabar|apa\s+kabar|gimana kabar|how are you)/i.test(lower)) return true;
  if (/\b(cuaca|weather|prakiraan\s+cuaca)\b/i.test(lower)) return true;
  if (/\b(siapa\s+itu|siapa\s+presiden|kapan\s+pemilu|berita\s+terbaru)\b/i.test(lower)) return true;

  if (/\b(bagaimana cara|gimana cara|apa itu|jelaskan tentang|kenapa bisa|mengapa\b|tolong jelaskan)\b/i.test(lower)) {
    if (
      /\b(kopi|beli|pesan|grocery|warung|checkout|indomie|beras|sayur|harga|bayar|telur|minuman|sembako)\b/i.test(lower)
    ) {
      return false;
    }
    return true;
  }

  return false;
}

export function clarifyOutsideCatalogShopping(): import("./types").WarungAssistantPayload {
  return {
    content: `Itu di luar yang bisa aku bantu di sini.

**Warung Agent** hanya untuk **belanja kopi & grocery** (minuman kopi, mie, beras, sayur, buah, telur, dan kebutuhan warung sejenis). Aku tidak jual elektronik, tiket, hotel, kendaraan, investasi, atau pesanan marketplace lain.

Kalau mau lanjut belanja, sebut barang yang masuk kategori tadi — misalnya **beli kopi 2** atau **beli beras 1**.

_${WARUNG_TAGLINE_ID}_`,
  };
}

export function clarifyNonCommerceTopic(): WarungAssistantPayload {
  return {
    content: `Aku bukan asisten obrolan umum atau tanya jawab bebas — fokusku **jualan kopi & grocery lewat chat** (cari barang, bandingkan, konfirmasi, bayar demo).

Kalau mau belanja, langsung sebut kebutuhanmu, misalnya **beli kopi**, **beli indomie**, atau **cari yang paling murah**.

_${WARUNG_TAGLINE_ID}_`,
  };
}
