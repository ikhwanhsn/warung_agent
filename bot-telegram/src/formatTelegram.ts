import type { CommerceAttachment, WarungAssistantPayload } from "./warung/types.js";

function formatRp(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

/** Strip Warung/UI markdown (**bold**, _italic_) for plain Telegram text */
export function warungToPlainText(s: string): string {
  return s
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .trim();
}

function appendCommerce(base: string, commerce: CommerceAttachment | undefined): string {
  if (!commerce) return base;

  if (commerce.kind === "products") {
    const lines = commerce.items.map(
      (it, i) => `${i + 1}. ${it.name} — ${formatRp(it.price)} (${it.provider})`,
    );
    return `${base}\n\n${lines.join("\n")}`;
  }

  if (commerce.kind === "stores") {
    const lines = commerce.stores.map(
      (s, i) => `${i + 1}. ${s.name} — ${s.distanceKm} km\n   ${s.address}`,
    );
    return `${base}\n\n${lines.join("\n\n")}`;
  }

  if (commerce.kind === "review") {
    return base;
  }

  if (commerce.kind === "confirmation") {
    return `${base}\n\nRingkasan: ${commerce.itemName} × ${commerce.quantity} = ${formatRp(commerce.totalPrice)} · ${commerce.provider}`;
  }

  if (commerce.kind === "success") {
    // Message is already in base content from the payment template; avoid duplicating it.
    return base;
  }

  return base;
}

export function formatWarungPayloadForTelegram(p: WarungAssistantPayload): string {
  const plain = warungToPlainText(p.content);
  return appendCommerce(plain, p.commerce).trim();
}

/** Commerce blocks where prices / lists must stay machine-exact — skip LLM rewrite. */
export function hasStructuredCommerce(commerce: WarungAssistantPayload["commerce"]): boolean {
  if (!commerce) return false;
  return (
    commerce.kind === "products" ||
    commerce.kind === "stores" ||
    commerce.kind === "review" ||
    commerce.kind === "confirmation" ||
    commerce.kind === "success"
  );
}
