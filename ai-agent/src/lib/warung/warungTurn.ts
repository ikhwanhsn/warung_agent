import { parseIntent } from "./intentParser";
import { WARUNG_TAGLINE_ID } from "./copy";
import {
  createOrder,
  delaySearch,
  executePayment,
  findItems,
} from "./mockCommerce";
import type {
  CommerceAttachment,
  MockProduct,
  ParsedIntent,
  WarungAssistantPayload,
  WarungConversationState,
} from "./types";

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
  };
}

/** After a completed order, a new user message starts a fresh flow. */
export function prepareStateForUserMessage(state: WarungConversationState): WarungConversationState {
  if (state.step === "done") return initialWarungState();
  return state;
}

export function isAffirmative(text: string): boolean {
  const t = text.trim();
  return /^(ya|yap|yes|ok|oke|sip|baik|konfirmasi|benar|lanjut|gas|boleh)\b/i.test(t);
}

export function isNegative(text: string): boolean {
  const t = text.trim();
  return /^(tidak|engga|ngga|gak|gk|batal|cancel|nanti)\b/i.test(t);
}

export function tryResolveSelection(userText: string, results: MockProduct[]): MockProduct | null {
  if (results.length === 0) return null;
  const t = userText.trim().toLowerCase();
  if (/murah|termurah|paling\s+murah|yang\s+murah/i.test(t)) {
    return results.reduce((a, b) => (a.price <= b.price ? a : b));
  }
  const n = parseInt(t, 10);
  if (Number.isFinite(n) && String(n) === t.trim() && n >= 1 && n <= results.length) {
    return results[n - 1] ?? null;
  }
  for (const p of results) {
    const pn = p.name.toLowerCase();
    if (t.length >= 3 && (pn.includes(t) || t.includes(pn.slice(0, Math.min(6, pn.length))))) {
      return p;
    }
  }
  return null;
}

