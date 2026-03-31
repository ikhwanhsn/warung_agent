import type { WarungConversationState } from "./types.js";

interface SessionMemory {
  lastSeenAtMs: number;
  lastUserMessages: string[];
}

interface UserProfileMemory {
  preferredLanguage: "id";
  lastMentionedItems: string[];
}

export interface MemoryContext {
  session: SessionMemory;
  profile: UserProfileMemory;
}

const MAX_MESSAGES = 8;
const MAX_PROFILE_ITEMS = 10;

function extractLikelyItems(text: string): string[] {
  const cleaned = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return [];
  const stop = new Set([
    "beli",
    "pesan",
    "order",
    "mau",
    "yang",
    "dan",
    "atau",
    "tolong",
    "aku",
    "saya",
    "ya",
    "gak",
    "tidak",
  ]);
  return cleaned
    .split(" ")
    .filter((w) => w.length >= 3 && !stop.has(w))
    .slice(0, 3);
}

export class WarungMemoryStore {
  private readonly sessions = new Map<number, SessionMemory>();
  private readonly profiles = new Map<number, UserProfileMemory>();

  touch(chatId: number, userText: string): void {
    const now = Date.now();
    const session = this.sessions.get(chatId) ?? { lastSeenAtMs: now, lastUserMessages: [] };
    session.lastSeenAtMs = now;
    session.lastUserMessages = [...session.lastUserMessages, userText].slice(-MAX_MESSAGES);
    this.sessions.set(chatId, session);

    const profile = this.profiles.get(chatId) ?? {
      preferredLanguage: "id",
      lastMentionedItems: [],
    };
    const extracted = extractLikelyItems(userText);
    if (extracted.length > 0) {
      const merged = [...profile.lastMentionedItems, ...extracted];
      profile.lastMentionedItems = Array.from(new Set(merged)).slice(-MAX_PROFILE_ITEMS);
    }
    this.profiles.set(chatId, profile);
  }

  clearSession(chatId: number): void {
    this.sessions.delete(chatId);
  }

  buildContext(chatId: number, state: WarungConversationState): MemoryContext {
    return {
      session: this.sessions.get(chatId) ?? {
        lastSeenAtMs: Date.now(),
        lastUserMessages: [],
      },
      profile: this.profiles.get(chatId) ?? {
        preferredLanguage: "id",
        lastMentionedItems: state.selected_item ? [state.selected_item.name.toLowerCase()] : [],
      },
    };
  }
}
