import { WARUNG_SYSTEM_KNOWLEDGE } from "./systemKnowledge.js";

const FACT_GROUNDED_SYSTEM = `${WARUNG_SYSTEM_KNOWLEDGE}

You always receive AUTHORITATIVE_FACTS as JSON in the user prompt. Obey it strictly for numbers and catalog data.`;

const BRAIN_SYSTEM = `You are the intent parser for Warung Agent, an Indonesian coffee & grocery commerce chatbot on Telegram.
Given a user message and the current conversation state, determine the user's intent.

RULES:
- Output ONLY a valid JSON object — no prose, no markdown fences.
- "confirm"    → user agrees / says yes to the current order
- "cancel"     → user wants to cancel or abort
- "change_qty" → user wants to change the quantity (populate "quantity")
- "select_item"→ user picks an item from a displayed list (populate "itemIndex" 1-based and/or "item")
- "buy"        → user wants to purchase something new (populate "item", optionally "quantity")
- "ask_catalog"→ user is asking what products are available
- "greeting"   → casual hello / greeting
- "out_of_scope" → request outside coffee & grocery domain
- "unknown"    → cannot determine intent

Response schema: { "action": string, "item": string|null, "quantity": number|null, "itemIndex": number|null }`;

/** OpenAI-compatible base (Jatevo Private AI). Override with JATEVO_API_BASE. */
const JATEVO_BASE_DEFAULT = "https://inference.jatevo.id/v1";

const DEFAULT_MODEL = "glm-4.7";

export type WarungReplyMode = "final" | "patch" | "qa";

export interface LlmChatTurn {
  role: "user" | "model";
  text: string;
}

/** Legacy name used by history maps; same shape as LlmChatTurn. */
export type GeminiChatTurn = LlmChatTurn;

export interface GeminiSmartIntent {
  action:
    | "confirm"
    | "cancel"
    | "change_qty"
    | "select_item"
    | "buy"
    | "ask_catalog"
    | "greeting"
    | "out_of_scope"
    | "unknown";
  item?: string | null;
  quantity?: number | null;
  itemIndex?: number | null;
}

function getJatevoBase(): string {
  const raw = process.env.JATEVO_API_BASE?.trim() || JATEVO_BASE_DEFAULT;
  return raw.replace(/\/$/, "");
}

function resolveJatevoModelId(requested?: string | null): string {
  const id = (requested ?? process.env.JATEVO_MODEL?.trim() ?? DEFAULT_MODEL).trim() || DEFAULT_MODEL;
  const map: Record<string, string> = {
    "qwen-2.5-v1-72b": "qwen-2.5-vl-72b",
  };
  return map[id] ?? id;
}

export function isJatevoConfigured(): boolean {
  return Boolean(process.env.JATEVO_API_KEY?.trim());
}

/** @deprecated Use isJatevoConfigured */
export const isGeminiConfigured = isJatevoConfigured;

/** Shown only if Jatevo fails and there is no draft/template to show (e.g. /start). */
export const LLM_UNAVAILABLE_MESSAGE =
  "Maaf, layanan AI sedang gangguan. Coba kirim pesannya lagi sebentar lagi.";

const MAX_LLM_ATTEMPTS = 5;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type FetchError = Error & { status?: number; retryAfterMs?: number };

/** HTTP 429 rate limit */
export function isHttp429(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  return (err as { status?: number }).status === 429;
}

/** @deprecated Use isHttp429 */
export const isGemini429 = isHttp429;

export function getRetryDelayMsFromRateLimit(err: unknown): number {
  const capMs = 120_000;
  const fallbackMs = 45_000;
  if (!isHttp429(err)) return fallbackMs;
  const ra = (err as FetchError).retryAfterMs;
  if (typeof ra === "number" && ra > 0) return Math.min(capMs, ra);
  return fallbackMs;
}

/** @deprecated Use getRetryDelayMsFromRateLimit */
export const getRetryDelayMsFromGemini429 = getRetryDelayMsFromRateLimit;

/**
 * Retries on 429 after waiting; one immediate retry on first non-429 error.
 */
