import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { Telegraf } from "telegraf";

import type { WarungConversationState } from "./warung/types.js";
import { initialWarungState, runWarungUserTextTurn } from "./warung/index.js";
import { isGreeting } from "./warung/scopeGuard.js";
import type { WarungAssistantPayload } from "./warung/types.js";
import {
  formatWarungPayloadForTelegram,
  warungToPlainText,
} from "./formatTelegram.js";
import { getQrisDemoImageCached } from "./qrisImage.js";
import {
  isGeminiConfigured,
  LLM_UNAVAILABLE_MESSAGE,
  type GeminiChatTurn,
} from "./jatevoClient.js";
import { buildAuthoritativeFacts, buildPatchFacts } from "./warungFacts.js";
import { PurchaseHistoryRepository } from "./warung/purchaseHistoryRepo.js";
import { routeUserIntent } from "./warung/intentRouter.js";
import { WarungMemoryStore } from "./warung/memory.js";
import { attachGroundingContext } from "./warung/grounding.js";
import { logTurnEvent } from "./warung/observability.js";
import { enforcePaymentConfirmation, validateUserInput } from "./warung/safety.js";
import { generateReplyWithResilience } from "./warung/resilience.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

/** PaaS web services (e.g. Render) expect a listener on PORT; long-polling bots otherwise fail deploy health checks. */
function startOptionalHealthServer(): void {
  const portRaw = process.env.PORT?.trim();
  if (!portRaw) return;
  const port = Number(portRaw);
  if (!Number.isFinite(port) || port <= 0) return;

  const server = http.createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("ok");
  });

  server.on("error", (err) => {
    console.error("[warung-bot-telegram] health server error:", err);
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`[warung-bot-telegram] health check listening on :${port}`);
  });
}

function parseAllowedChatIds(): Set<number> | null {
  const raw = process.env.TELEGRAM_ALLOWED_CHAT_IDS?.trim();
  if (!raw) return null;
  const ids = raw
    .split(/[\s,]+/)
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n));
  return ids.length ? new Set(ids) : null;
}

function createSerialQueue() {
  let tail: Promise<void> = Promise.resolve();
  return (fn: () => Promise<void>) => {
    tail = tail
      .then(() => fn())
      .catch((err: unknown) => {
        console.error("[warung-bot-telegram]", err);
      });
  };
}

const HELP_TEXT = `Warung Agent di Telegram untuk kopi dan kebutuhan warung.

Ketik kebutuhan dalam bahasa Indonesia. Contoh: beli kopi 2, beli beras 1, beli indomie atau bayam atau telur, cari yang paling murah.

Setelah ada daftar produk, balas dengan nomor, nama item, atau kata yang murah. Lalu pilih toko terdekat, cek detail dan QRIS, lalu konfirmasi.

Perintah: /start  /help  /history  /reset`;

const HISTORY_TRIGGER_RE = /\b(riwayat|history)\b.*\b(beli|belanja|pesan|order|produk)\b|\b(beli|belanja|pesan|order|produk)\b.*\b(riwayat|history)\b/i;

