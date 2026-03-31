import {
  parseIntent,
  extractNumberFromText,
  extractOrdinalFromText,
  extractPurchaseQuantity,
  ID_NUMBER_MAP,
  ID_NUMBER_RE,
} from "./intentParser.js";
import { WARUNG_TAGLINE_ID } from "./copy.js";
import {
  clarifyNonCommerceTopic,
  clarifyOutsideCatalogShopping,
  isNonCommerceMessage,
  isOutOfScopeShoppingRequest,
  isGreeting,
  greetingResponse,
} from "./scopeGuard.js";
import {
  createOrder,
  delaySearch,
  delayLocationSearch,
  executePayment,
  findItems,
  findNearbyStores,
  MAX_PRODUCT_LIST_RESULTS,
} from "./mockCommerce.js";
import {
  isGeminiConfigured,
  geminiUnderstandIntent,
  answerScopedQuestionWithGemini,
} from "../jatevoClient.js";
import type {
  CommerceAttachment,
  MockProduct,
  MockStore,
  ParsedIntent,
  WarungAssistantPayload,
  WarungConversationState,
} from "./types.js";

// ─── Types ──────────────────────────────────────────────────────────

type TurnResult = { newState: WarungConversationState; final: WarungAssistantPayload };
type PatchFn = (p: WarungAssistantPayload) => void;
const LOADING_COPY = {
  understand: "Memahami kebutuhan kamu…",
  findProducts: "Mencari produk yang paling pas…",
  findStores: "Mencari toko terdekat…",
  processPayment: "Memproses pembayaran…",
} as const;


// ─── State helpers ──────────────────────────────────────────────────

export function initialWarungState(): WarungConversationState {
  return {
    step: "idle",
    intent: null,
    selected_item: null,
    quantity: 1,
    total_price: 0,
    searchResults: [],
    order_id: null,
    transaction_id: null,
    selected_store: null,
    nearbyStores: [],
  };
}

export function prepareStateForUserMessage(state: WarungConversationState): WarungConversationState {
  if (state.step === "done") return initialWarungState();
  return {
    ...state,
    selected_store: state.selected_store ?? null,
    nearbyStores: state.nearbyStores ?? [],
  };
}

// ─── Affirmative / Negative ─────────────────────────────────────────

export function isAffirmative(text: string): boolean {
  const t = text.trim();
  return /^(ya|yap|yes|ok|oke|sip|baik|konfirmasi|benar|lanjut|gas|boleh|setuju|deal|jadi|iya)\b/i.test(t);
}

export function isNegative(text: string): boolean {
  const t = text.trim();
  return /^(tidak|engga|ngga|gak|gk|batal|cancel|nanti|jangan|ga jadi|gajadi)\b/i.test(t);
}

// ─── Quantity-change detection ──────────────────────────────────────

const ID_NUMBER_WORDS_PAT = Object.keys(ID_NUMBER_MAP).join("|");

function clampQty(n: number): number {
  return Math.max(1, Math.min(99, n));
}

function detectQuantityChange(text: string, state: WarungConversationState): number | null {
  const t = text.trim().toLowerCase();

  const changeDigit = t.match(/\b(?:ganti|ubah|jadikan?)\s+(?:jadi|ke)?\s*(\d{1,2})\b/);
  if (changeDigit) return clampQty(parseInt(changeDigit[1], 10));

  const changeWordRe = new RegExp(
    `\\b(?:ganti|ubah|jadikan?)\\s+(?:jadi|ke)?\\s*(${ID_NUMBER_WORDS_PAT})\\b`, "i",
  );
  const changeWord = t.match(changeWordRe);
  if (changeWord) return clampQty(ID_NUMBER_MAP[changeWord[1].toLowerCase()] ?? 1);

  const mauDigit = t.match(/\b(?:saya\s+|aku\s+)?mau\s+(\d{1,2})\b/);
  if (mauDigit) return clampQty(parseInt(mauDigit[1], 10));

  const mauWordRe = new RegExp(
    `\\b(?:saya\\s+|aku\\s+)?mau\\s+(${ID_NUMBER_WORDS_PAT})\\b`, "i",
  );
  const mauWord = t.match(mauWordRe);
  if (mauWord) return clampQty(ID_NUMBER_MAP[mauWord[1].toLowerCase()] ?? 1);

  if (/\btambah\b/i.test(t)) {
    const rest = t.replace(/\btambah\b/i, "").trim();
    const n = extractNumberFromText(rest);
    if (n) {
      if (/\bjadi\b/i.test(t)) return clampQty(n);
      return clampQty((state.quantity ?? 1) + n);
    }
    return clampQty((state.quantity ?? 1) + 1);
  }

  if (/\b(kurangi|kurang)\b/i.test(t)) {
    const rest = t.replace(/\b(kurangi|kurang)\b/i, "").trim();
    const n = extractNumberFromText(rest);
    if (n) {
      if (/\bjadi\b/i.test(t)) return clampQty(n);
      return clampQty(Math.max(1, (state.quantity ?? 1) - n));
    }
    return clampQty(Math.max(1, (state.quantity ?? 1) - 1));
  }

  if (state.selected_item) {
    const itemLower = state.selected_item.name.toLowerCase();
    const tokens = itemLower.split(/\s+/).filter((w) => w.length >= 3);
    const msgTokens = t.split(/\s+/);
    const hasItemRef = tokens.some((tok) =>
      msgTokens.some((mt) => mt.includes(tok) || tok.includes(mt)),
    );
    if (hasItemRef) {
      const n = extractNumberFromText(t);
      if (n) return clampQty(n);
    }
  }

  if (t.split(/\s+/).length <= 2) {
    const n = extractNumberFromText(t);
    if (n) return clampQty(n);
  }

  return null;
}

