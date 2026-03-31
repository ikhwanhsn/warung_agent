import type { MockProduct, MockStore, WarungAssistantPayload, WarungConversationState } from "./warung/types.js";

function slimProduct(p: MockProduct): Record<string, string | number | undefined> {
  return { id: p.id, name: p.name, price: p.price, provider: p.provider };
}

function slimStore(s: MockStore): Record<string, string | number> {
  return { id: s.id, name: s.name, address: s.address, distanceKm: s.distanceKm };
}

/**
 * Authoritative JSON the LLM must ground on — no invented inventory beyond this.
 */
export function buildAuthoritativeFacts(params: {
  userText: string;
  stepBeforeTurn: string;
  newState: WarungConversationState;
  final: WarungAssistantPayload;
  draftPlain: string;
}): Record<string, unknown> {
  const s = params.newState;
  const search = s.searchResults.map(slimProduct);
  const stores = s.nearbyStores.map(slimStore);
  const cartItems = (s.cart_items ?? []).map((line) => ({
    product: slimProduct(line.product),
    quantity: line.quantity,
    totalPriceIdr: line.totalPrice,
  }));

  return {
    schema: "warung_agent_facts_v1",
    userMessage: params.userText,
    stepBeforeTurn: params.stepBeforeTurn,
    stepAfterTurn: s.step,
    intent: s.intent,
    selectedItem: s.selected_item ? slimProduct(s.selected_item) : null,
    quantity: s.quantity,
    totalPriceIdr: s.total_price,
    cartItems,
    orderId: s.order_id,
    transactionId: s.transaction_id,
    selectedStore: s.selected_store ? slimStore(s.selected_store) : null,
    nearbyStores: stores,
    searchResults: search.slice(0, 60),
    assistant: {
      contentDraft: params.final.content,
      commerce: params.final.commerce ?? null,
      toolUsages: params.final.toolUsages ?? null,
      showQris: params.final.showQris ?? false,
      isStreaming: params.final.isStreaming ?? false,
    },
    /** Pre-rendered plain text (numbers must match commerce). */
    draftPlainForTelegram: params.draftPlain,
  };
}

export function buildPatchFacts(params: {
  userText: string;
  patchPlain: string;
  toolUsages?: WarungAssistantPayload["toolUsages"];
  isStreaming?: boolean;
}): Record<string, unknown> {
  return {
    schema: "warung_agent_patch_v1",
    userMessage: params.userText,
    kind: "streaming_status",
    patchPlain: params.patchPlain,
    toolUsages: params.toolUsages ?? null,
    isStreaming: params.isStreaming ?? false,
  };
}
