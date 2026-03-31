import type { MemoryContext } from "./memory.js";

export interface GroundingMetadata {
  source: "warung_authoritative_facts";
  generatedAtIso: string;
  route: string;
}

export function attachGroundingContext(
  facts: Record<string, unknown>,
  memory: MemoryContext,
  route: string,
): Record<string, unknown> {
  const metadata: GroundingMetadata = {
    source: "warung_authoritative_facts",
    generatedAtIso: new Date().toISOString(),
    route,
  };

  return {
    ...facts,
    grounding: metadata,
    memoryContext: {
      sessionLastMessages: memory.session.lastUserMessages.slice(-4),
      profilePreferences: {
        language: memory.profile.preferredLanguage,
        recentItems: memory.profile.lastMentionedItems.slice(-5),
      },
    },
  };
}
