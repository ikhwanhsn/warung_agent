export type WarungIntentKind = "buy_food" | "buy_product" | "send_item" | "unknown";

export interface ParsedIntent {
  intent: WarungIntentKind;
  item: string | null;
  quantity: number;
  location: string | null;
  budget: number | null;
  notes: string | null;
}

export type WarungStep = "idle" | "searching" | "selecting" | "confirming" | "paying" | "done";

export interface MockProduct {
  id: string;
  name: string;
  price: number;
  provider: string;
  /** One-liner for product cards (mock “hype”) */
  hype?: string;
}

/** Persisted conversation state for the commerce flow */
export interface WarungConversationState {
  step: WarungStep;
  intent: ParsedIntent | null;
  selected_item: MockProduct | null;
  quantity: number;
  total_price: number;
  /** Last search results (for selection UI and "yang murah") */
  searchResults: MockProduct[];
  order_id: string | null;
  transaction_id: string | null;
}

export type CommerceAttachment =
  | { kind: "status"; message: string }
  | { kind: "products"; items: MockProduct[]; quantity: number }
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
}
