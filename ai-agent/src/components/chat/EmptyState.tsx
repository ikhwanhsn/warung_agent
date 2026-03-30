import { Coffee, Rocket, Sparkles, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

const sparks = [
  { label: "Bandingin harga", icon: Tag },
  { label: "Checkout lewat chat", icon: Sparkles },
  { label: "Mode super-app", icon: Rocket },
];

const shots: Array<{
  icon: typeof Coffee;
  line: string;
  prompt: string;
  wild?: boolean;
}> = [
  {
    icon: Coffee,
    line: "Beli kopi — sebut jumlah, agent urus sisanya",
    prompt: "beli kopi 2",
  },
  {
    icon: Tag,
    line: "Cari yang paling murah otomatis",
    prompt: "beli kopi yang murah",
  },
  {
    icon: Rocket,
    line: "Merge Tokopedia × Gojek × warung (ngaco tapi jalan)",
    prompt: "beli paket tokopedia gojek merge",
    wild: true,
  },
  {
    icon: Sparkles,
    line: "Ojek quantum, routing multiverse",
    prompt: "beli ojek quantum",
    wild: true,
  },
];

export function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-full w-full max-w-full px-3 py-8 sm:px-4 sm:py-12 md:px-6 md:py-16 lg:py-20 animate-fade-in overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[min(50vh,24rem)] w-[min(100%,36rem)] md:w-[min(100%,42rem)] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.22)_0%,transparent_65%)]" />
        <div className="absolute bottom-0 right-0 h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56 bg-cyan-500/10 blur-[80px] rounded-full" />
      </div>

      <div className="relative mb-4 sm:mb-5 md:mb-6">
        <div className="relative w-[4.25rem] h-[4.25rem] sm:w-[5rem] sm:h-[5rem] md:w-[5.5rem] md:h-[5.5rem] lg:w-24 lg:h-24 rounded-2xl overflow-hidden border border-primary/30 shadow-[0_0_40px_-8px_hsl(var(--primary)/0.5)] ring-2 ring-background">
          <img src="/logo.jpg" alt="Warung Agent" className="h-full w-full object-cover" />
        </div>
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-md animate-pulse">
          AI
        </span>
      </div>

      <h2 className="text-center text-[1.6rem] leading-[1.15] sm:text-3xl sm:leading-tight md:text-4xl md:leading-tight lg:text-5xl lg:leading-[1.08] font-black tracking-tight px-1 max-w-[18ch] sm:max-w-[22ch] md:max-w-none">
        <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
          Ngobrol.
        </span>{" "}
        <span className="bg-gradient-to-r from-primary via-cyan-400 to-violet-400 bg-clip-text text-transparent">
          Belanja.
        </span>{" "}
        <span className="text-foreground">Ngegas.</span>
      </h2>

      <p className="mt-2 text-center text-sm sm:text-base text-muted-foreground max-w-md font-medium">
        Bukan form. Bukan 7 layar. Coba tap bawah — agent ini bisa lebih dari yang kamu kira.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {sparks.map(({ label, icon: I }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-secondary/50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            <I className="h-3 w-3 text-primary shrink-0" aria-hidden />
            {label}
          </span>
        ))}
      </div>

      <div className="mt-6 sm:mt-8 grid w-full max-w-lg md:max-w-xl lg:max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5 md:gap-3">
        {shots.map((s, index) => {
          const Icon = s.icon;
          return (
            <button
              key={s.line}
              type="button"
              onClick={() => onSelectPrompt(s.prompt)}
              style={{
                animationDelay: `${index * 70}ms`,
                animationFillMode: "backwards",
              }}
              className={cn(
                "group relative rounded-2xl border px-3.5 py-3 sm:px-4 sm:py-3.5 md:px-5 md:py-4 text-left transition-all duration-200 min-h-[44px] sm:min-h-0 touch-manipulation",
                "motion-safe:animate-fade-in",
                "hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_hsl(var(--primary)/0.35)] active:translate-y-0",
                s.wild
                  ? "border-violet-500/35 bg-gradient-to-br from-violet-500/10 via-card to-cyan-500/5 hover:border-violet-400/50"
                  : "border-border bg-card/90 hover:border-primary/35"
              )}
            >
              {s.wild ? (
                <span className="absolute right-3 top-3 text-[10px] font-bold uppercase tracking-wider text-violet-400/90">
                  wild
                </span>
              ) : null}
              <div className="flex gap-3">
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    s.wild ? "bg-violet-500/15 text-violet-300" : "bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 pt-0.5">
                  <span className="block text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                    {s.line}
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