function formatRp(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

function buildHistoryReply(
  rows: ReturnType<PurchaseHistoryRepository["getRecentByChat"]>,
): string {
  if (rows.length === 0) {
    return "Belum ada riwayat pembelian di chat ini.\n\nCoba beli produk dulu, lalu ketik /history lagi.";
  }

  const lines = rows.map((row, i) => {
    const storeText = row.storeName ? ` | ${row.storeName}` : "";
    return `${i + 1}. ${row.productName} x${row.quantity}\n   Total: ${formatRp(row.totalPrice)} | Order: ${row.orderId}${storeText}\n   Waktu: ${row.createdAt}`;
  });

  return `Riwayat pembelian kamu (terbaru):\n\n${lines.join("\n\n")}`;
}

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    console.error("Missing TELEGRAM_BOT_TOKEN. Copy bot-telegram/.env.example to .env and set the token.");
    process.exit(1);
  }

  if (!isGeminiConfigured()) {
    console.error(
      "Missing JATEVO_API_KEY. All bot replies use Jatevo inference; set JATEVO_API_KEY in bot-telegram/.env (see .env.example).",
    );
    process.exit(1);
  }

  const allowedChats = parseAllowedChatIds();
  const purchaseHistory = new PurchaseHistoryRepository(
    path.resolve(__dirname, "../data/purchase-history.sqlite"),
  );
  const stateByChat = new Map<number, WarungConversationState>();
  const llmHistoryByChat = new Map<number, GeminiChatTurn[]>();
  const lastSeenByChat = new Map<number, number>();
  const turnQueueByChat = new Map<number, Promise<void>>();
  /** Tracks whether the QRIS image was already sent in the current checkout session. */
  const qrisSentByChat = new Map<number, boolean>();
  const memoryStore = new WarungMemoryStore();
  const MAX_LLM_TURNS = 20;
  const SESSION_IDLE_TTL_MS = 10 * 60 * 1000;

  function resetSession(chatId: number) {
    stateByChat.set(chatId, initialWarungState());
    llmHistoryByChat.delete(chatId);
    qrisSentByChat.delete(chatId);
    memoryStore.clearSession(chatId);
  }

  const runInChatQueue = (chatId: number, task: () => Promise<void>): Promise<void> => {
    const prev = turnQueueByChat.get(chatId) ?? Promise.resolve();
    const next = prev
      .catch(() => {
        /* keep queue alive after previous failure */
      })
      .then(task)
      .catch((err: unknown) => {
        console.error("[warung-bot-telegram] queued turn failed", err);
      })
      .finally(() => {
        if (turnQueueByChat.get(chatId) === next) {
          turnQueueByChat.delete(chatId);
        }
      });
    turnQueueByChat.set(chatId, next);
    return next;
  };

  const bot = new Telegraf(token);

  bot.start(async (ctx) => {
    resetSession(ctx.chat.id);
    try {
      const welcome = await generateReplyWithResilience({
        userText: "/start",
        facts: {
          schema: "onboarding",
          helpReference: HELP_TEXT,
          instruction:
            "Sapa pengguna yang baru buka bot. Jelaskan Warung Agent (kopi & grocery) dan ringkas cara pakai dari helpReference.",
        },
        priorTurns: [],
        mode: "final",
      });
      await ctx.reply(welcome);
    } catch (err) {
      console.error("[warung-bot-telegram] Gemini /start failed:", err);
      await ctx.reply(LLM_UNAVAILABLE_MESSAGE);
    }
  });

  bot.help(async (ctx) => {
    try {
      const help = await generateReplyWithResilience({
        userText: "/help",
        facts: {
          schema: "help",
          helpReference: HELP_TEXT,
          instruction: "Jelaskan singkat cara pakai Warung Agent berdasarkan helpReference.",
        },
        priorTurns: [],
        mode: "final",
      });
      await ctx.reply(help);
    } catch (err) {
      console.error("[warung-bot-telegram] Gemini /help failed:", err);
      await ctx.reply(LLM_UNAVAILABLE_MESSAGE);
    }
  });

  bot.command("reset", async (ctx) => {
    resetSession(ctx.chat.id);
    try {
      const msg = await generateReplyWithResilience({
        userText: "/reset",
        facts: {
          schema: "session_reset",
          instruction:
            "Pengguna memutus sesi belanja. Jawab singkat dalam bahasa Indonesia: sesi sudah direset, silakan mulai lagi dengan barang yang mau dibeli.",
        },
        priorTurns: [],
        mode: "final",
      });
      await ctx.reply(msg);
    } catch (err) {
      console.error("[warung-bot-telegram] Gemini /reset failed:", err);
      await ctx.reply(LLM_UNAVAILABLE_MESSAGE);
    }
  });

  bot.command("history", async (ctx) => {
    const rows = purchaseHistory.getRecentByChat(ctx.chat.id, 10);
    await ctx.reply(buildHistoryReply(rows));
  });

  bot.on("text", async (ctx, next) => {
    const text = ctx.message.text?.trim() ?? "";
    if (text.startsWith("/")) return next();

    const chatId = ctx.chat.id;
    if (allowedChats && !allowedChats.has(chatId)) {
      await ctx.reply("Bot ini tidak tersedia untuk chat ini.");
      return;
    }

    return runInChatQueue(chatId, async () => {
      const startedAt = Date.now();
      const enqueue = createSerialQueue();
      const now = Date.now();
      const lastSeen = lastSeenByChat.get(chatId) ?? 0;
      const timedOut = lastSeen > 0 && now - lastSeen > SESSION_IDLE_TTL_MS;
      lastSeenByChat.set(chatId, now);

      if (timedOut) {
        resetSession(chatId);
      }

      if (isGreeting(text)) {
        resetSession(chatId);
      }

      const state = stateByChat.get(chatId) ?? initialWarungState();
      const route = routeUserIntent(text);
      const inputSafety = validateUserInput(text);
      if (!inputSafety.allowed) {
        await ctx.reply("Pesanmu belum bisa diproses dengan aman. Coba tulis ulang lebih singkat dan jelas.");
        logTurnEvent({
          level: "warn",
          event: "turn_blocked_by_safety",
          chatId,
          route: route.route,
          stepBefore: state.step,
          error: inputSafety.reason,
        });
        return;
      }
      memoryStore.touch(chatId, text);
      const paymentSafety = enforcePaymentConfirmation(state, text);
      if (
        paymentSafety.requireConfirmation &&
        !paymentSafety.safeToExecute &&
        /\b(bayar|bayarin|proses|lanjut)\b/i.test(text)
      ) {
        await ctx.reply("Untuk keamanan pembayaran, tulis **ya** untuk konfirmasi atau **batal** untuk membatalkan.");
        logTurnEvent({
          level: "warn",
          event: "payment_confirmation_required",
          chatId,
          route: route.route,
          stepBefore: state.step,
        });
        return;
      }
      if (HISTORY_TRIGGER_RE.test(text)) {
        const rows = purchaseHistory.getRecentByChat(chatId, 10);
        await ctx.reply(buildHistoryReply(rows));
        return;
      }
      const stepBeforeTurn = state.step;

      const patchAssistant = (p: WarungAssistantPayload) => {
        enqueue(async () => {
          await ctx.sendChatAction("typing");
          if (p.content?.trim()) {
            const patchDraft = warungToPlainText(p.content);
            let patchText: string;
            try {
              const memory = memoryStore.buildContext(chatId, state);
              patchText = await generateReplyWithResilience({
                userText: text,
                facts: attachGroundingContext(
                  buildPatchFacts({
                    userText: text,
                    patchPlain: patchDraft,
                    toolUsages: p.toolUsages,
                    isStreaming: p.isStreaming,
                  }),
                  memory,
                  route.route,
                ),
                priorTurns: llmHistoryByChat.get(chatId) ?? [],
                mode: "patch",
              });
            } catch (err) {
              console.error("[warung-bot-telegram] Gemini failed on patch reply:", err);
              patchText = patchDraft.trim() ? patchDraft : LLM_UNAVAILABLE_MESSAGE;
            }
            await ctx.reply(patchText);
          }
        });
      };

      await ctx.sendChatAction("typing");
      const { newState, final } = await runWarungUserTextTurn({
        state,
        userText: text,
        patchAssistant,
      });
      stateByChat.set(chatId, newState);

      const draftPlain = formatWarungPayloadForTelegram(final);

      enqueue(async () => {
        await ctx.sendChatAction("typing");
        const prior = llmHistoryByChat.get(chatId) ?? [];
        const memory = memoryStore.buildContext(chatId, newState);
        const facts = attachGroundingContext(buildAuthoritativeFacts({
          userText: text,
          stepBeforeTurn,
          newState,
          final,
          draftPlain,
        }), memory, route.route);
        let replyText: string;
        if (final.commerce?.kind === "success") {
          // Keep template as sent (✅ + exact IDs); LLM polish would drop the checkmark per style rules.
          replyText = draftPlain.trim() || LLM_UNAVAILABLE_MESSAGE;
        } else {
          try {
            replyText = await generateReplyWithResilience({
              userText: text,
              facts,
              priorTurns: prior,
              mode: "final",
            });
          } catch (err) {
            console.error("[warung-bot-telegram] Gemini failed on final reply:", err);
            replyText = draftPlain.trim() ? draftPlain : LLM_UNAVAILABLE_MESSAGE;
          }
        }
        await ctx.reply(replyText);

        if (
          final.commerce?.kind === "success" &&
          Number.isFinite(state.total_price) &&
          state.total_price > 0 &&
          ((state.cart_items?.length ?? 0) > 0 || state.selected_item)
        ) {
          const cart = state.cart_items ?? [];
          const summaryName =
            cart.length > 0
              ? cart.length === 1
                ? cart[0]!.product.name
                : `${cart.length} item (${cart.slice(0, 2).map((line) => line.product.name).join(", ")}${cart.length > 2 ? ", ..." : ""})`
              : state.selected_item!.name;
          const totalQty =
            cart.length > 0
              ? cart.reduce((sum, line) => sum + line.quantity, 0)
              : state.quantity;
          const provider =
            cart.length > 0
              ? cart.length === 1
                ? cart[0]!.product.provider
                : "multi-provider"
              : state.selected_item!.provider;
          const productId =
            cart.length > 0
              ? cart.length === 1
                ? cart[0]!.product.id
                : `cart-${cart.length}-items`
              : state.selected_item!.id;
          purchaseHistory.savePurchase({
            chatId,
            telegramUserId: ctx.from?.id ?? null,
            telegramUsername: ctx.from?.username ?? null,
            orderId: final.commerce.orderId,
            transactionId: final.commerce.transactionId,
            productId,
            productName: summaryName,
            quantity: totalQty,
            totalPrice: state.total_price,
            provider,
            storeName: state.selected_store?.name ?? null,
          });
        }

        // Send QRIS once per checkout — only at the review step (showQris flag).
        // Session-level flag prevents the second send when user types "ya".
        if (final.showQris && !qrisSentByChat.get(chatId)) {
          qrisSentByChat.set(chatId, true);
          const img = await getQrisDemoImageCached();
          if (img) {
            const totalIdr =
              final.commerce?.kind === "review" ? final.commerce.totalPrice : null;
            let caption: string;
            try {
              caption = await generateReplyWithResilience({
                userText: text,
                facts: {
                  schema: "qris_payment_caption",
                  totalIdr,
                  instruction:
                    "Tulis caption singkat bahasa Indonesia untuk gambar pembayaran QRIS: sebut total tagihan (IDR) jika ada, minta scan kode QR untuk bayar, lalu ketik ya untuk konfirmasi. Nada seperti pembayaran biasa di merchant. Tanpa markdown. Tanpa kata simulasi, demo, atau latihan. Maksimal satu emoji jika perlu.",
                },
                priorTurns: [],
                mode: "final",
              });
            } catch (err) {
              console.error("[warung-bot-telegram] Gemini QRIS caption failed:", err);
              caption =
                totalIdr != null
                  ? `Total tagihan Rp ${totalIdr.toLocaleString("id-ID")}. Scan kode QR untuk bayar, lalu ketik ya untuk konfirmasi.`
                  : `Scan kode QR untuk bayar, lalu ketik ya untuk konfirmasi.`;
            }
            await ctx.replyWithPhoto({ source: img.buffer, filename: img.filename }, { caption });
          }
        }

        // Clear the QRIS flag after payment succeeds so the next checkout can show it again.
        if (newState.step === "done") {
          qrisSentByChat.delete(chatId);
        }

        const hist = llmHistoryByChat.get(chatId) ?? [];
        const nextTurns: GeminiChatTurn[] = [
          ...hist,
          { role: "user", text },
          { role: "model", text: replyText },
        ];
        llmHistoryByChat.set(
          chatId,
          nextTurns.length > MAX_LLM_TURNS ? nextTurns.slice(-MAX_LLM_TURNS) : nextTurns,
        );
        logTurnEvent({
          level: "info",
          event: "turn_completed",
          chatId,
          route: route.route,
          stepBefore: stepBeforeTurn,
          stepAfter: newState.step,
          latencyMs: Date.now() - startedAt,
        });
      });

      await new Promise<void>((resolve) => {
        enqueue(async () => {
          resolve();
        });
      });
    });
  });

  bot.catch((err) => {
    console.error("[warung-bot-telegram] bot error", err);
  });

  startOptionalHealthServer();
  await bot.launch();
  console.log("[warung-bot-telegram] polling started (Jatevo LLM required for all user-visible text)");

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
