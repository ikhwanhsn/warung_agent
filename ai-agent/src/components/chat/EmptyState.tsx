import { Coffee, Sparkles, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

const sparks = [
  { label: "Bandingin harga", icon: Tag },
  { label: "Checkout lewat chat", icon: Sparkles },
  { label: "Satu alur, tanpa pindah app", icon: Sparkles },
];

const shots: Array<{
  icon: typeof Coffee;
  line: string;
  prompt: string;
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
    icon: Sparkles,
    line: "Bandingkan beberapa opsi sebelum checkout",
    prompt: "bandingkan pilihan kopi yang tersedia",
  },
  {
    icon: Sparkles,
    line: "Lanjut pembayaran langsung dari chat",
    prompt: "lanjut checkout kopi",
  },
];

export function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-full w-full max-w-full px-3 py-8 sm:px-4 sm:py-12 md:px-6 md:py-16 lg:py-20 animate-fade-in overflow-x-hidden bg-gradient-to-b from-[#09090B] via-[#09090B] to-[#022C22]/45">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-[#022C22]/40 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[min(50vh,24rem)] w-[min(100%,36rem)] md:w-[min(100%,42rem)] bg-[radial-gradient(ellipse_at_center,#10B98133_0%,transparent_65%)]" />
        <div className="absolute bottom-0 right-0 h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56 bg-[#14B8A6]/15 blur-[80px] rounded-full" />
        <div className="absolute top-16 left-6 h-20 w-20 rounded-full bg-[#F59E0B]/15 blur-3xl" />
      </div>

      <div className="relative mb-4 sm:mb-5 md:mb-6">
        <div className="relative w-[4.25rem] h-[4.25rem] sm:w-[5rem] sm:h-[5rem] md:w-[5.5rem] md:h-[5.5rem] lg:w-24 lg:h-24 rounded-2xl overflow-hidden border border-[#10B981]/45 shadow-[0_0_40px_-8px_#10B98166] ring-2 ring-background">
          <img src="/images/logo-transparent.png" alt="Warung Agent" className="h-full w-full object-cover" />
        </div>
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white shadow-md animate-pulse">
          AI
        </span>
      </div>

      <h2 className="text-center text-[1.6rem] leading-[1.15] sm:text-3xl sm:leading-tight md:text-4xl md:leading-tight lg:text-5xl lg:leading-[1.08] font-black tracking-tight px-1 max-w-[18ch] sm:max-w-[22ch] md:max-w-none">
        <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
          Ngobrol.
        </span>{" "}
        <span className="bg-gradient-to-r from-[#059669] via-[#10B981] to-[#14B8A6] bg-clip-text text-transparent">
          Belanja.
        </span>{" "}
        <span className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent">Ngegas.</span>
      </h2>

      <p className="mt-2 text-center text-sm sm:text-base text-muted-foreground max-w-md font-medium">
        Bukan form. Bukan 7 layar. Coba tap bawah — agent ini bisa lebih dari yang kamu kira.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {sparks.map(({ label, icon: I }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/25 bg-[#022C22]/45 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#D1FAE5]"
          >
            <I className="h-3 w-3 text-[#10B981] shrink-0" aria-hidden />
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
                "hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_#10B98159] active:translate-y-0",
                "border-[#10B981]/20 bg-[#09090B]/85 hover:border-[#10B981]/45"
              )}
            >
              <div className="flex gap-3">
                <span
                  className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/12 text-[#10B981]")}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 pt-0.5">
                  <span className="block text-sm font-semibold leading-snug text-foreground group-hover:text-[#FBBF24] transition-colors">
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