// ─── Smart product selection (selecting step) ───────────────────────

interface SmartSelectionResult {
  product: MockProduct;
  quantity: number | null;
  confidence: number;
  scoreGap: number;
  alternatives: MockProduct[];
}

function levenshtein(a: string, b: string): number {
  if (b.length > a.length) return levenshtein(b, a);
  if (b.length === 0) return a.length;
  let prev: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row: number[] = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j - 1]! + 1, prev[j]! + 1, prev[j - 1]! + cost);
    }
    prev = row;
  }
  return prev[b.length]!;
}

/** Typo-tolerant match e.g. "strawbery" → Strawberry Segar */
function fuzzyTokenMatchesProduct(token: string, productNameLower: string): boolean {
  if (token.length < 4) return false;
  if (productNameLower.includes(token)) return true;
  const words = productNameLower.split(/[^a-z0-9]+/).filter((w) => w.length >= 4);
  for (const w of words) {
    if (Math.abs(token.length - w.length) > 3) continue;
    if (levenshtein(token, w) <= 2) return true;
  }
  return false;
}

function resolveSmartSelection(text: string, results: MockProduct[]): SmartSelectionResult | null {
  if (results.length === 0) return null;
  const t = text.trim().toLowerCase();
  const purchaseQty = extractPurchaseQuantity(t);
  const pickQty = (fallback: number | null): number | null =>
    purchaseQty !== null && purchaseQty >= 1 && purchaseQty <= 99 ? purchaseQty : fallback;
  const rankResultByText = (
    userText: string,
    fallbackQty: number | null,
  ): SmartSelectionResult | null => {
    const cleaned = userText.trim().toLowerCase();
    if (cleaned.length < 2) return null;
    const tokens = cleaned.split(/\s+/).filter((w) => w.length >= 2);
    const ranked = results
      .map((product) => {
        const name = product.name.toLowerCase();
        let score = 0;
        if (name.includes(cleaned)) score += 90;
        for (const token of tokens) {
          if (token.length >= 3 && name.includes(token)) score += 22;
          else if (token.length >= 4 && fuzzyTokenMatchesProduct(token, name)) score += 10;
        }
        return { product, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || a.product.price - b.product.price);
    if (ranked.length === 0) return null;
    const top = ranked[0];
    const second = ranked[1];
    const scoreGap = second ? top.score - second.score : top.score;
    const confidence = Math.max(0, Math.min(1, top.score / (top.score + (second?.score ?? 0) + 1)));
    return {
      product: top.product,
      quantity: pickQty(fallbackQty),
      confidence,
      scoreGap,
      alternatives: ranked.slice(1, 4).map((x) => x.product),
    };
  };

  if (/murah|termurah|paling\s+murah|yang\s+murah/i.test(t)) {
    return {
      product: results.reduce((a, b) => (a.price <= b.price ? a : b)),
      quantity: pickQty(null),
      confidence: 1,
      scoreGap: 999,
      alternatives: [],
    };
  }

  const bareN = parseInt(t, 10);
  if (Number.isFinite(bareN) && String(bareN) === t.trim() && bareN >= 1 && bareN <= results.length) {
    return { product: results[bareN - 1], quantity: pickQty(null), confidence: 1, scoreGap: 999, alternatives: [] };
  }

  const ord = extractOrdinalFromText(t);
  if (ord && ord >= 1 && ord <= results.length) {
    return { product: results[ord - 1], quantity: pickQty(null), confidence: 1, scoreGap: 999, alternatives: [] };
  }

  if (t.split(/\s+/).length === 1) {
    const idxWord = ID_NUMBER_MAP[t];
    if (idxWord && idxWord >= 1 && idxWord <= results.length) {
      return { product: results[idxWord - 1], quantity: pickQty(null), confidence: 1, scoreGap: 999, alternatives: [] };
    }
  }

  const numFromText = extractNumberFromText(t);
  const textWithoutNum = t
    .replace(/\b\d{1,2}\b/, "")
    .replace(ID_NUMBER_RE, "")
    .replace(/\s+/g, " ")
    .trim();

  if (textWithoutNum.length >= 2) {
    const ranked = rankResultByText(textWithoutNum, numFromText);
    if (ranked) return ranked;
  }

  const stripped = t
    .replace(/^\s*(saya\s+|aku\s+)?(mau|pilih|ambil)\s+(yang\s+)?/i, "")
    .trim();
  if (stripped.length >= 2 && stripped !== t) {
    const ranked = rankResultByText(stripped, extractNumberFromText(stripped));
    if (ranked) return ranked;
  }

  const fallbackRanked = rankResultByText(t, null);
  if (fallbackRanked) return fallbackRanked;

  return null;
}

export function tryResolveSelection(userText: string, results: MockProduct[]): MockProduct | null {
  return resolveSmartSelection(userText, results)?.product ?? null;
}

// ─── Formatting helpers ─────────────────────────────────────────────

function formatRp(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

function buildReviewText(product: MockProduct, qty: number, total: number, store: MockStore): string {
  return `📦 **Detail Pesanan**

**${product.name}**
Jumlah: ${qty}
Harga satuan: ${formatRp(product.price)}
Total: **${formatRp(total)}**

📍 **${store.name}**
${store.address}
Jarak: ${store.distanceKm} km

Scan QRIS di bawah untuk bayar 👇
Ketik **ya** untuk konfirmasi, atau **batal** untuk membatalkan.`;
}

function buildReviewCommerce(
  product: MockProduct,
  qty: number,
  total: number,
  store: MockStore,
): CommerceAttachment {
  return {
    kind: "review",
    itemName: product.name,
    quantity: qty,
    totalPrice: total,
    unitPrice: product.price,
    storeName: store.name,
    storeAddress: store.address,
    distanceKm: store.distanceKm,
    provider: product.provider,
  };
}

// ─── Static reply payloads ──────────────────────────────────────────

function guideUnknown(): WarungAssistantPayload {
  return {
    content: `Aku Warung Agent, fokus kopi dan kebutuhan warung (minuman kopi sampai mie, beras, sayur, telur).

Ketik kebutuhanmu, nanti aku bantu cari opsi, bandingkan, sampai checkout. Coba beli kopi 2, beli beras 1, beli indomie, atau cari yang paling murah.

_${WARUNG_TAGLINE_ID}_`,
  };
}

function askMissingItem(): WarungAssistantPayload {
  return {
    content: `Mau dibelikan apa? Sebut barang + jumlah. Katalog demo hanya **kopi & grocery** (bukan elektronik, travel, dll.).

_${WARUNG_TAGLINE_ID}_`,
  };
}

const CATALOG_QUESTION_HINT =
  /\b(apa\s+saja|apa aja|ada|stok|tersedia|menu|list|daftar|pilihan|jenis|varian|jual|punya|barang|produk|katalog)\b/i;
const CATALOG_DOMAIN_HINT =
  /\b(kopi|grocery|sembako|warung|beras|mie|mi|indomie|telur|sayur|buah|roti|minuman|snack|daging|ayam|ikan)\b/i;
const GENERAL_QUESTION_HINT =
  /\b(apa|bagaimana|gimana|kenapa|mengapa|beda|perbedaan|tips|cara|rekomendasi|enak|cocok|manfaat|bedanya|yang bagus|lebih baik)\b/i;
const GENERAL_DOMAIN_HINT =
  /\b(kopi|coffee|arabica|robusta|espresso|latte|cappuccino|americano|cold brew|beans|gula|susu|oat milk|indomie|mie|beras|telur|sayur|buah|roti|sembako|grocery|protein|bumbu)\b/i;
const OUT_OF_SCOPE_GENERAL_HINT =
  /\b(saham|crypto|bitcoin|forex|nft|politik|cuaca|bola|film|musik|kode program|coding|laptop|smartphone|hotel|tiket)\b/i;

function extractCatalogQueryFromQuestion(text: string): string | null {
  const t = text.toLowerCase().trim();
  if (!t) return null;
  if (!CATALOG_QUESTION_HINT.test(t) && !CATALOG_DOMAIN_HINT.test(t)) return null;

  const cleaned = t
    .replace(
      /\b(apa\s+saja|apa aja|yang|bisa|dijual|dibeli|aku|kamu|nih|dong|ya|min|tolong|minta|lihat|cek|beri|kasih|tampilkan|tampilin|show)\b/g,
      " ",
    )
    .replace(
      /\b(ada|stok|tersedia|menu|list|daftar|pilihan|jenis|varian|jual|punya|barang|produk|katalog|makanan|minuman|kebutuhan)\b/g,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return null;

  const generic = new Set([
    "kopi",
    "grocery",
    "sembako",
    "warung",
    "barang",
    "produk",
    "katalog",
    "item",
    "menu",
    "list",
    "daftar",
    "makanan",
    "minuman",
    "kebutuhan",
    "tersedia",
    "beri",
    "kasih",
    "tampilkan",
    "tampilin",
    "show",
  ]);
  const specificTokens = cleaned.split(" ").filter((w) => w.length >= 2 && !generic.has(w));
  if (specificTokens.length === 0) return null;
  return specificTokens.join(" ");
}

function guideCatalogOverview(): WarungAssistantPayload {
  return {
    content: `Bisa banget 👍 Katalogku fokus **kopi & grocery**.

Kategori utama:
- **Coffee drinks & beans**: espresso, americano, latte, cappuccino, cold brew, beans, syrup, oat milk.
- **Grocery harian**: beras, mie instan, telur, roti, sayur, buah, bumbu dapur, protein.

Coba langsung tanya spesifik biar aku kasih list:
**ada beras apa saja**, **menu kopi apa saja**, **stok telur**, atau langsung **beli beras 2**.

_${WARUNG_TAGLINE_ID}_`,
  };
}

function isScopedGeneralQuestion(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  if (OUT_OF_SCOPE_GENERAL_HINT.test(t)) return false;
  return GENERAL_QUESTION_HINT.test(t) && GENERAL_DOMAIN_HINT.test(t);
}

function fallbackScopedGeneralAnswer(text: string): WarungAssistantPayload {
  const t = text.toLowerCase();
  if (/\b(arabica|robusta|beda|perbedaan)\b/i.test(t)) {
    return {
      content:
        "Singkatnya: Arabica cenderung lebih fruity/asam lembut, sedangkan Robusta lebih bold, pahit, dan body-nya tebal. Untuk minuman susu (latte/kopi susu), blend dengan Robusta sering terasa lebih nendang. Kalau mau, aku bisa cariin item kopi yang cocok dari katalog demo.",
    };
  }
  if (/\b(indomie|mie)\b/i.test(t)) {
    return {
      content:
        "Untuk stok cepat dan ekonomis, mie instan cocok dipadukan dengan telur + sayur biar lebih seimbang. Di katalog demo biasanya ada varian mie goreng dan mie kuah. Kalau mau, ketik \"beli indomie\" biar aku tampilkan opsinya.",
    };
  }
  if (/\b(beras)\b/i.test(t)) {
    return {
      content:
        "Kalau cari hemat, beras medium biasanya lebih ekonomis; kalau prioritas tekstur pulen, pilih beras premium. Simpan beras di wadah tertutup dan kering supaya awet. Kalau mau, aku bisa langsung tampilkan opsi beras di katalog demo.",
    };
  }
  return {
    content:
      "Bisa, aku bisa bantu jawab pertanyaan seputar kopi & grocery (rasa, rekomendasi, tips penyimpanan, dan pilihan produk). Kalau kamu mau, langsung tanya spesifik atau ketik \"beli <item>\" supaya aku carikan opsinya.",
  };
}

// ─── Intent merging ─────────────────────────────────────────────────

function mergeIntent(base: ParsedIntent | null, next: ParsedIntent, raw: string): ParsedIntent {
  if (!base) return next;
  if (next.intent === "unknown" && !shouldCarryForwardIntent(raw)) {
    return next;
  }
  const hasDigit = /\d/.test(raw);
  return {
    intent: next.intent !== "unknown" ? next.intent : base.intent,
    item: next.item ?? base.item,
    quantity: hasDigit ? next.quantity : base.quantity,
    quantityExplicit: hasDigit ? next.quantityExplicit : base.quantityExplicit,
    location: next.location ?? base.location,
    budget: next.budget ?? base.budget,
    notes: next.notes ?? base.notes,
  };
}

function shouldCarryForwardIntent(raw: string): boolean {
  const t = raw.trim().toLowerCase();
  if (!t) return false;

  // Explicit fresh-start social/chat messages should not inherit old shopping intent.
  if (/^(hi|halo|hai|hei|hello|p|ping|tes|test|apa kabar|gimana kabar)\b/i.test(t)) {
    return false;
  }

  // Continuation cues that likely refer to previous turn.
  if (
    /^(ya|yap|yes|ok|oke|sip|konfirmasi|benar|lanjut|gas|boleh|tidak|engga|ngga|gak|batal|cancel)\b/i.test(t)
  ) {
    return true;
  }
  if (/\b(yang|itu|ini|murah|termurah|terdekat|nomor|no\.?|ganti|ubah|tambah|kurangi)\b/i.test(t)) {
    return true;
  }
  if (/^\d{1,2}$/.test(t)) return true;
  if (/^(satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh|sebelas|selusin)$/i.test(t)) {
    return true;
  }
  return false;
}

// ─── Product selection (for qty changes when store is already chosen) ─

export interface SelectProductResult {
  newState: WarungConversationState;
  final: WarungAssistantPayload;
}

export function applyProductSelection(
  state: WarungConversationState,
  product: MockProduct,
  quantity: number,
): SelectProductResult {
  const total = product.price * quantity;
  const newState: WarungConversationState = {
    ...state,
    step: "reviewing",
    selected_item: product,
    quantity,
    total_price: total,
  };

  if (state.selected_store) {
    return {
      newState,
      final: {
        content: buildReviewText(product, quantity, total, state.selected_store),
        commerce: buildReviewCommerce(product, quantity, total, state.selected_store),
      },
    };
  }

  return {
    newState: { ...newState, step: "reviewing" },
    final: {
      content: `Oke, **${product.name}** × ${quantity} = **${formatRp(total)}**.\n\nMencari toko terdekat secara otomatis…`,
    },
  };
}

// ─── Transition: product selected → show nearby stores ──────────────

async function transitionToStoreSelection(
  state: WarungConversationState,
  product: MockProduct,
  qty: number,
  patch: PatchFn,
): Promise<TurnResult> {
  const total = product.price * qty;
  state = { ...state, selected_item: product, quantity: qty, total_price: total };

  patch({
    content: `**${product.name}** × ${qty} dipilih! ${LOADING_COPY.findStores} 📍`,
    commerce: { kind: "status", message: LOADING_COPY.findStores },
    toolUsages: [{ name: "find_nearby_stores", status: "running" }],
    isStreaming: true,
  });

  await delayLocationSearch();
  const stores = findNearbyStores(product);

  if (stores.length === 0) {
    return {
      newState: { ...state, step: "reviewing", nearbyStores: [], selected_store: null },
      final: {
        content: `**${product.name}** × ${qty} = **${formatRp(total)}**\n\nToko terdekat tidak tersedia (demo). Ketik **ya** untuk lanjut bayar.`,
      },
    };
  }

  const nearestStore = stores[0]!;

  return {
    newState: { ...state, step: "reviewing", nearbyStores: stores, selected_store: nearestStore },
    final: {
      content: buildReviewText(product, qty, total, nearestStore),
      commerce: buildReviewCommerce(product, qty, total, nearestStore),
      toolUsages: [{ name: "find_nearby_stores", status: "complete" }],
      isStreaming: false,
      showQris: true,
    },
  };
}

// ─── Transition: store selected → show review + QRIS ────────────────

function transitionToReview(state: WarungConversationState, store: MockStore): TurnResult {
  const product = state.selected_item!;
  const total = state.total_price;

  return {
    newState: { ...state, step: "reviewing", selected_store: store },
    final: {
      content: buildReviewText(product, state.quantity, total, store),
      commerce: buildReviewCommerce(product, state.quantity, total, store),
      showQris: true,
    },
  };
}

// ─── Payment flow ───────────────────────────────────────────────────

async function processPaymentFlow(state: WarungConversationState, patch: PatchFn): Promise<TurnResult> {
  state = { ...state, step: "paying" as const };

  patch({
    content: `${LOADING_COPY.processPayment} ⏳`,
    commerce: { kind: "status", message: LOADING_COPY.processPayment },
    toolUsages: [
      { name: "create_order", status: "running" },
      { name: "execute_payment", status: "running" },
    ],
    isStreaming: true,
  });

  const order = createOrder({
    item_id: state.selected_item?.id ?? "",
    quantity: state.quantity,
    total_price: state.total_price,
    provider: state.selected_item?.provider ?? "",
    store_name: state.selected_store?.name,
  });

  const paid = await executePayment({ amount: state.total_price });

  const storeLine = state.selected_store ? `\nToko: **${state.selected_store.name}**` : "";

  return {
    newState: {
      step: "done",
      intent: null,
      selected_item: null,
      quantity: 1,
      total_price: 0,
      searchResults: [],
      order_id: order.order_id,
      transaction_id: paid.transaction_id,
      selected_store: null,
      nearbyStores: [],
    },
    final: {
      content: `✅ **Pesanan berhasil dipesan.**\n\nID Pesanan: **${order.order_id}**\nID Transaksi: **${paid.transaction_id}**${storeLine}\n\n${paid.message}\n\nMau belanja lagi? Tinggal kirim kebutuhan berikutnya.\n\n_${WARUNG_TAGLINE_ID}_`,
      commerce: {
        kind: "success",
        orderId: order.order_id,
        transactionId: paid.transaction_id,
        message: paid.message,
      },
      toolUsages: [
        { name: "create_order", status: "complete" },
        { name: "execute_payment", status: "complete" },
      ],
      isStreaming: false,
    },
  };
}

// ─── Main turn handler ──────────────────────────────────────────────

export async function runWarungUserTextTurn(params: {
  state: WarungConversationState;
  userText: string;
  patchAssistant: PatchFn;
}): Promise<TurnResult> {
  const text = params.userText.trim();
  const patch = params.patchAssistant;

  const emitUnderstanding = (): void =>
    patch({
      content: LOADING_COPY.understand,
      commerce: { kind: "status", message: LOADING_COPY.understand },
      toolUsages: [{ name: "understand_intent", status: "running" }],
      isStreaming: true,
    });

  const emitFindProducts = (): void =>
    patch({
      content: LOADING_COPY.findProducts,
      commerce: { kind: "status", message: LOADING_COPY.findProducts },
      toolUsages: [{ name: "find_items", status: "running" }],
      isStreaming: true,
    });

  // ── GREETING FAST-PATH — runs before ANY state/step logic ────────
  // Unconditionally resets session and returns a warm intro, regardless of
  // what step the previous conversation was in.
  if (isGreeting(text)) {
    return {
      newState: initialWarungState(),
      final: greetingResponse(),
    };
  }

  let state = prepareStateForUserMessage(params.state);

  // ── SELECTING step ────────────────────────────────────────────────

  if (state.step === "selecting") {
    const sel = resolveSmartSelection(text, state.searchResults);

    if (!sel) {
      if (isGeminiConfigured()) {
        try {
          emitUnderstanding();
          const smart = await geminiUnderstandIntent({
            userText: text,
            step: "selecting",
            searchResults: state.searchResults.map((p) => ({ name: p.name, price: p.price })),
          });
          if (smart.action === "select_item") {
            const idx = smart.itemIndex;
            if (idx && idx >= 1 && idx <= state.searchResults.length) {
              const product = state.searchResults[idx - 1];
              const qty = smart.quantity ?? state.intent?.quantity ?? state.quantity ?? 1;
              return transitionToStoreSelection(state, product, qty, patch);
            }
            if (smart.item) {
              const matched = state.searchResults.find((p) =>
                p.name.toLowerCase().includes(smart.item!.toLowerCase()),
              );
              if (matched) {
                const qty = smart.quantity ?? state.intent?.quantity ?? state.quantity ?? 1;
                return transitionToStoreSelection(state, matched, qty, patch);
              }
            }
          }
          if (smart.action === "buy" && smart.item) {
            const matched = state.searchResults.find((p) =>
              p.name.toLowerCase().includes(smart.item!.toLowerCase()),
            );
            if (matched) {
              const qty = smart.quantity ?? state.intent?.quantity ?? state.quantity ?? 1;
              return transitionToStoreSelection(state, matched, qty, patch);
            }
          }
          if (smart.action === "cancel") {
            return {
              newState: initialWarungState(),
              final: { content: "Oke dibatalin. Mau cari barang lain? Ketik aja kebutuhanmu 🛒" },
            };
          }
        } catch { /* fall through to hint */ }
      }

      return {
        newState: state,
        final: {
          content:
            "Belum kebaca pilihannya. Ketik nomor urut (1, 2, …), nama item, **yang murah**, atau kata kunci lain ☕",
        },
      };
    }

    const parsedSelecting = parseIntent(text);
    const trimmed = text.trim();
    const indexOnly = /^(\d{1,2})\s*$/.test(trimmed);
    const indexNum = indexOnly ? parseInt(trimmed, 10) : NaN;
    const pickedByListIndex =
      indexOnly && Number.isFinite(indexNum) && indexNum >= 1 && indexNum <= state.searchResults.length;

    const qty = sel.quantity
      ? sel.quantity
      : pickedByListIndex
        ? (state.intent?.quantity ?? state.quantity ?? 1)
        : parsedSelecting.quantityExplicit
          ? parsedSelecting.quantity
          : (state.intent?.quantity ?? state.quantity ?? 1);

    // If user gave free text and top candidates are too close, clarify instead of mis-picking.
    const explicitNumericPick = pickedByListIndex || /^(\d{1,2})\s*$/.test(trimmed);
    const shouldClarifyAmbiguous =
      !explicitNumericPick &&
      sel.alternatives.length > 0 &&
      sel.scoreGap <= 8 &&
      sel.confidence < 0.7;
    if (shouldClarifyAmbiguous) {
      const options = [sel.product, ...sel.alternatives.slice(0, 2)];
      return {
        newState: state,
        final: {
          content:
            `Biar nggak salah pilih, maksudmu yang mana?\n` +
            options.map((p, i) => `${i + 1}. ${p.name} (Rp ${p.price.toLocaleString("id-ID")})`).join("\n") +
            `\n\nKetik nomor (1/2/3) atau nama item yang paling pas.`,
        },
      };
    }

    return transitionToStoreSelection(state, sel.product, qty, patch);
  }

  // ── REVIEWING / CONFIRMING step ───────────────────────────────────

  if (state.step === "reviewing" || state.step === "confirming") {
    if (isNegative(text)) {
      return {
        newState: initialWarungState(),
        final: { content: "Oke, aku batalin dulu. Mau beli yang lain? Ketik aja barangnya 🛒" },
      };
    }

    if (isAffirmative(text)) {
      return processPaymentFlow(state, patch);
    }

    // Quantity change
    const newQty = detectQuantityChange(text, state);
    if (newQty !== null && state.selected_item) {
      const newTotal = state.selected_item.price * newQty;
      const updatedState: WarungConversationState = {
        ...state,
        step: "reviewing",
        quantity: newQty,
        total_price: newTotal,
      };

      if (state.selected_store) {
        return {
          newState: updatedState,
          final: {
            content: buildReviewText(state.selected_item, newQty, newTotal, state.selected_store),
            commerce: buildReviewCommerce(state.selected_item, newQty, newTotal, state.selected_store),
          },
        };
      }
      return {
        newState: updatedState,
        final: {
          content: `Jumlah diubah ke **${newQty}**. Total: **${formatRp(newTotal)}**.\n\nKetik **ya** untuk bayar atau **batal** untuk membatalkan.`,
        },
      };
    }

    // "ganti item"
    if (/\b(ganti|ubah|pilih)\s+(item|barang|produk)\b/i.test(text) || /\b(barang|item|produk)\s+(lain|beda)\b/i.test(text)) {
      if (state.searchResults.length > 0) {
        return {
          newState: { ...state, step: "selecting", selected_item: null, selected_store: null },
          final: {
            content: "Oke, pilih produk lain:",
            commerce: { kind: "products", items: state.searchResults, quantity: state.quantity },
          },
        };
      }
    }

    // New purchase intent
    const reParsed = parseIntent(text);
    const wantsNewViaRegex =
      (reParsed.intent === "buy_food" || reParsed.intent === "buy_product" || reParsed.intent === "send_item") &&
      reParsed.item;

    if (wantsNewViaRegex) {
      state = { ...initialWarungState(), intent: reParsed };
      // Fall through to idle flow
    } else if (isGeminiConfigured()) {
      try {
        emitUnderstanding();
        const smart = await geminiUnderstandIntent({
          userText: text,
          step: "reviewing",
          selectedItem: state.selected_item
            ? { name: state.selected_item.name, price: state.selected_item.price, quantity: state.quantity }
            : null,
        });

        if (smart.action === "confirm") return processPaymentFlow(state, patch);
        if (smart.action === "change_qty" && smart.quantity && state.selected_item) {
          const newTotal = state.selected_item.price * smart.quantity;
          const s: WarungConversationState = { ...state, step: "reviewing", quantity: smart.quantity, total_price: newTotal };
          if (state.selected_store) {
            return {
              newState: s,
              final: {
                content: buildReviewText(state.selected_item, smart.quantity, newTotal, state.selected_store),
                commerce: buildReviewCommerce(state.selected_item, smart.quantity, newTotal, state.selected_store),
              },
            };
          }
          return { newState: s, final: { content: `Jumlah diubah ke **${smart.quantity}**. Total: **${formatRp(newTotal)}**.` } };
        }
        if (smart.action === "cancel") {
          return { newState: initialWarungState(), final: { content: "Oke dibatalin. Mau beli yang lain? 🛒" } };
        }
        if (smart.action === "buy" && smart.item) {
          state = {
            ...initialWarungState(),
            intent: { intent: "buy_product", item: smart.item, quantity: smart.quantity ?? 1, quantityExplicit: Boolean(smart.quantity), location: null, budget: null, notes: null },
          };
          // Fall through to idle flow
        } else {
          return {
            newState: state,
            final: {
              content: `Ketik **ya** untuk konfirmasi bayar, atau **batal** untuk membatalkan.
Mau ubah jumlah? Ketik angka baru (misal **2** atau **dua**).
Mau ganti item? Ketik **ganti item**.`,
              commerce: state.selected_store && state.selected_item
                ? buildReviewCommerce(state.selected_item, state.quantity, state.total_price, state.selected_store)
                : undefined,
            },
          };
        }
      } catch {
        return {
          newState: state,
          final: {
            content: `Ketik **ya** untuk konfirmasi bayar, atau **batal** untuk membatalkan.\nMau ubah jumlah? Ketik angka baru.`,
          },
        };
      }
    } else {
      return {
        newState: state,
        final: {
          content: `Ketik **ya** untuk konfirmasi bayar, atau **batal** untuk membatalkan.\nMau ubah jumlah? Ketik angka baru (misal **2** atau **dua**).`,
        },
      };
    }
  }

  // ── IDLE / SEARCHING flow ─────────────────────────────────────────

  const parsed = parseIntent(text);
  let intent = mergeIntent(state.intent, parsed, text);

  const hintedQuery = extractCatalogQueryFromQuestion(text);
  if (intent.intent === "unknown" && hintedQuery) {
    intent = { ...intent, intent: "buy_product", item: hintedQuery };
  }

  if (intent.intent === "unknown" && intent.item) {
    const probe = findItems({ query: intent.item, category: null, location: null });
    if (probe.length > 0) {
      intent = { ...intent, intent: "buy_product" };
    }
  }

  state = { ...state, intent };

  const wantsBuy =
    intent.intent === "buy_food" || intent.intent === "buy_product" || intent.intent === "send_item";

  if (wantsBuy && isOutOfScopeShoppingRequest(text, intent)) {
    return { newState: { ...state, step: "idle", intent: null }, final: clarifyOutsideCatalogShopping() };
  }

  if (!wantsBuy || intent.intent === "unknown") {
    if (intent.intent === "unknown" && isScopedGeneralQuestion(text)) {
      if (isGeminiConfigured()) {
        try {
          emitUnderstanding();
          const hints = findItems({ query: text, category: null, location: null })
            .slice(0, 5)
            .map((p) => `${p.name} (Rp ${p.price.toLocaleString("id-ID")})`);
          const answer = await answerScopedQuestionWithGemini({
            userText: text,
            catalogHints: hints,
          });
          return {
            newState: { ...state, step: "idle", intent: null },
            final: {
              content: answer,
            },
          };
        } catch (err) {
          console.error("[warung-brain] scoped QA fallback:", err);
          return {
            newState: { ...state, step: "idle", intent: null },
            final: fallbackScopedGeneralAnswer(text),
          };
        }
      }
      return {
        newState: { ...state, step: "idle", intent: null },
        final: fallbackScopedGeneralAnswer(text),
      };
    }

    if (intent.intent === "unknown" && isNonCommerceMessage(text, intent)) {
      return { newState: { ...state, step: "idle", intent: null }, final: clarifyNonCommerceTopic() };
    }
    if (intent.intent === "unknown" && CATALOG_QUESTION_HINT.test(text)) {
      return { newState: { ...state, step: "idle", intent: null, searchResults: [] }, final: guideCatalogOverview() };
    }

    if (intent.intent === "unknown" && isGeminiConfigured()) {
      try {
        emitUnderstanding();
        const smart = await geminiUnderstandIntent({ userText: text, step: "idle" });
        if (smart.action === "buy" && smart.item) {
          intent = {
            ...intent,
            intent: "buy_product",
            item: smart.item,
            quantity: smart.quantity ?? 1,
            quantityExplicit: Boolean(smart.quantity),
          };
          state = { ...state, intent };
        } else if (smart.action === "ask_catalog") {
          return { newState: { ...state, step: "idle", intent: null, searchResults: [] }, final: guideCatalogOverview() };
        } else if (smart.action === "greeting") {
          return {
            newState: initialWarungState(),
            final: greetingResponse(),
          };
        } else {
          return { newState: { ...state, step: "idle", intent }, final: guideUnknown() };
        }
      } catch {
        return { newState: { ...state, step: "idle", intent }, final: guideUnknown() };
      }
    }

    if (!wantsBuy) {
      return { newState: { ...state, step: "idle", intent }, final: guideUnknown() };
    }
  }

  if (!intent.item || intent.item.length < 2) {
    return { newState: { ...state, step: "idle", intent }, final: askMissingItem() };
  }

  // ── Searching ─────────────────────────────────────────────────────

  state = { ...state, step: "searching" as const };

  emitFindProducts();
  await delaySearch();

  let fullResults = findItems({ query: intent.item, category: null, location: intent.location });
  let budgetNote = "";
  if (intent.budget && Number.isFinite(intent.budget) && intent.budget > 0 && fullResults.length > 0) {
    const withinBudget = fullResults.filter((p) => p.price <= intent.budget!);
    if (withinBudget.length > 0) {
      fullResults = withinBudget;
      budgetNote = `\n\n_Filter budget aktif: maksimal ${formatRp(intent.budget)}._`;
    } else {
      // No exact budget match: keep nearest options first so user still gets useful recommendations.
      fullResults = [...fullResults].sort(
        (a, b) =>
          Math.abs(a.price - intent.budget!) - Math.abs(b.price - intent.budget!) || a.price - b.price,
      );
      budgetNote = `\n\n_Tidak ada yang <= ${formatRp(intent.budget)}. Aku tampilkan yang paling dekat budget._`;
    }
  }

  if (fullResults.length === 0) {
    return {
      newState: { ...state, step: "idle", searchResults: [], intent },
      final: {
        content: `Belum ketemu di katalog **kopi & grocery** ini. Coba kata kunci seperti **kopi**, **espresso**, **apel**, **bayam**, **beras**, atau **indomie**.\n\n_${WARUNG_TAGLINE_ID}_`,
        toolUsages: [{ name: "find_items", status: "complete" }],
        isStreaming: false,
      },
    };
  }

  const qty = intent.quantity;
  const preferCheapest = /murah|termurah|paling\s+murah|yang\s+murah/i.test(text);

  if (preferCheapest) {
    const cheapest = fullResults.reduce((a, b) => (a.price <= b.price ? a : b));
    const cappedForState =
      fullResults.length > MAX_PRODUCT_LIST_RESULTS
        ? fullResults.slice(0, MAX_PRODUCT_LIST_RESULTS)
        : fullResults;
    state = { ...state, searchResults: cappedForState, intent };
    return transitionToStoreSelection(state, cheapest, qty, patch);
  }

  // Single result → auto-select → show stores
  if (fullResults.length === 1) {
    state = { ...state, searchResults: fullResults, intent };
    return transitionToStoreSelection(state, fullResults[0], qty, patch);
  }

  const results =
    fullResults.length > MAX_PRODUCT_LIST_RESULTS
      ? fullResults.slice(0, MAX_PRODUCT_LIST_RESULTS)
      : fullResults;
  const listNote =
    fullResults.length > MAX_PRODUCT_LIST_RESULTS
      ? `\n\n_(Menampilkan ${MAX_PRODUCT_LIST_RESULTS} dari ${fullResults.length} hasil — persempit kata kunci biar lebih pas.)_`
      : "";

  const newState: WarungConversationState = {
    ...state,
    step: "selecting",
    searchResults: results,
    quantity: qty,
  };

  return {
    newState,
    final: {
      content: `Nih opsinya — pilih satu (ketik nomor urut, nama item, atau **yang murah**):${listNote}${budgetNote}\n\n_${WARUNG_TAGLINE_ID}_`,
      commerce: { kind: "products", items: results, quantity: qty },
      toolUsages: [{ name: "find_items", status: "complete" }],
      isStreaming: false,
    },
  };
}

// ─── Confirm shortcut ───────────────────────────────────────────────

export async function runWarungConfirmTurn(params: {
  state: WarungConversationState;
  patchAssistant: PatchFn;
}): Promise<TurnResult> {
  return runWarungUserTextTurn({
    state: params.state,
    userText: "ya",
    patchAssistant: params.patchAssistant,
  });
}
