export type TurnLogLevel = "info" | "warn" | "error";

export interface TurnLogEvent {
  level: TurnLogLevel;
  event: string;
  chatId: number;
  route?: string;
  stepBefore?: string;
  stepAfter?: string;
  latencyMs?: number;
  error?: string;
}

export function logTurnEvent(payload: TurnLogEvent): void {
  const ts = new Date().toISOString();
  const line = {
    ts,
    service: "warung-bot-telegram",
    ...payload,
  };
  const rendered = JSON.stringify(line);
  if (payload.level === "error") {
    console.error(rendered);
    return;
  }
  if (payload.level === "warn") {
    console.warn(rendered);
    return;
  }
  console.log(rendered);
}