function formatRp(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

function guideUnknown(): WarungAssistantPayload {
  return {
    content: `Aku **Warung Agent**. Cukup ketik kebutuhanmu, nanti aku bantu cari opsi, bandingkan, sampai checkout.

Coba: **beli kopi 2**, **beli indomie**, atau **cari yang paling murah**.

_${WARUNG_TAGLINE_ID}_`,
  };
}

function askMissingItem(): WarungAssistantPayload {
  return {
    content: `Mau dibelikan apa? Sebut barang + jumlah. Saat ini katalog fokus di kopi & grocery.

_${WARUNG_TAGLINE_ID}_`,
  };
}

function mergeIntent(base: ParsedIntent | null, next: ParsedIntent, raw: string): ParsedIntent {
  if (!base) return next;
  const hasDigit = /\d/.test(raw);
  return {
    intent: next.intent !== "unknown" ? next.intent : base.intent,
    item: next.item ?? base.item,
    quantity: hasDigit ? next.quantity : base.quantity,
    location: next.location ?? base.location,
    budget: next.budget ?? base.budget,
    notes: next.notes ?? base.notes,
  };
}

export interface SelectProductResult {
  newState: WarungConversationState;
  final: WarungAssistantPayload;
}

/** User tapped "Pilih" on a product card */
export function applyProductSelection(
  state: WarungConversationState,
  product: MockProduct,
  quantity: number
): SelectProductResult {
  const total = product.price * quantity;
  const newState: WarungConversationState = {
    ...state,
    step: "confirming",
    selected_item: product,
    quantity,
    total_price: total,
  };
  const commerce: CommerceAttachment = {
    kind: "confirmation",
    itemName: product.name,
    quantity,
    totalPrice: total,
    provider: product.provider,
  };
  return {
    newState,
    final: {
      content: `Oke, **${product.name}** × ${quantity} = **${formatRp(total)}** dari ${product.provider}.\n\nKonfirmasi dulu ya sebelum bayar ✅`,
      commerce,
    },
  };
}

/**
 * Main user text turn (typing in chat). Uses patchAssistant for progress (search / pay).
 */
export async function runWarungUserTextTurn(params: {
  state: WarungConversationState;
  userText: string;
  patchAssistant: (p: WarungAssistantPayload) => void;
}): Promise<{ newState: WarungConversationState; final: WarungAssistantPayload }> {
  let state = prepareStateForUserMessage(params.state);
  const text = params.userText.trim();
  const patch = params.patchAssistant;

  if (state.step === "selecting") {
    const picked = tryResolveSelection(text, state.searchResults);
    if (!picked) {
      return {
        newState: state,
        final: {
          content:
            "Belum kebaca pilihannya. Tap **Pilih** di kartu, atau ketik nomor urut (1, 2, …), nama item, atau **yang murah** ☕",
        },
      };
    }
    return applyProductSelection(state, picked, state.intent?.quantity ?? state.quantity ?? 1);
  }

  if (state.step === "confirming") {
    if (isNegative(text)) {
      const newState = {
        ...initialWarungState(),
        step: "idle" as const,
        intent: null,
      };
      return {
        newState,
        final: { content: "Oke, aku batalin dulu. Mau beli yang lain? Ketik aja barangnya 🛒" },
      };
    }
    if (!isAffirmative(text)) {
      return {
        newState: state,
        final: {
          content: `Kalau sudah sesuai, ketik **ya** atau tap **Konfirmasi**. Kalau mau batal, ketik **batal**.`,
          commerce: state.selected_item
            ? {
                kind: "confirmation",
                itemName: state.selected_item.name,
                quantity: state.quantity,
                totalPrice: state.total_price,
                provider: state.selected_item.provider,
              }
            : undefined,
        },
      };
    }

    state = { ...state, step: "paying" as const };

    patch({
      content: "Memproses pembayaran… ⏳",
      commerce: { kind: "status", message: "Memproses pembayaran…" },
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
    });

    patch({
      content: "Memproses pembayaran… ⏳",
      commerce: { kind: "status", message: "Memproses pembayaran…" },
      toolUsages: [
        { name: "create_order", status: "complete" },
        { name: "execute_payment", status: "running" },
      ],
      isStreaming: true,
    });

    const paid = await executePayment({ amount: state.total_price });

    const newState: WarungConversationState = {
      ...state,
      step: "done",
      order_id: order.order_id,
      transaction_id: paid.transaction_id,
    };

    return {
      newState,
      final: {
          content: `✅ **Pesanan berhasil diproses**\n\nPesanan: **${order.order_id}**\nBayar: **${paid.transaction_id}**\n\n${paid.message}\n\nMau belanja lagi? Tinggal kirim kebutuhan berikutnya.\n\n_${WARUNG_TAGLINE_ID}_`,
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

  // idle (and done already reset)
  const parsed = parseIntent(text);
  let intent = mergeIntent(state.intent, parsed, text);
  state = { ...state, intent };

  const wantsBuy =
    intent.intent === "buy_food" ||
    intent.intent === "buy_product" ||
    intent.intent === "send_item";

  if (!wantsBuy || intent.intent === "unknown") {
    return { newState: { ...state, step: "idle", intent }, final: guideUnknown() };
  }

  if (!intent.item || intent.item.length < 2) {
    return {
      newState: { ...state, step: "idle", intent },
      final: askMissingItem(),
    };
  }

  state = { ...state, step: "searching" as const };

  patch({
    content: "Mencari produk… ☕",
    commerce: { kind: "status", message: "Mencari produk…" },
    toolUsages: [{ name: "find_items", status: "running" }],
    isStreaming: true,
  });

  await delaySearch();

  const results = findItems({
    query: intent.item,
    category: null,
    location: intent.location,
  });

  if (results.length === 0) {
    return {
      newState: {
        ...state,
        step: "idle",
        searchResults: [],
        intent,
      },
      final: {
        content: `Belum ketemu item yang cocok di katalog saat ini. Coba kata kunci seperti **kopi**, **apel**, atau **indomie**.

_${WARUNG_TAGLINE_ID}_`,
        toolUsages: [{ name: "find_items", status: "complete" }],
        isStreaming: false,
      },
    };
  }

  const qty = intent.quantity;
  const preferCheapest = /murah|termurah|paling\s+murah|yang\s+murah/i.test(text);
  if (preferCheapest) {
    const cheapest = results.reduce((a, b) => (a.price <= b.price ? a : b));
    const total = cheapest.price * qty;
    const pickedState: WarungConversationState = {
      ...state,
      step: "confirming",
      selected_item: cheapest,
      searchResults: results,
      quantity: qty,
      total_price: total,
      intent,
    };
    return {
      newState: pickedState,
      final: {
        content: `Kamu minta yang hemat — aku pilih **${cheapest.name}** (${formatRp(cheapest.price)} / pcs).\n\nTotal **${formatRp(total)}** (qty ${qty}). Konfirmasi dulu sebelum bayar ✅`,
        commerce: {
          kind: "confirmation",
          itemName: cheapest.name,
          quantity: qty,
          totalPrice: total,
          provider: cheapest.provider,
        },
        toolUsages: [{ name: "find_items", status: "complete" }],
        isStreaming: false,
      },
    };
  }

  const newState: WarungConversationState = {
    ...state,
    step: "selecting",
    searchResults: results,
    quantity: qty,
  };

  const intro = `Nih opsinya — pilih satu (tap **Pilih**, nomor urut, atau **yang murah**):`;

  return {
    newState,
    final: {
      content: `${intro}\n\n_${WARUNG_TAGLINE_ID}_`,
      commerce: { kind: "products", items: results, quantity: qty },
      toolUsages: [{ name: "find_items", status: "complete" }],
      isStreaming: false,
    },
  };
}

/** Confirm button — same as affirmative text */
export async function runWarungConfirmTurn(params: {
  state: WarungConversationState;
  patchAssistant: (p: WarungAssistantPayload) => void;
}): Promise<{ newState: WarungConversationState; final: WarungAssistantPayload }> {
  return runWarungUserTextTurn({
    state: params.state,
    userText: "ya",
    patchAssistant: params.patchAssistant,
  });
}