export async function withLlm429Retries<T>(label: string, fn: () => Promise<T>): Promise<T> {
  let last: unknown;
  for (let attempt = 1; attempt <= MAX_LLM_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      const is429 = isHttp429(e);
      if (is429 && attempt < MAX_LLM_ATTEMPTS) {
        const ms = getRetryDelayMsFromRateLimit(e);
        console.warn(`[jatevo] ${label}: 429 — waiting ${ms}ms before retry (${attempt}/${MAX_LLM_ATTEMPTS})`);
        await sleep(ms);
        continue;
      }
      if (!is429 && attempt === 1) {
        console.warn(`[jatevo] ${label}: non-429, immediate retry once`);
        continue;
      }
      throw e;
    }
  }
  throw last;
}

/** @deprecated Use withLlm429Retries */
export const withGemini429Retries = withLlm429Retries;

async function callJatevoChat(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options: { max_tokens?: number; temperature?: number; model?: string },
): Promise<string> {
  const apiKey = process.env.JATEVO_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("JATEVO_API_KEY is not set");
  }

  const model = resolveJatevoModelId(options.model);
  const base = getJatevoBase();
  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      top_p: 1,
      max_tokens: options.max_tokens ?? 2000,
      temperature: options.temperature ?? 0.7,
      presence_penalty: 0,
      frequency_penalty: 0,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as {
    choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    const err = new Error(data?.error?.message ?? response.statusText ?? "Jatevo API error") as FetchError;
    err.status = response.status;
    const ra = response.headers.get("retry-after");
    if (ra) {
      const sec = parseInt(ra, 10);
      if (Number.isFinite(sec)) err.retryAfterMs = sec * 1000;
    }
    throw err;
  }

  const rawContent = data?.choices?.[0]?.message?.content;
  const content =
    typeof rawContent === "string" && rawContent.trim().length > 0
      ? rawContent.trim()
      : "";
  if (!content) {
    throw new Error("Jatevo returned empty content");
  }
  return content;
}

function buildFactUserPrompt(params: {
  userText: string;
  facts: Record<string, unknown>;
  mode: WarungReplyMode;
}): string {
  let modeHint = "";
  if (params.mode === "patch") {
    modeHint =
      "\nMode patch: tulis satu atau dua kalimat singkat (status progres). Jangan mengulang seluruh daftar produk.";
  } else if (params.mode === "qa") {
    modeHint =
      "\nMode qa: jawab pertanyaan seputar kopi/grocery saja. Gunakan catalogHints jika ada. Akhiri dengan saran langkah belanja jika cocok.";
  } else {
    modeHint =
      "\nMode final: balasan lengkap untuk pengguna. Jika facts berisi daftar produk/toko, sertakan dalam bentuk teks yang rapi dengan angka yang sama persis.";
  }

  return `AUTHORITATIVE_FACTS (JSON — satu-satunya sumber kebenaran untuk angka & nama):
${JSON.stringify(params.facts, null, 2)}
${modeHint}

Pesan pengguna:
"""${params.userText}"""

Tulis satu pesan balasan Telegram (plain text, tanpa markdown).`;
}

function priorTurnsToMessages(priorTurns: LlmChatTurn[]): Array<{ role: "user" | "assistant"; content: string }> {
  return priorTurns.map((t) => ({
    role: t.role === "model" ? "assistant" : "user",
    content: t.text,
  }));
}

/**
 * Fact-grounded reply via Jatevo (OpenAI-compatible chat).
 */
export async function generateWarungReplyFromFacts(params: {
  userText: string;
  facts: Record<string, unknown>;
  priorTurns: LlmChatTurn[];
  mode: WarungReplyMode;
}): Promise<string> {
  const userContent = buildFactUserPrompt(params);
  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: FACT_GROUNDED_SYSTEM },
    ...priorTurnsToMessages(params.priorTurns),
    { role: "user", content: userContent },
  ];

  const temperature =
    params.mode === "patch" ? 0.15 : params.mode === "qa" ? 0.35 : 0.25;

  return callJatevoChat(messages, {
    temperature,
    max_tokens: params.mode === "patch" ? 400 : 2000,
  });
}

