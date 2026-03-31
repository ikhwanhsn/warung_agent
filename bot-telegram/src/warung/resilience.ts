import type { LlmChatTurn, WarungReplyMode } from "../jatevoClient.js";
import {
  generateWarungReplyFromFacts,
  generateWarungReplyFromFactsWithRetry,
} from "../jatevoClient.js";

export async function generateReplyWithResilience(params: {
  userText: string;
  facts: Record<string, unknown>;
  priorTurns: LlmChatTurn[];
  mode: WarungReplyMode;
}): Promise<string> {
  try {
    return await generateWarungReplyFromFactsWithRetry(params);
  } catch (primaryErr) {
    const fallbackModel = process.env.JATEVO_FALLBACK_MODEL?.trim();
    if (!fallbackModel) {
      throw primaryErr;
    }
    return generateWarungReplyFromFacts({
      ...params,
      modelOverride: fallbackModel,
      facts: {
        ...params.facts,
        fallbackReason: "primary_model_failed",
      },
    });
  }
}
