import type { WarungConversationState } from "./types.js";

export interface SafetyInputResult {
  allowed: boolean;
  reason?: string;
}

const BLOCKED_PROMPT_TOKENS = [
  "ignore all previous instructions",
  "developer message",
  "system prompt",
  "reveal api key",
  "private key",
];

export function validateUserInput(textRaw: string): SafetyInputResult {
  const text = textRaw.trim().toLowerCase();
  if (!text) {
    return { allowed: false, reason: "empty_message" };
  }
  if (text.length > 1000) {
    return { allowed: false, reason: "message_too_long" };
  }
  for (const blocked of BLOCKED_PROMPT_TOKENS) {
    if (text.includes(blocked)) {
      return { allowed: false, reason: "prompt_injection_pattern" };
    }
  }
  return { allowed: true };
}

export function enforcePaymentConfirmation(
  state: WarungConversationState,
  userText: string,
): { requireConfirmation: boolean; safeToExecute: boolean } {
  if (state.step !== "reviewing" && state.step !== "confirming") {
    return { requireConfirmation: false, safeToExecute: true };
  }
  const normalized = userText.trim().toLowerCase();
  const positive = /^(ya|iya|yes|oke|ok|lanjut|konfirmasi)\b/i.test(normalized);
  return {
    requireConfirmation: true,
    safeToExecute: positive,
  };
}