export async function generateWarungReplyFromFactsWithRetry(
  params: Parameters<typeof generateWarungReplyFromFacts>[0],
): Promise<string> {
  return withLlm429Retries("generateWarungReplyFromFacts", () => generateWarungReplyFromFacts(params));
}

export async function polishReplyWithGemini(params: {
  userText: string;
  draftPlain: string;
  priorTurns: LlmChatTurn[];
}): Promise<string> {
  return generateWarungReplyFromFacts({
    userText: params.userText,
    facts: {
      schema: "legacy_draft_only",
      draftPlainForTelegram: params.draftPlain,
      note: "Ground reply in draftPlain; preserve all numbers and names.",
    },
    priorTurns: params.priorTurns,
    mode: "final",
  });
}

export async function geminiUnderstandIntent(params: {
  userText: string;
  step: string;
  selectedItem?: { name: string; price: number; quantity: number } | null;
  searchResults?: Array<{ name: string; price: number }>;
  storeOptions?: Array<{ name: string; address: string; distanceKm: number }>;
}): Promise<GeminiSmartIntent> {
  const apiKey = process.env.JATEVO_API_KEY?.trim();
  if (!apiKey) return { action: "unknown" };

  let context = `Conversation step: ${params.step}`;
  if (params.selectedItem) {
    context += `\nCurrently selected: ${params.selectedItem.name} × ${params.selectedItem.quantity} = Rp ${(params.selectedItem.price * params.selectedItem.quantity).toLocaleString("id-ID")}`;
  }
  if (params.searchResults?.length) {
    const list = params.searchResults
      .map((p, i) => `${i + 1}. ${p.name} — Rp ${p.price.toLocaleString("id-ID")}`)
      .join("\n");
    context += `\nDisplayed product list:\n${list}`;
  }
  if (params.storeOptions?.length) {
    const list = params.storeOptions
      .map((s, i) => `${i + 1}. ${s.name} — ${s.distanceKm} km (${s.address})`)
      .join("\n");
    context += `\nAvailable stores:\n${list}`;
  }

  const userPrompt = `${context}\n\nUser message: "${params.userText}"\n\nReturn ONLY the JSON object.`;

  const INTENT_ACTIONS = new Set<string>([
    "confirm",
    "cancel",
    "change_qty",
    "select_item",
    "buy",
    "ask_catalog",
    "greeting",
    "out_of_scope",
    "unknown",
  ]);

  function extractJsonObject(s: string): string {
    const t = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const start = t.indexOf("{");
    const end = t.lastIndexOf("}");
    if (start >= 0 && end > start) return t.slice(start, end + 1);
    return t;
  }

  try {
    const raw = await withLlm429Retries("understandIntent", () =>
      callJatevoChat(
        [
          { role: "system", content: BRAIN_SYSTEM },
          { role: "user", content: userPrompt },
        ],
        { temperature: 0, max_tokens: 512 },
      ),
    );
    const parsed = JSON.parse(extractJsonObject(raw)) as Record<string, unknown>;
    const actionRaw = typeof parsed.action === "string" ? parsed.action : "unknown";
    const action = INTENT_ACTIONS.has(actionRaw) ? (actionRaw as GeminiSmartIntent["action"]) : "unknown";
    return {
      action,
      item: typeof parsed.item === "string" ? parsed.item : null,
      quantity: typeof parsed.quantity === "number" ? parsed.quantity : null,
      itemIndex: typeof parsed.itemIndex === "number" ? parsed.itemIndex : null,
    };
  } catch (err) {
    console.error("[jatevo] intent parse failed:", err);
    return { action: "unknown" };
  }
}

export async function answerScopedQuestionWithGemini(params: {
  userText: string;
  catalogHints?: string[];
}): Promise<string> {
  return generateWarungReplyFromFactsWithRetry({
    userText: params.userText,
    facts: {
      schema: "scoped_qa",
      catalogHints: params.catalogHints ?? [],
    },
    priorTurns: [],
    mode: "qa",
  });
}
