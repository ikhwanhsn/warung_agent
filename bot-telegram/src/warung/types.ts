export type WarungIntentKind = "buy_food" | "buy_product" | "send_item" | "unknown";

export interface ParsedIntent {
  intent: WarungIntentKind;
  item: string | null;
  quantity: number;
  /** True when quantity came from a trailing number in the message (e.g. "beli roti 3"). */
  quantityExplicit: boolean;
  location: string | null;
  budget: number | null;
  notes: string | null;
}

export type WarungStep =
  | "idle"
  | "searching"
  | "selecting"
  | "reviewing"
  | "confirming" // legacy — treated same as reviewing
  | "paying"
  | "done";

export interface MockProduct {
  id: string;
  name: string;
  price: number;
  provider: string;
  hype?: string;
}

export interface CartLineItem {
  product: MockProduct;
  quantity: number;
  totalPrice: number;
}

export interface MockStore {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
}

export interface WarungConversationState {
  step: WarungStep;
  intent: ParsedIntent | null;
  selected_item: MockProduct | null;
  quantity: number;
  total_price: number;
  cart_items: CartLineItem[];
  searchResults: MockProduct[];
  order_id: string | null;
  transaction_id: string | null;
  selected_store: MockStore | null;
  nearbyStores: MockStore[];
}

export type CommerceAttachment =
  | { kind: "status"; message: string }
  | { kind: "products"; items: MockProduct[]; quantity: number }
  | {
      kind: "stores";
      stores: MockStore[];
      itemName: string;
      quantity: number;
      unitPrice: number;
    }
  | {
      kind: "review";
      itemName: string;
      quantity: number;
      totalPrice: number;
      unitPrice: number;
      storeName: string;
      storeAddress: string;
      distanceKm: number;
      provider: string;
    }
  | {
      kind: "confirmation";
      itemName: string;
      quantity: number;
      totalPrice: number;
      provider: string;
    }
  | {
      kind: "success";
      orderId: string;
      transactionId: string;
      message: string;
    };

export interface WarungAssistantPayload {
  content: string;
  commerce?: CommerceAttachment;
  toolUsages?: Array<{ name: string; status: "running" | "complete" | "error" }>;
  isStreaming?: boolean;
  /** Signal the bot to send a QRIS payment image alongside this message. */
  showQris?: boolean;
}
