import { useState, useEffect, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { User, Copy, Check, RefreshCw, Wrench, Loader2, AlertCircle, Pencil, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { CommerceAttachment, MockProduct } from "@/lib/warung/types";

/** Context-specific step sequences — each tells a short "story" relevant to the user's question. */
const STEP_SEQUENCES: Record<string, string[]> = {
  news: [
    "Understanding your question...",
    "Finding relevant news and headlines...",
    "Checking sources and dates...",
    "Reading and summarizing...",
    "Preparing your answer...",
  ],
  search: [
    "Understanding what you're looking for...",
    "Searching across sources...",
    "Filtering relevant results...",
    "Organizing findings...",
    "Preparing your answer...",
  ],
  analysis: [
    "Understanding your question...",
    "Analyzing market data...",
    "Checking sentiment and signals...",
    "Gathering insights...",
    "Preparing your answer...",
  ],
  research: [
    "Understanding the topic...",
    "Running deep research...",
    "Checking reports and data...",
    "Synthesizing findings...",
    "Preparing your answer...",
  ],
  signals: [
    "Understanding your question...",
    "Checking trading signals and data...",
    "Analyzing price and charts...",
    "Gathering signal insights...",
    "Preparing your answer...",
  ],
  tokens: [
    "Understanding your question...",
    "Fetching token and market data...",
    "Analyzing metrics...",
    "Gathering insights...",
    "Preparing your answer...",
  ],
  default: [
    "Thinking about your question...",
    "Looking that up...",
    "Gathering information...",
    "Preparing your answer...",
  ],
};

/** Pick a step sequence that matches the user's message. */
function getStepsForMessage(userMessage: string | undefined): string[] {
  if (!userMessage || typeof userMessage !== "string")
    return STEP_SEQUENCES.default;
  const t = userMessage.trim().toLowerCase();
  if (/news|latest|headline|article|what'?s\s+happening/i.test(t)) return STEP_SEQUENCES.news;
  if (/search|find|x\s*search|twitter|look\s+up/i.test(t)) return STEP_SEQUENCES.search;
  if (/analyze|analysis|sentiment|market\s+overview/i.test(t)) return STEP_SEQUENCES.analysis;
  if (/research|deep\s*dive|report|explain\s+in\s+detail/i.test(t)) return STEP_SEQUENCES.research;
  if (/signal|trade|price|chart|trading/i.test(t)) return STEP_SEQUENCES.signals;
  if (/token|memecoin|dex|jupiter|pump|rug|bubble/i.test(t)) return STEP_SEQUENCES.tokens;
  return STEP_SEQUENCES.default;
}

export type ToolUsageItem = { name: string; status: "running" | "complete" | "error" };

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  toolUsage?: ToolUsageItem;
  /** Optional: multiple tools used for this answer (future API support). */
  toolUsages?: ToolUsageItem[];
  /** Warung Agent: structured commerce UI (not persisted to legacy API). */
  commerce?: CommerceAttachment;
}

interface ChatMessageProps {
  message: Message;
  agentName?: string;
  agentAvatar?: string;
  onRegenerate?: (messageId: string) => void;
  /** When true, disable Regenerate (e.g. while another request is in progress) */
  isRegenerateDisabled?: boolean;
  /** User avatar URL for user messages */
  userAvatarUrl?: string | null;
  /** When user saves an edited user message: (messageId, newContent) => update in place */
  onUpdateUserMessage?: (messageId: string, content: string) => void;
  /** Warung: pick product from card */
  onSelectProduct?: (productId: string) => void;
  /** Warung: confirm checkout */
  onConfirmOrder?: () => void;
  /** Disable commerce actions while agent is busy */
  commerceActionsDisabled?: boolean;
}

function formatIdr(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

function CommerceBlock({
  commerce,
  onSelectProduct,
  onConfirmOrder,
  disabled,
}: {
  commerce: CommerceAttachment;
  onSelectProduct?: (productId: string) => void;
  onConfirmOrder?: () => void;
  disabled?: boolean;
}) {
  if (commerce.kind === "status") {
    return (
      <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 flex items-center gap-2 text-sm text-foreground">
        <Loader2 className="w-4 h-4 shrink-0 animate-spin text-primary" aria-hidden />
        <span>{commerce.message}</span>
      </div>
    );
  }

  if (commerce.kind === "products") {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 md:gap-4 w-full min-w-0">
        {commerce.items.map((p: MockProduct) => (
          <Card key={p.id} className="overflow-hidden border-border/80 shadow-sm">
            <CardHeader className="p-4 pb-2 space-y-1">
              <CardTitle className="text-base font-semibold leading-snug">{p.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{p.provider}</p>
              {p.hype ? (
                <p className="text-xs text-primary/80 italic leading-snug pt-0.5">{p.hype}</p>
              ) : null}
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-lg font-bold tabular-nums text-foreground">{formatIdr(p.price)}</p>
              {commerce.quantity > 1 ? (
                <p className="text-xs text-muted-foreground mt-1">Qty pesanan: {commerce.quantity}</p>
              ) : null}
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button
                type="button"
                size="sm"
                className="w-full gap-2"
                disabled={disabled || !onSelectProduct}
                onClick={() => onSelectProduct?.(p.id)}
              >
                <ShoppingCart className="w-4 h-4" aria-hidden />
                Pilih
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (commerce.kind === "confirmation") {
    return (
      <Card className="border-amber-500/30 bg-amber-500/5 w-full max-w-md mx-auto sm:mx-0">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">Ringkasan pesanan</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Item:</span>{" "}
            <span className="font-medium text-foreground">{commerce.itemName}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Qty:</span>{" "}
            <span className="font-medium tabular-nums">{commerce.quantity}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Penyedia:</span>{" "}
            <span className="font-medium">{commerce.provider}</span>
          </p>
          <p className="text-lg font-bold tabular-nums pt-1">{formatIdr(commerce.totalPrice)}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-col gap-2">
          <Button
            type="button"
            className="w-full"
            disabled={disabled || !onConfirmOrder}
            onClick={() => onConfirmOrder?.()}
          >
            Konfirmasi
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (commerce.kind === "success") {
    return (
      <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-3 space-y-1 text-sm">
        <p className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
          <span aria-hidden>✅</span> Pesanan berhasil
        </p>
        <p className="text-muted-foreground">
          Order <span className="font-mono text-foreground">{commerce.orderId}</span> · TX{" "}
          <span className="font-mono text-foreground">{commerce.transactionId}</span>
        </p>
        <p className="text-foreground">{commerce.message}</p>
      </div>
    );
  }

  return null;
}

/** Generate a cute, unique avatar for user messages */
function getUserAvatar(messageId: string) {
  // Generate a consistent color based on message ID hash
  const colors = [
    { gradient: "from-pink-500 to-rose-500", emoji: "✨" },
    { gradient: "from-blue-500 to-cyan-500", emoji: "🌟" },
    { gradient: "from-purple-500 to-pink-500", emoji: "💫" },
    { gradient: "from-orange-500 to-yellow-500", emoji: "⭐" },
    { gradient: "from-green-500 to-emerald-500", emoji: "🎯" },
    { gradient: "from-indigo-500 to-purple-500", emoji: "🚀" },
    { gradient: "from-rose-500 to-pink-500", emoji: "💎" },
    { gradient: "from-cyan-500 to-blue-500", emoji: "👑" },
  ];
  
  // Use message ID to generate consistent hash
  let hash = 0;
  for (let i = 0; i < messageId.length; i++) {
    hash = ((hash << 5) - hash) + messageId.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return colors[Math.abs(hash) % colors.length];
}

export function ChatMessage({
  message,
  agentName = "Warung Agent",
  agentAvatar = "/images/logo-transparent.png",
  onRegenerate,
  isRegenerateDisabled,
  userAvatarUrl = null,
  onUpdateUserMessage,
  onSelectProduct,
  onConfirmOrder,
  commerceActionsDisabled,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState("");
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const isUser = message.role === "user";
  // Use provided avatarUrl or fallback to generated avatar
  const userAvatar = useMemo(() => {
    if (userAvatarUrl) {
      return { avatarUrl: userAvatarUrl };
    }
    return getUserAvatar(message.id);
  }, [message.id, userAvatarUrl]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startEditing = () => {
    setEditDraft(message.content);
    setIsEditing(true);
  };

  useEffect(() => {
    if (isEditing && isUser) {
      editTextareaRef.current?.focus();
      const len = message.content.length;
      editTextareaRef.current?.setSelectionRange(len, len);
    }
  }, [isEditing, isUser, message.content.length]);

  const saveEdit = () => {
    const trimmed = editDraft.trim();
    if (trimmed && onUpdateUserMessage) {
      onUpdateUserMessage(message.id, trimmed);
      setIsEditing(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditDraft("");
  };

  const markdownComponents: Components = {
    // Tables: scrollable container and styled cells
    table: ({ children, ...props }) => (
      <div className="my-4 overflow-x-auto rounded-xl border border-border max-w-full scrollbar-thin -mx-1 sm:mx-0">
        <table className="w-full min-w-[240px] sm:min-w-[400px] border-collapse text-sm" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="bg-secondary/60 border-b border-border" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }) => <tbody className="divide-y divide-border" {...props}>{children}</tbody>,
    tr: ({ children, ...props }) => (
      <tr className="hover:bg-secondary/30 transition-colors" {...props}>
        {children}
      </tr>
    ),
    th: ({ children, ...props }) => (
      <th className="px-4 py-3 text-left font-semibold text-foreground align-top" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="px-4 py-3 text-muted-foreground align-top break-words min-w-0" {...props}>
        {children}
      </td>
    ),
    // Code: block with Copy button vs inline
    code: ({ node, className, children, ...props }) => {
      const code = String(children).replace(/\n$/, "");
      const hasLanguage = className?.startsWith("language-");
      const isBlock = hasLanguage || code.includes("\n");
      const lang = className?.replace("language-", "") ?? "plaintext";
      // Detect very long single-line strings (like transaction signatures)
      const isLongSingleLine = !code.includes("\n") && code.length > 40;
      if (isBlock) {
        return (
          <div className="my-3 rounded-xl overflow-hidden border border-border max-w-full min-w-0">
            <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-4 bg-secondary/50 border-b border-border min-w-0">
              <span className="text-xs font-medium text-muted-foreground truncate min-w-0">{lang}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 sm:h-7 gap-1.5 text-xs shrink-0 min-h-[36px] sm:min-h-0 touch-manipulation"
                onClick={() => navigator.clipboard.writeText(code)}
                title="Copy code"
                aria-label="Copy code"
              >
                <Copy className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
            </div>
            <pre className={cn(
              "p-3 sm:p-4 bg-secondary/30 text-xs sm:text-sm min-w-0 max-w-full scrollbar-thin",
              // For long single-line strings (like signatures): wrap on all screens
              // For multi-line code blocks: allow horizontal scroll
              isLongSingleLine 
                ? "overflow-x-auto break-all whitespace-pre-wrap" 
                : "overflow-x-auto whitespace-pre"
            )}
            style={isLongSingleLine ? { wordBreak: 'break-all', overflowWrap: 'anywhere' } : undefined}
            >
              <code 
                className="font-mono text-foreground break-all min-w-0" 
                style={isLongSingleLine ? { wordBreak: 'break-all', overflowWrap: 'anywhere' } : undefined}
              >
                {children}
              </code>
            </pre>
          </div>
        );
      }
      const inlineCode = String(children);
      const isLongInline = inlineCode.length > 30 && !inlineCode.includes(' ');
      return (
        <code 
          className="rounded bg-secondary/60 px-1.5 py-0.5 text-sm font-mono text-foreground break-all" 
          style={isLongInline ? { wordBreak: 'break-all', overflowWrap: 'anywhere' } : undefined}
          {...props}
        >
          {children}
        </code>
      );
    },
    pre: ({ children }) => <>{children}</>,
    // Headings
    h1: ({ children, ...props }) => (
      <h1 className="mt-6 mb-2 text-lg sm:text-xl font-bold text-foreground break-words" {...props}>{children}</h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="mt-5 mb-2 text-base sm:text-lg font-semibold text-foreground break-words" {...props}>{children}</h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="mt-4 mb-2 text-sm sm:text-base font-semibold text-foreground break-words" {...props}>{children}</h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 className="mt-3 mb-1.5 text-sm font-semibold text-foreground" {...props}>{children}</h4>
    ),
    h5: ({ children, ...props }) => (
      <h5 className="mt-3 mb-1 text-sm font-medium text-foreground" {...props}>{children}</h5>
    ),
    h6: ({ children, ...props }) => (
      <h6 className="mt-2 mb-1 text-xs font-medium text-muted-foreground" {...props}>{children}</h6>
    ),
    // Lists
    ul: ({ children, ...props }) => (
      <ul className="my-2 ml-4 list-disc space-y-1 text-foreground" {...props}>{children}</ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="my-2 ml-4 list-decimal space-y-1 text-foreground" {...props}>{children}</ol>
    ),
    li: ({ children, ...props }) => (
      <li className="pl-1 break-words min-w-0" {...props}>{children}</li>
    ),
    // Paragraphs and blockquote — wrap long strings like signatures
    p: ({ children, ...props }) => {
      const text = typeof children === 'string' ? children : String(children);
      const hasLongString = text.length > 50 && !text.includes(' ');
      return (
        <p 
          className="my-2 whitespace-pre-wrap text-foreground leading-relaxed break-words min-w-0" 
          style={hasLongString ? { wordBreak: 'break-all', overflowWrap: 'anywhere' } : undefined}
          {...props}
        >
          {children}
        </p>
      );
    },
    blockquote: ({ children, ...props }) => (
      <blockquote className="my-2 border-l-4 border-primary/50 pl-4 italic text-muted-foreground" {...props}>
        {children}
      </blockquote>
    ),
    strong: ({ children, ...props }) => (
      <strong className="font-semibold text-foreground" {...props}>{children}</strong>
    ),
    a: ({ href, children, ...props }) => (
      <a href={href} className="text-primary underline hover:opacity-80" target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    ),
  };

  return (
    <div
      className={cn(
        "group flex gap-3 sm:gap-3.5 md:gap-4 lg:gap-5 px-3 py-3.5 sm:px-4 sm:py-5 md:px-5 md:py-5 lg:px-6 lg:py-6 animate-fade-in min-w-0 max-w-full overflow-hidden",
        isUser ? "bg-transparent" : "bg-secondary/30"
      )}
    >
      <div className="flex-shrink-0">
        {isUser ? (
          userAvatar.avatarUrl ? (
            <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full overflow-hidden bg-card flex items-center justify-center shrink-0 shadow-md ring-2 ring-background/50">
              <img 
                src={userAvatar.avatarUrl} 
                alt="You" 
                className="w-full h-full object-cover" 
                key={userAvatar.avatarUrl} 
              />
            </div>
          ) : (
            <div className={cn(
              "w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center shadow-md ring-2 ring-background/50",
              `bg-gradient-to-br ${userAvatar.gradient}`
            )}>
              <span className="text-sm md:text-base lg:text-lg leading-none select-none">{userAvatar.emoji}</span>
            </div>
          )
        ) : (
          <div className="relative">
            <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full overflow-hidden bg-card flex items-center justify-center shrink-0">
              <img src={agentAvatar} alt={agentName} className="w-full h-full object-cover" />
            </div>
            {message.isStreaming && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
            )}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 overflow-hidden space-y-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0 gap-y-0.5">
          <span className="font-medium text-sm text-foreground shrink-0">
            {isUser ? "You" : agentName}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {!isUser && (message.toolUsage || (message.toolUsages && message.toolUsages.length > 0)) && (() => {
            const tools: ToolUsageItem[] = message.toolUsages?.length
              ? message.toolUsages
              : message.toolUsage
                ? [message.toolUsage]
                : [];
            if (tools.length === 0) return null;
            const names = tools.map((t) => t.name).join(", ");
            return (
              <span className="hidden sm:flex text-xs text-muted-foreground ml-auto min-w-0 items-center gap-1 overflow-hidden">
                <Wrench className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="truncate" title={names}>{names}</span>
              </span>
            );
          })()}
        </div>

        {/* Tools used for this answer — section for assistant messages */}
        {!isUser && (message.toolUsage || (message.toolUsages && message.toolUsages.length > 0)) && (() => {
          const tools: ToolUsageItem[] = message.toolUsages?.length
            ? message.toolUsages
            : message.toolUsage
              ? [message.toolUsage]
              : [];
          if (tools.length === 0) return null;
          return (
            <div className="rounded-xl border border-border bg-muted/50 overflow-hidden min-w-0">
              <div className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 border-b border-border bg-muted/80 min-w-0">
                <Wrench className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
                  {tools.length === 1 ? "Tool used for this answer" : "Tools used for this answer"}
                </span>
              </div>
              <ul className="divide-y divide-border/50">
                {tools.map((tool, i) => (
                  <li
                    key={i}
                    className={cn(
                      "flex items-center gap-2 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 min-w-0",
                      tool.status === "error" && "bg-destructive/5"
                    )}
                  >
                    {tool.status === "running" ? (
                      <Loader2 className="w-4 h-4 text-primary shrink-0 animate-spin" />
                    ) : tool.status === "error" ? (
                      <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                    ) : (
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                    )}
                    <span className="text-sm font-medium text-foreground truncate min-w-0 flex-1" title={tool.name}>{tool.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                      {tool.status === "running" ? "Running…" : tool.status === "error" ? "Error" : "Complete"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}

        {!isUser && message.commerce?.kind === "status" ? (
          <CommerceBlock
            commerce={message.commerce}
            onSelectProduct={onSelectProduct}
            onConfirmOrder={onConfirmOrder}
            disabled={commerceActionsDisabled}
          />
        ) : null}

        {/* Message Content - auto-detects markdown (tables, code, headings, lists) and renders rich UI */}
        <div className="text-foreground text-base leading-relaxed break-words min-w-0">
          {isUser && isEditing ? (
            <div className="space-y-2">
              <textarea
                ref={editTextareaRef}
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    saveEdit();
                  }
                  if (e.key === "Escape") cancelEdit();
                }}
                rows={3}
                className="w-full min-h-[72px] px-3 py-2 rounded-lg border border-border bg-background text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                placeholder="Your message..."
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 gap-1.5"
                  onClick={saveEdit}
                  disabled={!editDraft.trim()}
                >
                  <Check className="w-3.5 h-3.5" />
                  Save
                </Button>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : isUser ? (
            <p className="my-0 whitespace-pre-wrap break-words min-w-0">{message.content}</p>
          ) : (
            <>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {message.content}
              </ReactMarkdown>
              {message.isStreaming && (
                <span className="inline-flex gap-1 ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary typing-dot" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary typing-dot" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary typing-dot" />
                </span>
              )}
            </>
          )}
        </div>

        {!isUser && message.commerce && message.commerce.kind !== "status" ? (
          <div className="pt-2 space-y-2 min-w-0">
            <CommerceBlock
              commerce={message.commerce}
              onSelectProduct={onSelectProduct}
              onConfirmOrder={onConfirmOrder}
              disabled={commerceActionsDisabled}
            />
          </div>
        ) : null}

        {/* User message actions: Copy, Edit (hidden while editing) */}
        {isUser && !isEditing && (
          <div className="flex flex-wrap items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 sm:h-8 gap-1.5 text-muted-foreground hover:text-foreground touch-manipulation min-h-[44px] sm:min-h-0"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
            {onUpdateUserMessage && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 sm:h-8 gap-1.5 text-muted-foreground hover:text-foreground touch-manipulation min-h-[44px] sm:min-h-0"
                onClick={startEditing}
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Button>
            )}
          </div>
        )}

        {/* Assistant message actions: Copy, Regenerate */}
        {!isUser && !message.isStreaming && (
          <div className="flex flex-wrap items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 sm:h-8 gap-1.5 text-muted-foreground hover:text-foreground touch-manipulation min-h-[44px] sm:min-h-0"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 sm:h-8 gap-1.5 text-muted-foreground hover:text-foreground touch-manipulation min-h-[44px] sm:min-h-0"
              onClick={() => onRegenerate?.(message.id)}
              disabled={!onRegenerate || isRegenerateDisabled}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Loading row while Warung Agent prepares the first token (matches ChatMessage layout). */
export function WarungLoadingMessage({ agentName = "Warung Agent" }: { agentName?: string } = {}) {
  const steps = [
    "Membaca pesananmu…",
    "Mencari produk…",
    "Nyiapin pilihan buat kamu…",
  ];
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStepIndex((i) => (i + 1 >= steps.length ? i : i + 1));
    }, 950);
    return () => window.clearInterval(id);
  }, [steps.length]);

  return (
    <div className="group flex gap-3 sm:gap-3.5 md:gap-4 lg:gap-5 px-3 py-3.5 sm:px-4 sm:py-5 md:px-5 md:py-5 lg:px-6 lg:py-6 bg-secondary/30 animate-fade-in min-w-0 max-w-full overflow-hidden">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full overflow-hidden bg-card ring-2 ring-primary/20">
          <img src="/images/logo-transparent.png" alt={agentName} className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground">{agentName}</span>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" aria-hidden />
        </div>
        <p className="text-sm text-foreground/90">{steps[stepIndex]}</p>
      </div>
    </div>
  );
}

export function SkeletonMessage() {
  return (
    <div className="flex gap-3 sm:gap-3.5 md:gap-4 px-3 py-3.5 sm:px-4 sm:py-5 md:px-5 md:py-5 lg:px-6 lg:py-6 bg-secondary/30 animate-fade-in min-w-0 max-w-full overflow-hidden">
      <div className="w-8 h-8 md:w-9 md:h-9 rounded-full skeleton-shimmer shrink-0" />
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex gap-2">
          <div className="h-4 w-20 rounded skeleton-shimmer" />
          <div className="h-4 w-12 rounded skeleton-shimmer" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded skeleton-shimmer" />
          <div className="h-4 w-4/5 rounded skeleton-shimmer" />
          <div className="h-4 w-3/5 rounded skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

/** Base delay per step (ms); fast cycle for snappy UX. */
const STEP_DURATION_MS = 900;
const STEP_DURATION_VARIATION_MS = 200;
const FADE_OUT_MS = 150;

/** Animated loading message: contextual steps, slower cycle, UI aligned with real ChatMessage for best UX. */
export function LoadingStepMessage({
  lastUserMessage,
  agentName = "Warung Agent",
}: { lastUserMessage?: string; agentName?: string } = {}) {
  const steps = getStepsForMessage(lastUserMessage);
  const [stepIndex, setStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let hideTimeout: ReturnType<typeof setTimeout>;
    let nextTickTimeout: ReturnType<typeof setTimeout>;

    const runStep = () => {
      setStepIndex((i) => {
        const next = i + 1 >= steps.length ? i : i + 1;
        if (next <= i) return i;
        setIsVisible(false);
        hideTimeout = setTimeout(() => {
          setStepIndex(next);
          setIsVisible(true);
          const variation = (Math.random() - 0.5) * 2 * STEP_DURATION_VARIATION_MS;
          const delay = Math.max(STEP_DURATION_MS + variation, STEP_DURATION_MS - STEP_DURATION_VARIATION_MS);
          nextTickTimeout = setTimeout(runStep, delay);
        }, FADE_OUT_MS);
        return i;
      });
    };

    const variation = (Math.random() - 0.5) * 2 * STEP_DURATION_VARIATION_MS;
    const initialDelay = Math.max(STEP_DURATION_MS + variation, STEP_DURATION_MS - STEP_DURATION_VARIATION_MS);
    nextTickTimeout = setTimeout(runStep, initialDelay);

    return () => {
      clearTimeout(hideTimeout);
      clearTimeout(nextTickTimeout);
    };
  }, [steps.length]);

  const label = steps[Math.min(stepIndex, steps.length - 1)];

  return (
    <div className="group flex gap-3 sm:gap-3.5 md:gap-4 lg:gap-5 px-3 py-3.5 sm:px-4 sm:py-5 md:px-5 md:py-5 lg:px-6 lg:py-6 bg-secondary/30 animate-fade-in min-w-0 max-w-full overflow-hidden">
      {/* Avatar — matches ChatMessage assistant with subtle pulse */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full overflow-hidden bg-card loader-avatar-pulse ring-2 ring-transparent">
          <img src="/images/logo-transparent.png" alt={agentName} className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-2 overflow-hidden">
        {/* Header — agent name + "Thinking" so it matches real message layout */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground">{agentName}</span>
          <span className="text-xs text-muted-foreground">Thinking</span>
        </div>

        {/* Step text in a pill — shimmer pill + text */}
        <div
          className={cn(
            "inline-flex items-center px-4 py-2.5 rounded-xl loading-step-pill transition-all duration-200",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          )}
        >
          <span className="text-sm text-foreground/90 animate-loading-blink">{label}</span>
        </div>
      </div>
    </div>
  );
}
