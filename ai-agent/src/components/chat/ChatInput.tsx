import { useState, useRef, useEffect, useImperativeHandle, forwardRef, KeyboardEvent } from "react";
import { Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface ChatInputHandle {
  focus: () => void;
  /** Set the input value (e.g. when editing a user question). */
  setValue: (value: string) => void;
}

interface ModelOption {
  id: string;
  name: string;
}

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  onStop?: () => void;
  placeholder?: string;
  /** Model selector inside input (ChatGPT-style) */
  models?: ModelOption[];
  selectedModelId?: string;
  onSelectModel?: (modelId: string) => void;
}

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(function ChatInput(
  {
    onSend,
    isLoading = false,
    onStop,
    placeholder = "Message Warung Agent...",
    models = [],
    selectedModelId = "",
    onSelectModel,
  },
  ref
) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
    },
    setValue: (value: string) => {
      setMessage(value);
      textareaRef.current?.focus();
    },
  }), []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [message]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full min-w-0 border-t border-border bg-background/80 backdrop-blur-xl pb-[max(0.5rem,env(safe-area-inset-bottom,0))] shrink-0 safe-area-bottom">
      <div className="w-full min-w-0 max-w-4xl xl:max-w-5xl mx-auto px-3 py-2 sm:py-2.5 sm:px-4 md:px-5 md:py-3 lg:px-6">
        <div className="relative flex flex-col gap-2.5 p-2.5 sm:flex-row sm:items-end sm:gap-2 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl border border-border bg-card shadow-soft transition-shadow focus-within:shadow-medium focus-within:border-primary/30 min-h-0 sm:min-h-[52px] md:min-h-[48px] min-w-0">
          {/* Text input — full width on narrow screens; row with controls from sm+ */}
          <textarea
            ref={textareaRef}
            autoFocus
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className={cn(
              "w-full flex-1 min-w-0 min-h-[44px] sm:min-h-[36px] md:min-h-[32px] resize-none bg-transparent text-foreground placeholder:text-muted-foreground",
              "focus:outline-none py-2.5 px-2.5 sm:py-2 sm:px-3 md:py-2.5 text-base leading-normal max-h-[min(40vh,200px)] sm:max-h-[180px] md:max-h-[200px] scrollbar-thin",
              "placeholder:text-sm md:placeholder:text-base"
            )}
            disabled={isLoading}
            aria-label="Message input"
          />

          <div className="flex items-center justify-end gap-2 shrink-0 w-full sm:w-auto sm:justify-end sm:self-end">
            {/* Model selector — hidden below sm; compact sm–md; comfortable lg+ */}
            {models.length > 0 && onSelectModel && (
              <Select
                value={selectedModelId || (models[0]?.id ?? "")}
                onValueChange={onSelectModel}
                disabled={isLoading}
              >
                <SelectTrigger
                  className="hidden sm:flex h-10 sm:h-9 md:h-9 w-auto min-w-[88px] sm:min-w-[100px] md:min-w-[120px] lg:min-w-[128px] gap-1 rounded-lg border border-border bg-muted/50 hover:bg-muted text-foreground text-xs font-medium focus:ring-2 focus:ring-ring focus:ring-offset-0 px-2 sm:px-2.5 md:px-3 [&>span]:truncate shrink-0 touch-manipulation min-h-[44px] sm:min-h-0"
                  title={models.find((m) => m.id === (selectedModelId || models[0]?.id))?.name ?? "Choose model"}
                >
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent align="end" className="max-h-[min(70dvh,32rem)] w-[min(100vw-2rem,20rem)] sm:w-auto overflow-y-auto">
                  {models.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {isLoading ? (
              <Button
                onClick={onStop}
                size="icon"
                className="shrink-0 h-11 w-11 sm:h-10 sm:w-10 md:h-9 md:w-9 min-h-[44px] min-w-[44px] sm:min-h-[44px] sm:min-w-[44px] md:min-h-0 md:min-w-0 rounded-lg bg-destructive hover:bg-destructive/90 touch-manipulation"
                aria-label="Stop generating"
              >
                <Square className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSend}
                size="icon"
                disabled={!message.trim()}
                aria-label="Send message"
                className={cn(
                  "shrink-0 h-11 w-11 sm:h-10 sm:w-10 md:h-9 md:w-9 min-h-[44px] min-w-[44px] sm:min-h-[44px] sm:min-w-[44px] md:min-h-0 md:min-w-0 rounded-lg transition-all touch-manipulation",
                  message.trim()
                    ? "bg-primary hover:bg-primary/90 glow-sm"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
