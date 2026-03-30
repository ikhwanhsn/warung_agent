"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  CirclePlay,
  Layers,
  LayoutGrid,
  Loader2,
  Menu,
  MessageSquare,
  QrCode,
  Repeat,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  Wallet,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  WARUNG_AGENT_URL,
  WARUNG_APP_URL,
  WARUNG_DOCS_URL,
} from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const sectionView = { once: true as const, margin: "-60px" as const };

/** Embedded chat demos: explicit light + dark so both site themes read clearly. */
const demoUserBubble =
  "bg-gradient-to-br from-teal-600 to-teal-700 shadow-md shadow-teal-900/12 dark:from-slate-700 dark:to-teal-600 dark:shadow-lg dark:shadow-black/25";
const demoUserAvatar =
  "border border-teal-300/90 bg-gradient-to-br from-teal-500 to-teal-700 shadow-sm dark:border-teal-400/35 dark:from-slate-600/90 dark:to-teal-600/80 dark:shadow-inner";
const demoHeaderIconGlow =
  "bg-gradient-to-br from-teal-100 to-teal-200/90 dark:from-slate-600/45 dark:to-teal-600/35";
/** Voice meter bars — solid stops only (no light `via` that can flash white in dark). */
const demoVoiceBar =
  "bg-gradient-to-t from-teal-600 to-teal-700 dark:from-teal-400 dark:to-emerald-500";
const demoChapterActive =
  "bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-500 shadow-sm dark:from-slate-600 dark:via-teal-500 dark:to-teal-400 dark:shadow-glow-accent";

/** Demo panel surfaces tied to CSS variables so light/dark never desync. */
const demoBotShell =
  "rounded-xl border border-border bg-card shadow-sm";
const demoAgentTypingRow =
  "rounded-2xl rounded-bl-md border border-border bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground backdrop-blur-[2px] dark:bg-zinc-900/75";

type DemoShopOption = {
  id: string;
  pickLabel: string;
  title: string;
  price: number;
  tag: string;
};

const DEMO_OPTIONS: readonly DemoShopOption[] = [
  {
    id: "fuji",
    pickLabel: "Apel Fuji 1 kg",
    title: "Apel Fuji 1kg",
    price: 42_000,
    tag: "Stok tersedia",
  },
  {
    id: "malang",
    pickLabel: "Apel Malang 1 kg",
    title: "Apel Malang 1kg",
    price: 38_000,
    tag: "Produk lokal",
  },
  {
    id: "granny",
    pickLabel: "Apel Granny Smith 1 kg",
    title: "Apel Granny Smith 1kg",
    price: 55_000,
    tag: "Premium · impor",
  },
] as const;

const DEMO_ONGKIR = 5_000;

const DEMO_PHASES = [
  "idle",
  "user1",
  "think1",
  "options",
  "user2",
  "think2",
  "bill",
  "think3",
  "qris",
  "user3",
  "think4",
  "verify",
  "packing",
  "success",
] as const;

type DemoPhase = (typeof DEMO_PHASES)[number];

function demoPhaseIndex(p: DemoPhase): number {
  return DEMO_PHASES.indexOf(p);
}

function demoAtOrPast(phase: DemoPhase, min: DemoPhase): boolean {
  return demoPhaseIndex(phase) >= demoPhaseIndex(min);
}

function demoChapterIndex(phase: DemoPhase): number {
  const i = demoPhaseIndex(phase);
  if (i < demoPhaseIndex("options")) return 0;
  if (i < demoPhaseIndex("qris")) return 1;
  if (i < demoPhaseIndex("success")) return 2;
  return 3;
}

const DEMO_CHAPTERS = [
  { id: "chat", label: "Chat" },
  { id: "pick", label: "Pilih" },
  { id: "pay", label: "QRIS" },
  { id: "done", label: "Selesai" },
] as const;

function TypewriterText({
  text,
  active,
  reducedMotion,
  msPerChar = 20,
}: {
  text: string;
  active: boolean;
  reducedMotion: boolean;
  msPerChar?: number;
}) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!active) {
      setN(0);
      return;
    }
    if (reducedMotion) {
      setN(text.length);
      return;
    }
    setN(0);
    let i = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    const step = () => {
      i += 1;
      setN(Math.min(i, text.length));
      if (i < text.length) {
        timeoutId = setTimeout(step, msPerChar);
      }
    };
    timeoutId = setTimeout(step, 120);
    return () => clearTimeout(timeoutId);
  }, [active, text, reducedMotion, msPerChar]);

  return (
    <>
      {text.slice(0, n)}
      {!reducedMotion && active && n < text.length && (
        <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-zinc-600/80 align-middle dark:bg-white/80" />
      )}
    </>
  );
}

function DemoVoiceStrip({ active }: { active: boolean }) {
  if (!active) return null;
  const bars = [0, 1, 2, 3, 4, 5, 6];
  return (
    <div
      className="flex h-12 shrink-0 items-end justify-center gap-1 border-b border-border bg-muted/35 px-4 py-2 dark:bg-zinc-950"
      aria-hidden
    >
      {bars.map((b) => (
        <motion.div
          key={b}
          className={`h-8 w-1 origin-bottom rounded-full ${demoVoiceBar}`}
          animate={{ scaleY: [0.35, 1, 0.5, 0.92, 0.42, 0.78] }}
          transition={{
            duration: 0.85 + b * 0.04,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            delay: b * 0.06,
          }}
        />
      ))}
    </div>
  );
}

function formatIdr(n: number): string {
  return new Intl.NumberFormat("id-ID").format(n);
}

/** Demo QRIS asset from `public/images/qris.webp`. */
function DemoQrisImage() {
  return (
    <div className="rounded-xl bg-white p-3 shadow-inner ring-1 ring-zinc-200/80">
      <div className="relative mx-auto aspect-square w-full max-w-[220px]">
        <Image
          src="/images/qris.webp"
          alt="Kode QRIS demo untuk pembayaran"
          fill
          className="object-contain"
          sizes="(max-width: 640px) 200px, 220px"
          priority={false}
        />
      </div>
      <div className="mt-2 flex items-center justify-center gap-2 border-t border-zinc-200 pt-2">
        <QrCode className="h-4 w-4 text-zinc-700" aria-hidden />
        <span className="text-[11px] font-bold tracking-wide text-zinc-800">
          QRIS · Scan untuk bayar
        </span>
      </div>
    </div>
  );
}

/** Compact QRIS image for hero chat preview (same asset as main demo). */
function HeroMiniQrisImage() {
  return (
    <div className="rounded-lg bg-white p-2 shadow-inner ring-1 ring-zinc-200/70">
      <Image
        src="/images/qris.webp"
        alt="QRIS demo"
        width={176}
        height={176}
        className="mx-auto block h-auto w-full max-w-[148px] object-contain"
        sizes="148px"
        priority
      />
      <p className="mt-1.5 text-center text-[10px] font-semibold tracking-wide text-zinc-700">
        Scan untuk bayar
      </p>
    </div>
  );
}

function HeroChatPreview({ reducedMotion }: { reducedMotion: boolean }) {
  const [phase, setPhase] = useState(0);
  const heroScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) {
      setPhase(8);
      return;
    }
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const cycle = () => {
      if (cancelled) return;
      setPhase(1);
      timers.push(setTimeout(() => !cancelled && setPhase(2), 650));
      timers.push(setTimeout(() => !cancelled && setPhase(3), 1500));
      timers.push(setTimeout(() => !cancelled && setPhase(4), 2800));
      timers.push(setTimeout(() => !cancelled && setPhase(5), 4100));
      timers.push(setTimeout(() => !cancelled && setPhase(6), 4600));
      timers.push(setTimeout(() => !cancelled && setPhase(7), 5200));
      timers.push(setTimeout(() => !cancelled && setPhase(8), 8200));
      timers.push(
        setTimeout(() => {
          if (!cancelled) {
            setPhase(0);
            timers.push(setTimeout(cycle, 900));
          }
        }, 11_200),
      );
    };

    timers.push(setTimeout(cycle, 500));
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const scrollEl = heroScrollRef.current;
    if (!scrollEl) return;
    const scrollToEnd = () => {
      scrollEl.scrollTop = scrollEl.scrollHeight;
    };
    scrollToEnd();
    const inner = scrollEl.firstElementChild;
    if (!(inner instanceof HTMLElement)) return;
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(scrollToEnd);
    });
    ro.observe(inner);
    return () => ro.disconnect();
  }, [phase, reducedMotion]);

  return (
    <div className="relative flex h-full max-h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-md backdrop-blur-xl dark:shadow-soft">
      <div className="mb-3 flex shrink-0 items-center gap-2 border-b border-border pb-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${demoHeaderIconGlow}`}
        >
          <Bot className="h-4 w-4 text-teal-700 dark:text-accent/90" />
        </div>
        <div>
          <p className="text-sm font-medium text-card-foreground">
            Warung Agent
          </p>
          <p className="text-xs text-muted-foreground">Assistant online</p>
        </div>
        <span className="ml-auto flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
      </div>
      <div
        ref={heroScrollRef}
        className="demo-chat-scroll flex min-h-0 flex-1 flex-col justify-start gap-3 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] touch-pan-y"
      >
        <div className="flex flex-col gap-3 pb-1">
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`self-end max-w-[85%] rounded-2xl rounded-br-md px-3 py-2 text-sm text-white ${demoUserBubble}`}
          >
            Dua kopi tubruk, mohon.
          </motion.div>
        )}
        {phase === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 self-start rounded-2xl rounded-bl-md border border-border bg-muted/50 px-3 py-2"
          >
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
          </motion.div>
        )}
        {phase >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="self-start max-w-[92%] rounded-2xl rounded-bl-md border border-border bg-muted/40 px-3 py-2 text-sm text-card-foreground shadow-sm"
          >
            <p className="mb-2 text-xs font-medium text-accent">
              Pilih salah satu opsi:
            </p>
            <ul className="space-y-1.5 text-xs text-card-foreground">
              <li className="rounded-lg border border-border bg-card px-2 py-1.5">
                Kopi Tubruk ×2 — Rp 16.000
              </li>
              <li className="rounded-lg px-2 py-1.5 text-muted-foreground">
                Americano ×2 — Rp 24.000
              </li>
            </ul>
          </motion.div>
        )}
        {phase >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="self-start max-w-[90%] rounded-2xl rounded-bl-md border border-teal-500/35 bg-card px-3 py-2 text-sm text-card-foreground shadow-sm"
          >
            Konfirmasi: Tubruk ×2, total{" "}
            <span className="font-semibold text-card-foreground">
              Rp 16.000
            </span>
            . Balas <span className="text-accent">ya</span> untuk melanjutkan.
          </motion.div>
        )}
        {phase >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`self-end max-w-[85%] rounded-2xl rounded-br-md px-3 py-2 text-sm text-white ${demoUserBubble}`}
          >
            ya
          </motion.div>
        )}
        {phase === 6 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 self-start rounded-2xl rounded-bl-md border border-border bg-muted/50 px-3 py-2"
          >
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500/90 [animation-delay:0ms] dark:bg-emerald-400/90" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500/90 [animation-delay:150ms] dark:bg-emerald-400/90" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500/90 [animation-delay:300ms] dark:bg-emerald-400/90" />
          </motion.div>
        )}
        {phase >= 7 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="self-start max-w-[95%] rounded-2xl rounded-bl-md border border-emerald-400/45 bg-gradient-to-b from-emerald-50 to-card p-3 text-sm text-card-foreground shadow-[0_0_24px_-12px_rgba(16,185,129,0.18)] dark:border-emerald-500/35 dark:from-emerald-950/45 dark:to-card dark:shadow-[0_0_28px_-12px_rgba(16,185,129,0.35)]"
          >
            <div className="flex gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-300/70 bg-emerald-100/90 dark:border-emerald-500/25 dark:bg-emerald-950/40">
                <Wallet className="h-4 w-4 text-emerald-800 dark:text-emerald-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  Pembayaran QRIS
                </p>
                <p className="mt-0.5 text-base font-bold tracking-tight text-card-foreground">
                  Rp 16.000
                </p>
                <p className="text-[11px] text-muted-foreground">
                  E-wallet atau mobile banking
                </p>
                <div className="mx-auto mt-2 w-fit max-w-full">
                  <HeroMiniQrisImage />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {phase >= 8 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 self-start rounded-full border border-emerald-300/80 bg-emerald-100/90 px-3 py-1.5 text-xs font-medium text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-950/50 dark:text-emerald-300"
          >
            <CheckCircle2 className="h-4 w-4" />
            Pesanan tercatat
          </motion.div>
        )}
        </div>
      </div>
    </div>
  );
}

const DEMO_USER_OPEN =
  "Saya ingin membeli apel 1 kg, yang segar.";

function ProductDemoPanel({ reducedMotion }: { reducedMotion: boolean }) {
  const [phase, setPhase] = useState<DemoPhase>("idle");
  const [selected, setSelected] = useState<DemoShopOption | null>(null);
  const [replayTick, setReplayTick] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const phaseRef = useRef<DemoPhase>("idle");
  const payStartedRef = useRef(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  phaseRef.current = phase;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((ms: number, fn: () => void) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  const runAfterQris = useCallback(() => {
    clearTimers();
    payStartedRef.current = true;
    setPhase("user3");
    let t = 0;
    schedule((t += 450), () => setPhase("think4"));
    schedule((t += 850), () => setPhase("verify"));
    schedule((t += 1600), () => setPhase("packing"));
    schedule((t += 1900), () => setPhase("success"));
  }, [clearTimers, schedule]);

  const pickOption = useCallback(
    (opt: DemoShopOption) => {
      if (phaseRef.current !== "options") return;
      clearTimers();
      setSelected(opt);
      setPhase("user2");
      let t = 0;
      schedule((t += 500), () => setPhase("think2"));
      schedule((t += 950), () => setPhase("bill"));
      schedule((t += 650), () => setPhase("think3"));
      schedule((t += 800), () => setPhase("qris"));
      schedule((t += 5200), () => {
        if (phaseRef.current === "qris" && !payStartedRef.current) {
          runAfterQris();
        }
      });
    },
    [clearTimers, schedule, runAfterQris],
  );

  const startOpening = useCallback(() => {
    clearTimers();
    payStartedRef.current = false;
    setSelected(null);
    setPhase("idle");
    let t = 0;
    schedule((t += 350), () => setPhase("user1"));
    schedule((t += 750), () => setPhase("think1"));
    schedule((t += 1100), () => setPhase("options"));
    schedule((t += 4200), () => {
      if (phaseRef.current === "options") {
        pickOption(DEMO_OPTIONS[0]);
      }
    });
  }, [clearTimers, schedule, pickOption]);

  useEffect(() => {
    if (reducedMotion) {
      clearTimers();
      setSelected(DEMO_OPTIONS[0]);
      setPhase("success");
      return;
    }
    startOpening();
    return () => clearTimers();
  }, [reducedMotion, startOpening, clearTimers]);

  useEffect(() => {
    setElapsedSec(0);
  }, [replayTick]);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      setElapsedSec((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [replayTick, reducedMotion]);

  useEffect(() => {
    const scrollEl = chatScrollRef.current;
    if (!scrollEl) return;
    const scrollToEnd = () => {
      scrollEl.scrollTop = scrollEl.scrollHeight;
    };
    scrollToEnd();
    const inner = scrollEl.firstElementChild;
    if (!(inner instanceof HTMLElement)) return;
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(scrollToEnd);
    });
    ro.observe(inner);
    return () => ro.disconnect();
  }, [phase, selected?.id, replayTick, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || phase !== "success") return;
    const id = window.setTimeout(() => {
      clearTimers();
      payStartedRef.current = false;
      setSelected(null);
      setPhase("idle");
      setReplayTick((k) => k + 1);
      window.setTimeout(() => startOpening(), 140);
    }, 5200);
    return () => window.clearTimeout(id);
  }, [phase, reducedMotion, clearTimers, startOpening]);

  const handleReplay = () => {
    clearTimers();
    payStartedRef.current = false;
    setSelected(null);
    setPhase("idle");
    setReplayTick((k) => k + 1);
    schedule(100, () => startOpening());
  };

  const handlePayClick = () => {
    if (phase !== "qris" || payStartedRef.current) return;
    runAfterQris();
  };

  const total =
    selected != null
      ? selected.price + DEMO_ONGKIR
      : DEMO_OPTIONS[0].price + DEMO_ONGKIR;

  const voiceActive =
    phase === "think1" ||
    phase === "think2" ||
    phase === "think3" ||
    phase === "think4" ||
    phase === "verify" ||
    phase === "packing";

  const userSpeaking = phase === "user1";

  const elapsedLabel = `${String(Math.floor(elapsedSec / 60)).padStart(2, "0")}:${String(elapsedSec % 60).padStart(2, "0")}`;
  const chapter = demoChapterIndex(phase);

  return (
    <div className="relative flex h-[min(78dvh,720px)] min-h-[min(360px,50dvh)] w-full min-w-0 max-h-[min(90dvh,800px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_0_48px_-16px_rgba(20,184,166,0.14)] ring-1 ring-border/60 sm:rounded-3xl dark:shadow-[0_0_72px_-16px_rgba(20,184,166,0.38)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22] [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.04)_3px)] dark:opacity-[0.45] dark:[background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.04)_3px)]"
        aria-hidden
      />
      {phase === "success" && !reducedMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 bg-background"
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          aria-hidden
        />
      )}

      <div className="relative z-10 flex shrink-0 flex-col gap-2 border-b border-border bg-card/95 px-3 py-2.5 backdrop-blur-md sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]" />
          </span>
          <span className="shrink-0 text-[10px] font-black tracking-[0.22em] text-red-600 dark:text-red-400">
            LIVE
          </span>
          <span className="hidden text-muted-foreground/50 sm:inline">|</span>
          <span className="font-mono text-[11px] tabular-nums text-foreground">
            {elapsedLabel}
          </span>
          <span className="hidden truncate text-[10px] text-muted-foreground sm:inline sm:max-w-[200px] md:max-w-none md:text-xs">
            Obrolan simulasi · auto-loop kayak rekaman
          </span>
        </div>
        <button
          type="button"
          onClick={handleReplay}
          className="shrink-0 rounded-xl border border-accent/35 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent/20"
        >
          Ulangi take
        </button>
      </div>

      <DemoVoiceStrip active={voiceActive || Boolean(userSpeaking)} />

      <div className="relative z-10 shrink-0 border-b border-border bg-muted/25 px-3 py-2.5 sm:px-4">
        <div className="flex gap-1.5 sm:gap-2">
          {DEMO_CHAPTERS.map((ch, idx) => (
            <div key={ch.id} className="flex min-w-0 flex-1 flex-col gap-1">
              <div
                className={`h-1 rounded-full transition-all duration-500 ${
                  idx <= chapter ? demoChapterActive : "bg-muted-foreground/20"
                }`}
              />
              <span
                className={`truncate text-center text-[9px] font-semibold uppercase tracking-wider sm:text-[10px] ${
                  idx === chapter ? "text-accent" : "text-muted-foreground"
                }`}
              >
                {ch.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        ref={chatScrollRef}
        className="demo-chat-scroll relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain touch-pan-y bg-background px-3 py-4 sm:px-4"
      >
        <div className="space-y-3 pb-4 sm:space-y-4 sm:pb-6">
        {demoAtOrPast(phase, "user1") && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-end gap-2"
          >
            <div
              className={`max-w-[min(82%,20rem)] break-words rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm text-white sm:max-w-[82%] ${demoUserBubble}`}
            >
              <TypewriterText
                text={DEMO_USER_OPEN}
                active={demoAtOrPast(phase, "user1")}
                reducedMotion={reducedMotion}
                msPerChar={18}
              />
            </div>
            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${demoUserAvatar}`}
            >
              <User className="h-4 w-4 text-white" strokeWidth={2} />
            </div>
          </motion.div>
        )}

        {phase === "think1" && (
          <div className="flex gap-2">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center ${demoBotShell}`}>
              <Bot className="h-4 w-4 text-teal-700 dark:text-accent" />
            </div>
            <div
              className={`flex min-w-0 flex-1 items-center gap-2 ${demoAgentTypingRow}`}
            >
              <span className="flex shrink-0 gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-600 [animation-delay:0ms] dark:bg-accent" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-600 [animation-delay:120ms] dark:bg-accent" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal-600 [animation-delay:240ms] dark:bg-accent" />
              </span>
              <span className="min-w-0 break-words">Menyiapkan opsi produk…</span>
            </div>
          </div>
        )}

        {demoAtOrPast(phase, "options") && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-2"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center ${demoBotShell}`}>
              <Bot className="h-4 w-4 text-teal-700 dark:text-accent" />
            </div>
            <div className="min-w-0 flex-1 rounded-2xl rounded-bl-md border border-border bg-card p-3 text-sm text-card-foreground shadow-inner">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Warung Agent
              </p>
              <p className="mb-1 text-xs font-medium text-accent">
                Berikut pilihan yang tersedia. Silakan pilih satu.
              </p>
              <p className="mb-3 text-xs text-muted-foreground">
                Jika tidak ada pilihan, sistem akan melanjutkan dengan opsi
                default.
              </p>
              <div className="flex flex-col gap-2">
                {DEMO_OPTIONS.map((opt) => {
                  const locked = phase !== "options";
                  const isSel = selected?.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={locked}
                      onClick={() => pickOption(opt)}
                      className={`min-h-11 touch-manipulation rounded-xl border px-3 py-2.5 text-left text-xs transition ${
                        locked
                          ? isSel
                            ? "border-accent/50 bg-accent/15 text-card-foreground"
                            : "cursor-default border-border bg-muted/50 text-muted-foreground"
                          : "border-border bg-muted/35 text-card-foreground hover:border-accent/40 hover:bg-accent/10"
                      }`}
                    >
                      <span className="font-semibold text-card-foreground">
                        {opt.title}
                      </span>
                      <span className="mt-0.5 block text-muted-foreground">
                        Rp {formatIdr(opt.price)} · {opt.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {demoAtOrPast(phase, "user2") && selected && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-end gap-2"
          >
            <div
              className={`max-w-[min(82%,20rem)] break-words rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm text-white sm:max-w-[82%] ${demoUserBubble}`}
            >
              <TypewriterText
                text={selected.pickLabel}
                active={demoAtOrPast(phase, "user2")}
                reducedMotion={reducedMotion}
                msPerChar={22}
              />
            </div>
            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${demoUserAvatar}`}
            >
              <User className="h-4 w-4 text-white" strokeWidth={2} />
            </div>
          </motion.div>
        )}

        {phase === "think2" && (
          <div className="flex gap-2">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center ${demoBotShell}`}>
              <Bot className="h-4 w-4 text-teal-700 dark:text-accent" />
            </div>
            <div
              className={`flex min-w-0 flex-1 items-center gap-2 ${demoAgentTypingRow}`}
            >
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-accent" />
              <span className="min-w-0 break-words">
                Menyiapkan ringkasan dan QRIS…
              </span>
            </div>
          </div>
        )}

        {demoAtOrPast(phase, "bill") && selected && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center ${demoBotShell}`}>
              <Bot className="h-4 w-4 text-teal-700 dark:text-accent" />
            </div>
            <div className="min-w-0 flex-1 rounded-2xl rounded-bl-md border border-teal-500/35 bg-card p-3 text-sm text-card-foreground shadow-sm">
              <p className="text-xs text-accent">Oke, catat ya</p>
              <p className="mt-1">
                {selected.title} —{" "}
                <span className="font-semibold text-card-foreground">
                  Rp {formatIdr(selected.price)}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Ongkir area kamu Rp {formatIdr(DEMO_ONGKIR)}. Total{" "}
                <span className="font-semibold text-card-foreground">
                  Rp {formatIdr(selected.price + DEMO_ONGKIR)}
                </span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Langkah berikutnya: pembayaran QRIS dan verifikasi status.
              </p>
            </div>
          </motion.div>
        )}

        {phase === "think3" && (
          <div className="flex gap-2">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center ${demoBotShell}`}>
              <Bot className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
            </div>
            <div
              className={`flex min-w-0 flex-1 items-center gap-2 ${demoAgentTypingRow}`}
            >
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-emerald-500 dark:text-emerald-400" />
              <span className="min-w-0 break-words">Generate kode bayar…</span>
            </div>
          </div>
        )}

        {demoAtOrPast(phase, "qris") && selected && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-2"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-200/90 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-950/30">
              <Wallet className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden rounded-2xl rounded-bl-md border border-emerald-300/70 bg-gradient-to-b from-emerald-50 to-card p-4 shadow-[0_0_32px_-14px_rgba(16,185,129,0.18)] dark:border-emerald-500/30 dark:from-emerald-950/45 dark:to-card dark:shadow-[0_0_40px_-16px_rgba(16,185,129,0.35)]">
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Pembayaran QRIS
              </p>
              <p className="mt-1 text-lg font-bold tracking-tight text-card-foreground">
                Rp {formatIdr(total)}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Scan dengan aplikasi e-wallet atau mobile banking Anda.
              </p>
              <div className="mx-auto mt-3 w-fit max-w-full">
                <DemoQrisImage />
              </div>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Referensi: WARUNG-8821
              </p>
              <button
                type="button"
                onClick={handlePayClick}
                disabled={phase !== "qris" || payStartedRef.current}
                className="mt-4 flex min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-xl border border-emerald-700/20 bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-transparent dark:shadow-lg"
              >
                <Check className="h-4 w-4" />
                Konfirmasi pembayaran
              </button>
            </div>
          </motion.div>
        )}

        {demoAtOrPast(phase, "user3") && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-end gap-2"
          >
            <div
              className={`max-w-[min(82%,20rem)] break-words rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm text-white sm:max-w-[82%] ${demoUserBubble}`}
            >
              <TypewriterText
                text="Pembayaran telah saya lakukan."
                active={demoAtOrPast(phase, "user3")}
                reducedMotion={reducedMotion}
                msPerChar={16}
              />
            </div>
            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${demoUserAvatar}`}
            >
              <User className="h-4 w-4 text-white" strokeWidth={2} />
            </div>
          </motion.div>
        )}

        {phase === "think4" && (
          <div className="flex gap-2">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center ${demoBotShell}`}>
              <Bot className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl rounded-bl-md border border-zinc-200/90 bg-zinc-50 px-3 py-2.5 text-xs text-zinc-600 dark:border-white/10 dark:bg-zinc-900/80 dark:text-zinc-500">
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-zinc-500 dark:text-zinc-400" />
              <span className="min-w-0 break-words">
                Memeriksa mutasi rekening…
              </span>
            </div>
          </div>
        )}

        {demoAtOrPast(phase, "verify") && (
          <div className="flex gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-300/80 bg-amber-100/90 dark:border-amber-500/25 dark:bg-amber-950/20">
              <Zap className="h-4 w-4 text-amber-700 dark:text-amber-400" />
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl rounded-bl-md border border-amber-300/70 bg-amber-50 px-3 py-2.5 text-xs text-amber-950 dark:border-amber-500/20 dark:bg-amber-950/25 dark:text-amber-200/90">
              {phase === "verify" ? (
                <>
                  <Loader2
                    className="h-3.5 w-3.5 shrink-0 animate-spin text-amber-600 dark:text-amber-400"
                    aria-hidden
                  />
                  <span className="min-w-0 break-words">
                    Memverifikasi pembayaran QRIS ke warung…
                  </span>
                </>
              ) : (
                <>
                  <Check
                    className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  <span className="min-w-0 break-words">
                    Pembayaran QRIS sudah terverifikasi.
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {demoAtOrPast(phase, "packing") && (
          <div className="flex gap-2">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center ${demoBotShell}`}>
              <ShoppingBag className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div
              className={`flex min-w-0 flex-1 items-center gap-2 ${demoAgentTypingRow} text-foreground`}
            >
              {phase === "packing" ? (
                <>
                  <Loader2
                    className="h-3.5 w-3.5 shrink-0 animate-spin text-teal-600 dark:text-teal-400"
                    aria-hidden
                  />
                  <span className="min-w-0 break-words">
                    Pembayaran diterima · pesanan sedang disiapkan…
                  </span>
                </>
              ) : (
                <>
                  <Check
                    className="h-3.5 w-3.5 shrink-0 text-teal-600 dark:text-teal-400"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  <span className="min-w-0 break-words">
                    Pesanan telah diterima merchant.
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {phase === "success" && selected && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="flex gap-2"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-300/80 bg-emerald-100/90 dark:border-emerald-500/30 dark:bg-emerald-500/15">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl rounded-bl-md border border-emerald-200/90 bg-emerald-50/95 p-4 shadow-[0_0_28px_-10px_rgba(16,185,129,0.22)] dark:border-emerald-500/35 dark:bg-emerald-950/40 dark:shadow-[0_0_32px_-10px_rgba(16,185,129,0.45)]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-200/80 dark:bg-emerald-500/25">
                <Check
                  className="h-5 w-5 text-emerald-700 dark:text-emerald-400"
                  strokeWidth={2.5}
                />
              </div>
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                  Pesanan diproses
                </p>
                <p className="text-xs text-muted-foreground">
                  {selected.title} · Rp {formatIdr(total)} · estimasi siap
                  15–30 menit.
                </p>
              </div>
            </div>
          </motion.div>
        )}
        </div>
      </div>

    </div>
  );
}

const LANDING_QNA: readonly {
  id: string;
  question: string;
  answer: string;
}[] = [
  {
    id: "what",
    question: "What is Warung Agent?",
    answer:
      "Warung Agent is a conversational storefront: customers describe what they need in chat, choose from clear product options, confirm the order, and pay without jumping between apps or long checkout forms.",
  },
  {
    id: "payment",
    question: "How does payment work?",
    answer:
      "The on-page demo shows a QRIS-style payment step inside the conversation. In production you connect a real PSP or wallet flow; the stack keeps payment and status tied to the same thread.",
  },
  {
    id: "wallet",
    question: "Do I need a crypto wallet to try it?",
    answer:
      "The landing demo focuses on chat and commerce. Wallet and on-chain paths are optional extension points—you can validate the UX first, then wire Solana or other rails when you are ready.",
  },
  {
    id: "merchant",
    question: "Who is it for?",
    answer:
      "Small retailers, warungs, and digital-first merchants who want one channel for discovery, confirmation, and payment. The same pattern fits delivery, pop-ups, and catalog-heavy shops.",
  },
  {
    id: "production",
    question: "Is this production-ready?",
    answer:
      "The project is hackathon-grade but split into landing, typed chat client, and API so you can harden inventory, auth, and payments without rewriting the whole experience.",
  },
] as const;

function LandingQnaAccordion({
  prefersReducedMotion,
}: {
  prefersReducedMotion: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div
      className="mx-auto max-w-2xl rounded-2xl border border-zinc-200/90 bg-white/90 shadow-sm dark:border-white/10 dark:bg-zinc-950/50 dark:shadow-soft"
      role="region"
      aria-label="Questions and answers"
    >
      <ul className="divide-y divide-zinc-200/80 dark:divide-white/10">
        {LANDING_QNA.map((item) => {
          const open = openId === item.id;
          const panelId = `qna-panel-${item.id}`;
          const headerId = `qna-header-${item.id}`;
          return (
            <li key={item.id}>
              <h3 className="text-left text-base font-semibold">
                <button
                  type="button"
                  id={headerId}
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenId(open ? null : item.id)}
                  className="flex w-full min-h-14 touch-manipulation items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-zinc-50/90 dark:hover:bg-white/5 sm:px-5"
                >
                  <span className="min-w-0 break-words pr-2 text-zinc-950 dark:text-white">
                    {item.question}
                  </span>
                  <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{
                      duration: prefersReducedMotion ? 0.01 : 0.22,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="inline-flex shrink-0"
                    aria-hidden
                  >
                    <ChevronDown className="h-5 w-5 text-accent" />
                  </motion.span>
                </button>
              </h3>
              <motion.div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                aria-hidden={!open}
                initial={false}
                animate={
                  open
                    ? {
                        height: "auto",
                        opacity: 1,
                        transition: {
                          height: {
                            duration: prefersReducedMotion ? 0 : 0.32,
                            ease: [0.22, 1, 0.36, 1],
                          },
                          opacity: {
                            duration: prefersReducedMotion ? 0 : 0.2,
                            delay: prefersReducedMotion ? 0 : 0.04,
                          },
                        },
                      }
                    : {
                        height: 0,
                        opacity: 0,
                        transition: {
                          height: {
                            duration: prefersReducedMotion ? 0 : 0.26,
                            ease: [0.22, 1, 0.36, 1],
                          },
                          opacity: {
                            duration: prefersReducedMotion ? 0 : 0.12,
                          },
                        },
                      }
                }
                style={{ overflow: "hidden" }}
              >
                <p className="px-4 pb-4 pt-0 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:px-5 sm:pb-5">
                  {item.answer}
                </p>
              </motion.div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function WarungLandingPage() {
  const reduceMotion = useReducedMotion() ?? false;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  const scrollToSection = useCallback((id: string) => {
    setMobileNavOpen(false);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[size:48px_48px] bg-grid-fade-light opacity-70 dark:bg-grid-fade dark:opacity-90"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -left-40 top-0 -z-10 h-[420px] w-[420px] rounded-full bg-primary/20 blur-[100px] animate-ambient-float dark:bg-primary/25"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -right-40 top-1/3 -z-10 h-[380px] w-[380px] rounded-full bg-accent/12 blur-[90px] animate-ambient-float-delayed dark:bg-accent/18"
        aria-hidden
      />

      <header
        className={`fixed inset-x-0 top-0 z-50 pt-header-safe transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300 ease-out ${
          headerScrolled
            ? "border-b border-zinc-200/70 bg-white/65 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-zinc-950/55 dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.45)]"
            : "border-b border-transparent bg-transparent shadow-none backdrop-blur-0"
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-safe py-3 sm:gap-3 sm:py-4 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:justify-items-stretch md:gap-4">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-2 justify-self-start text-sm font-semibold tracking-tight text-zinc-950 dark:text-white"
          >
            <motion.span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-xs font-bold text-white shadow-glow sm:h-8 sm:w-8"
              whileHover={
                reduceMotion ? undefined : { scale: 1.06, rotate: -2 }
              }
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
            >
              W
            </motion.span>
            <span className="truncate transition-colors group-hover:text-accent dark:group-hover:text-accent">
              Warung Agent
            </span>
          </Link>
          <nav
            className="hidden items-center justify-center gap-6 text-sm text-zinc-600 dark:text-zinc-400 md:flex md:justify-self-center"
            aria-label="Primary"
          >
            <button
              type="button"
              onClick={() => scrollToSection("overview")}
              className="transition hover:text-zinc-950 dark:hover:text-white"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("how-it-works")}
              className="transition hover:text-zinc-950 dark:hover:text-white"
            >
              How it works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("demo")}
              className="transition hover:text-zinc-950 dark:hover:text-white"
            >
              Demo
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("features")}
              className="transition hover:text-zinc-950 dark:hover:text-white"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("architecture")}
              className="transition hover:text-zinc-950 dark:hover:text-white"
            >
              Technology
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("qna")}
              className="transition hover:text-zinc-950 dark:hover:text-white"
            >
              Q&amp;A
            </button>
          </nav>
          <div className="flex shrink-0 items-center justify-end gap-1.5 justify-self-end sm:gap-2">
            <ThemeToggle />
            <a
              href={WARUNG_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 min-h-10 touch-manipulation items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-accent px-4 text-xs font-semibold text-white shadow-glow transition hover:opacity-95 md:inline-flex"
            >
              Launch app
              <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </a>
            <button
              type="button"
              className="relative flex h-10 w-10 touch-manipulation items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-800 dark:border-white/15 dark:bg-white/5 dark:text-white md:hidden"
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileNavOpen((o) => !o)}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileNavOpen ? (
                  <motion.span
                    key="nav-close"
                    className="absolute inset-0 flex items-center justify-center"
                    initial={
                      reduceMotion
                        ? false
                        : { opacity: 0, scale: 0.88, rotate: -45 }
                    }
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={
                      reduceMotion
                        ? undefined
                        : { opacity: 0, scale: 0.88, rotate: 45 }
                    }
                    transition={{
                      duration: reduceMotion ? 0.01 : 0.2,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <X className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </motion.span>
                ) : (
                  <motion.span
                    key="nav-open"
                    className="absolute inset-0 flex items-center justify-center"
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={
                      reduceMotion
                        ? undefined
                        : { opacity: 0, scale: 0.88 }
                    }
                    transition={{
                      duration: reduceMotion ? 0.01 : 0.2,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Menu className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileNavOpen ? (
          <motion.button
            key="mobile-nav-backdrop"
            type="button"
            className="fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-sm dark:bg-black/65 md:hidden"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reduceMotion ? 0.01 : 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={() => setMobileNavOpen(false)}
          />
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {mobileNavOpen ? (
          <motion.nav
            key="mobile-nav-panel"
            id="mobile-nav"
            className="fixed inset-y-0 right-0 z-50 flex w-[min(100vw-2.5rem,18rem)] flex-col gap-1 border-l border-zinc-200 bg-white/98 p-4 pt-[max(1rem,env(safe-area-inset-top,0px))] shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/98 md:hidden"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={
              reduceMotion
                ? { duration: 0.01 }
                : {
                    type: "spring",
                    damping: 32,
                    stiffness: 360,
                    mass: 0.78,
                  }
            }
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
              Menu
            </p>
            {(
              [
                { id: "overview", label: "Overview" },
                { id: "how-it-works", label: "How it works" },
                { id: "demo", label: "Demo" },
                { id: "features", label: "Features" },
                { id: "architecture", label: "Technology" },
                { id: "qna", label: "Q&A" },
              ] as const
            ).map((item, i) => (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                initial={reduceMotion ? false : { opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0.01 }
                    : {
                        delay: 0.05 + i * 0.045,
                        duration: 0.35,
                        ease: [0.22, 1, 0.36, 1],
                      }
                }
                className="min-h-12 w-full touch-manipulation rounded-xl border border-transparent px-3 py-3 text-left text-sm font-medium text-zinc-800 transition-colors hover:border-zinc-200 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:border-white/10 dark:hover:bg-white/5"
              >
                {item.label}
              </motion.button>
            ))}
            <a
              href={WARUNG_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100 px-4 text-sm font-semibold text-zinc-800 transition hover:border-accent/40 hover:text-zinc-950 dark:border-white/15 dark:bg-white/5 dark:text-zinc-100 dark:hover:border-accent/40"
              onClick={() => setMobileNavOpen(false)}
            >
              Documentation
            </a>
            <a
              href={WARUNG_AGENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100 px-4 text-sm font-semibold text-zinc-800 transition hover:border-accent/40 hover:text-zinc-950 dark:border-white/15 dark:bg-white/5 dark:text-zinc-100 dark:hover:border-accent/40"
              onClick={() => setMobileNavOpen(false)}
            >
              Agent
            </a>
            <a
              href={WARUNG_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 text-sm font-semibold text-white"
              onClick={() => setMobileNavOpen(false)}
            >
              Launch app
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.nav>
        ) : null}
      </AnimatePresence>

      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-safe pb-16 pt-[calc(env(safe-area-inset-top,0px)+7.5rem)] sm:pb-20 sm:pt-[calc(env(safe-area-inset-top,0px)+9rem)] lg:pt-[calc(env(safe-area-inset-top,0px)+11rem)]">
        <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:items-stretch lg:gap-16 lg:min-h-0">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-w-0 flex-col justify-center lg:h-full lg:min-h-0"
          >
            <motion.div
              className="mb-5 inline-flex flex-wrap items-center gap-2"
              initial={reduceMotion ? false : "hidden"}
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.09,
                    delayChildren: 0.06,
                  },
                },
                hidden: {},
              }}
            >
              <motion.span
                variants={{
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  },
                  hidden: {
                    opacity: 0,
                    y: 10,
                    scale: 0.97,
                  },
                }}
                transition={{
                  duration: reduceMotion ? 0.01 : 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-primary dark:border-accent/30 dark:bg-accent/10 dark:text-accent"
              >
                Powered by AI + Solana
              </motion.span>
              <motion.span
                variants={{
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  },
                  hidden: {
                    opacity: 0,
                    y: 10,
                    scale: 0.97,
                  },
                }}
                transition={{
                  duration: reduceMotion ? 0.01 : 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400"
              >
                Hackathon 2026
              </motion.span>
            </motion.div>
            <h1 className="text-balance break-words text-[1.65rem] font-bold leading-tight tracking-tight text-zinc-950 min-[400px]:text-4xl sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1] dark:text-white">
              Shop by message.{" "}
              <span className="text-gradient-brand-shift">
                Pay without leaving chat.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
              Tell the AI what you need—it shows options, you pick, you pay with
              QR. One thread, start to finish.
            </p>
            <div className="mt-8 w-full max-w-lg">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
                <motion.button
                  type="button"
                  onClick={() => scrollToSection("demo")}
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  className="group relative inline-flex min-h-14 w-full touch-manipulation flex-col items-center justify-center gap-0.5 overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-accent to-accent px-7 py-3.5 text-center shadow-glow-accent ring-2 ring-accent/25 transition-[box-shadow,ring-color] hover:shadow-[0_0_56px_-8px_hsl(var(--accent)_/_0.45)] hover:ring-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-offset-zinc-950 sm:w-auto sm:min-w-[16.5rem] sm:px-8 sm:py-4"
                >
                  <span
                    className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50"
                    aria-hidden
                  />
                  <span className="relative flex items-center gap-2 text-base font-bold tracking-tight text-white sm:text-lg">
                    <CirclePlay
                      className="h-5 w-5 shrink-0 text-white/95 sm:h-[1.35rem] sm:w-[1.35rem]"
                      strokeWidth={2}
                      aria-hidden
                    />
                    View demonstration
                  </span>
                  <span className="relative text-[11px] font-medium leading-tight text-white/85 sm:text-xs">
                    End-to-end flow: options, confirmation, QRIS
                  </span>
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => scrollToSection("how-it-works")}
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="group inline-flex min-h-14 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-7 py-3.5 text-sm font-semibold text-zinc-800 shadow-sm transition-colors hover:border-accent/35 hover:bg-accent/5 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:border-white/20 dark:bg-zinc-900/80 dark:text-zinc-100 dark:shadow-inner dark:backdrop-blur-sm dark:hover:border-accent/40 dark:hover:bg-zinc-800/90 dark:hover:text-white dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950 sm:w-auto sm:px-8"
                >
                  How it works
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-accent/90 transition-transform duration-200 group-hover:translate-x-1"
                    strokeWidth={2}
                    aria-hidden
                  />
                </motion.button>
              </div>
              <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-600 dark:text-zinc-500">
                <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                  <Zap className="h-3.5 w-3.5 shrink-0 text-amber-400/90" aria-hidden />
                  Catalog, confirmation, and payment in one thread
                </span>
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.55 }}
            className="relative flex w-full min-w-0 justify-center lg:min-h-0 lg:justify-end"
          >
            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 blur-2xl" />
            <div className="relative flex h-[min(64dvh,580px)] min-h-[280px] max-h-[min(64dvh,580px)] w-full max-w-md shrink-0 flex-col">
              <div className="isolate h-full min-h-0 w-full">
                <HeroChatPreview reducedMotion={reduceMotion} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem */}
      <motion.section
        id="overview"
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionView}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden border-y border-zinc-200/90 bg-zinc-100/80 py-16 sm:py-20 before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-accent/35 before:to-transparent sm:before:inset-x-16 dark:border-white/5 dark:bg-zinc-900/40"
      >
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[min(520px,80vw)] w-[min(520px,80vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[100px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-0 top-1/4 h-64 w-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-accent/12 blur-[90px]"
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-6xl px-safe">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-accent/90">
            Market context
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-balance text-center text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl lg:text-4xl dark:text-white">
            Reduce friction in{" "}
            <span className="text-gradient-brand-shift">
              everyday commerce
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-zinc-600 dark:text-zinc-500">
            Typical digital shopping adds steps across apps and forms. A single
            conversational flow can streamline discovery through payment.
          </p>

          <ul className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:max-w-5xl lg:grid-cols-2 lg:grid-rows-2 lg:gap-5 xl:max-w-6xl xl:grid-cols-3 xl:grid-rows-1 xl:gap-6">
            {(
              [
                {
                  text: "Too many apps to juggle",
                  hint: "Tabs, accounts, context switching",
                  icon: LayoutGrid,
                  glow: "from-primary/40 to-accent/25",
                  iconBg:
                    "from-primary/25 to-accent/10 text-accent",
                  borderHover: "hover:border-accent/40 hover:shadow-glow-accent",
                },
                {
                  text: "Manual product hunt",
                  hint: "Scroll, compare, repeat",
                  icon: Search,
                  glow: "from-accent/35 to-[hsl(187_68%_26%/0.28)]",
                  iconBg:
                    "from-accent/20 to-accent/8 text-accent",
                  borderHover:
                    "hover:border-accent/40 hover:shadow-glow-accent",
                },
                {
                  text: "Checkout fatigue",
                  hint: "Forms and payment flows over and over",
                  icon: Repeat,
                  glow: "from-amber-500/35 to-rose-600/30",
                  iconBg:
                    "from-amber-500/15 to-rose-600/10 text-amber-300",
                  borderHover:
                    "hover:border-amber-500/35 hover:shadow-[0_0_40px_-12px_rgba(245,158,11,0.35)]",
                },
              ] as const
            ).map((item, i) => (
              <motion.li
                key={item.text}
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={sectionView}
                transition={{ delay: i * 0.1, duration: 0.45 }}
                className={`group relative min-w-0 ${i === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2 xl:col-span-1 xl:row-span-1" : ""}`}
                whileHover={
                  reduceMotion
                    ? undefined
                    : { y: -4, transition: { duration: 0.2 } }
                }
              >
                <div
                  className={`relative flex h-full min-h-[132px] flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/90 p-5 shadow-sm ring-1 ring-transparent transition duration-300 sm:p-6 lg:min-h-0 dark:border-white/10 dark:bg-zinc-950/70 dark:shadow-soft ${i === 0 ? "lg:min-h-[280px] lg:justify-center lg:p-8 xl:min-h-[168px] xl:justify-start xl:p-6" : "xl:min-h-[168px]"} ${item.borderHover} hover:ring-zinc-300/50 dark:hover:ring-white/10`}
                >
                  <div
                    className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br opacity-35 blur-2xl transition-opacity duration-500 group-hover:opacity-70 ${item.glow}`}
                    aria-hidden
                  />
                  <div className="relative flex flex-col items-center text-center">
                    <div className="mb-3 flex w-full justify-center sm:mb-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-inner transition duration-300 group-hover:scale-110 sm:h-14 sm:w-14 ${item.iconBg} ${i === 0 ? "lg:h-16 lg:w-16 xl:h-14 xl:w-14" : ""}`}
                      >
                        <item.icon
                          className={
                            i === 0
                              ? "h-7 w-7 lg:h-8 lg:w-8 xl:h-7 xl:w-7"
                              : "h-6 w-6 sm:h-7 sm:w-7"
                          }
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </div>
                    </div>
                    <span
                      className={`max-w-sm font-medium leading-snug text-zinc-900 dark:text-zinc-100 ${i === 0 ? "text-base sm:text-lg lg:text-xl xl:text-base" : "text-sm sm:text-base"}`}
                    >
                      {item.text}
                    </span>
                    <span className="mt-2 text-xs text-zinc-600 dark:text-zinc-500">
                      {item.hint}
                    </span>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>

          <div className="mx-auto mt-14 flex max-w-xl flex-col items-center">
            <div
              className="mb-2 flex flex-col items-center gap-1"
              aria-hidden
            >
              <div className="h-8 w-px bg-gradient-to-b from-accent/60 to-zinc-300/50 dark:to-white/15" />
              <ArrowDown className="h-4 w-4 text-primary/90 dark:text-accent/80" strokeWidth={2} />
              <div className="h-4 w-px bg-gradient-to-b from-zinc-300/40 to-transparent dark:from-white/15" />
            </div>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={sectionView}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="w-full min-w-0 rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-zinc-50/90 p-6 text-center shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_16px_40px_-20px_rgba(0,0,0,0.12)] sm:p-10 dark:border-emerald-500/25 dark:from-emerald-950/50 dark:via-zinc-950/80 dark:to-zinc-950/90 dark:shadow-[0_0_0_1px_rgba(16,185,129,0.08),0_24px_48px_-24px_rgba(0,0,0,0.6)]"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/20 text-emerald-700 ring-1 ring-emerald-300/50 dark:from-emerald-500/30 dark:to-teal-600/20 dark:text-emerald-300 dark:ring-emerald-400/20">
                <MessageSquare className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <p className="text-lg font-semibold text-zinc-950 sm:text-xl dark:text-white">
                One channel for the full journey
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-500">
                Selection, confirmation, and payment stay in one thread for a
                clearer customer experience.
              </p>
              <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-center">
                <a
                  href={WARUNG_APP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 text-sm font-semibold text-white shadow-[0_0_24px_-6px_rgba(16,185,129,0.55)] transition hover:opacity-95 sm:w-auto"
                >
                  Open application
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </a>
                <button
                  type="button"
                  onClick={() => scrollToSection("demo")}
                  className="inline-flex h-11 min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-emerald-300/60 hover:bg-emerald-50/50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:shadow-none dark:hover:border-white/25 dark:hover:bg-white/10 sm:w-auto"
                >
                  View demo
                  <Sparkles className="h-4 w-4 shrink-0 text-accent" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Solution */}
      <motion.section
        id="how-it-works"
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionView}
        transition={{ duration: 0.5 }}
        className="mx-auto w-full max-w-6xl px-safe py-14 sm:py-24"
      >
        <h2 className="text-balance text-center text-2xl font-bold text-zinc-950 sm:text-3xl dark:text-white">
          Everything through chat
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-600 dark:text-zinc-400">
          Three steps from intent to a confirmed order.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Message the agent",
              body: "Customers send requests in natural language without navigating rigid forms.",
              icon: MessageSquare,
            },
            {
              step: "2",
              title: "Select and confirm",
              body: "The agent returns structured options; the customer confirms the choice.",
              icon: ShoppingBag,
            },
            {
              step: "3",
              title: "Complete payment",
              body: "Payment and status updates remain in the same conversation thread.",
              icon: CheckCircle2,
            },
          ].map((card, i) => (
            <motion.div
              key={card.step}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={sectionView}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              className="group min-w-0 rounded-2xl border border-zinc-200/90 bg-white/90 p-5 shadow-sm transition hover:border-accent/35 hover:shadow-md dark:border-white/10 dark:bg-zinc-900/50 dark:shadow-soft dark:hover:border-accent/40 dark:hover:shadow-glow sm:p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary transition group-hover:from-primary/30 group-hover:to-accent/25 dark:from-primary/25 dark:to-accent/20 dark:text-accent dark:group-hover:from-primary/35 dark:group-hover:to-accent/30">
                <card.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary dark:text-accent">
                Step {card.step}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-zinc-950 dark:text-white">
                {card.title}
              </h3>
              <p className="mt-2 break-words text-sm text-zinc-600 dark:text-zinc-400">
                {card.body}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Product demo */}
      <motion.section
        id="demo"
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionView}
        transition={{ duration: 0.5 }}
        className="border-y border-zinc-200/90 bg-gradient-to-b from-zinc-100/90 to-zinc-50 py-16 sm:py-24 dark:border-white/5 dark:from-zinc-900/30 dark:to-background"
      >
        <div className="mx-auto w-full max-w-6xl px-safe">
          <div className="mb-10 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary dark:text-accent/90">
                Interactive demo
              </p>
              <h2 className="mt-2 text-balance text-2xl font-bold text-zinc-950 sm:text-3xl dark:text-white">
                End-to-end purchase flow
              </h2>
              <p className="mt-2 max-w-xl break-words text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
                Illustrative conversation: product selection, order summary,
                QRIS-style payment, and verification. The sequence restarts
                automatically for review.
              </p>
            </div>
            <button
              type="button"
              onClick={() => scrollToSection("demo")}
              className="inline-flex h-11 min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl border border-accent/50 bg-accent/10 px-5 text-sm font-semibold text-primary transition hover:bg-accent/15 dark:border-accent/40 dark:bg-accent/10 dark:text-accent dark:hover:bg-accent/20 sm:w-fit"
            >
              Demo
              <Zap className="h-4 w-4 shrink-0" aria-hidden />
            </button>
          </div>
          <div className="isolate mx-auto w-full min-w-0 max-w-2xl">
            <ProductDemoPanel reducedMotion={reduceMotion} />
          </div>
        </div>
      </motion.section>

      {/* Features */}
      <motion.section
        id="features"
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionView}
        transition={{ duration: 0.5 }}
        className="mx-auto w-full max-w-6xl px-safe py-14 sm:py-24"
      >
        <h2 className="text-balance text-center text-2xl font-bold text-zinc-950 sm:text-3xl dark:text-white">
          Capabilities
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Natural-language intent",
              desc: "Interprets customer requests beyond simple keyword matching.",
              icon: Sparkles,
            },
            {
              title: "Conversation to transaction",
              desc: "Completes selection and confirmation without leaving the chat thread.",
              icon: MessageSquare,
            },
            {
              title: "Structured options",
              desc: "Surfaces a concise set of relevant products or variants.",
              icon: Search,
            },
            {
              title: "Responsive experience",
              desc: "Low-friction UI focused on outcomes rather than navigation depth.",
              icon: Zap,
            },
            {
              title: "Integration-ready",
              desc: "Architecture supports catalog, payments, and wallet flows as you scale.",
              icon: Layers,
            },
            {
              title: "Modeled commerce state",
              desc: "Order steps and payloads are represented in code for reliability and testing.",
              icon: Workflow,
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={sectionView}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="min-w-0 rounded-2xl border border-zinc-200/90 bg-white/90 p-5 transition hover:border-accent/35 hover:bg-zinc-50/90 dark:border-white/10 dark:bg-zinc-900/40 dark:hover:border-accent/30 dark:hover:bg-zinc-900/70"
            >
              <f.icon className="mb-3 h-5 w-5 shrink-0 text-primary dark:text-accent" />
              <h3 className="break-words font-semibold text-zinc-950 dark:text-white">{f.title}</h3>
              <p className="mt-2 break-words text-sm text-zinc-600 dark:text-zinc-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Stack & architecture — technical credibility */}
      <motion.section
        id="architecture"
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionView}
        transition={{ duration: 0.5 }}
        className="border-y border-zinc-200/90 bg-zinc-100/80 py-16 sm:py-24 dark:border-white/5 dark:bg-zinc-900/35"
      >
        <div className="mx-auto w-full max-w-6xl px-safe">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary dark:text-accent/90">
            Under the hood
          </p>
          <h2 className="mx-auto mt-3 max-w-3xl text-balance text-center text-2xl font-bold text-zinc-950 sm:text-3xl dark:text-white">
            System architecture
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-400">
            The product is split into a marketing site, a typed chat client, and
            an API layer so each surface can evolve and be tested independently.
          </p>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {(
              [
                {
                  name: "Marketing site",
                  stack: "Next.js 15 · React · Tailwind · Framer Motion",
                  points: [
                    "Product overview, hero preview, and scripted commerce demonstration.",
                    "Shared design tokens with the chat client for consistent branding.",
                  ],
                  icon: LayoutGrid,
                },
                {
                  name: "Chat client",
                  stack: "Vite · React · TypeScript · shadcn-style UI",
                  points: [
                    "Strict typing for messages, tools, and commerce attachments.",
                    "Wallet and agent context prepared for on-chain integrations.",
                  ],
                  icon: MessageSquare,
                },
                {
                  name: "API and services",
                  stack: "Node.js REST · LLM routing · extensible tools",
                  points: [
                    "Chat and agent endpoints with extension points for inventory and webhooks.",
                    "Flow: intent parsing, product offers, confirmation, payment and status payloads.",
                  ],
                  icon: Layers,
                },
              ] as const
            ).map((col, i) => (
              <motion.div
                key={col.name}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={sectionView}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                className="flex min-h-full flex-col rounded-2xl border border-zinc-200/90 bg-white/95 p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950/70 dark:shadow-soft"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-accent/15 text-primary dark:text-accent">
                  <col.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">
                  {col.name}
                </h3>
                <p className="mt-1 font-mono text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-500 sm:text-xs">
                  {col.stack}
                </p>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {col.points.map((pt) => (
                    <li key={pt} className="flex gap-2">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                        strokeWidth={2}
                        aria-hidden
                      />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={sectionView}
            transition={{ delay: 0.15, duration: 0.45 }}
            className="mx-auto mt-10 max-w-3xl rounded-2xl border border-dashed border-zinc-300/90 bg-white/80 p-5 dark:border-white/15 dark:bg-zinc-950/50 sm:p-6"
          >
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
              Request path (high level)
            </p>
            <p className="mt-3 text-center text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              <span className="font-medium text-zinc-950 dark:text-white">User</span>
              {" → "}
              <span className="text-accent">Chat UI</span>
              {" → "}
              <span className="text-accent">API / agent</span>
              {" → "}
              <span className="text-accent">LLM + tools</span>
              {" → "}
              <span className="font-medium text-zinc-950 dark:text-white">
                Catalog · pay · status
              </span>
              {" → "}
              <span className="text-accent">Thread reply</span>
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Q&A */}
      <motion.section
        id="qna"
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionView}
        transition={{ duration: 0.5 }}
        className="mx-auto w-full max-w-6xl px-safe py-14 sm:py-24"
        aria-labelledby="qna-heading"
      >
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary dark:text-accent/90">
            <CircleHelp
              className="h-4 w-4 text-accent"
              strokeWidth={1.75}
              aria-hidden
            />
            Q&amp;A
          </p>
          <h2
            id="qna-heading"
            className="mt-3 text-balance text-2xl font-bold text-zinc-950 sm:text-3xl dark:text-white"
          >
            Common questions
          </h2>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
            Quick answers about the product, payments, and how the pieces fit
            together.
          </p>
        </div>
        <LandingQnaAccordion prefersReducedMotion={reduceMotion} />
      </motion.section>

      {/* CTA */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionView}
        transition={{ duration: 0.5 }}
        className="mx-auto w-full max-w-6xl px-safe pb-20 sm:pb-24"
      >
        <motion.div
          className="rounded-2xl border border-zinc-200/90 bg-white/90 px-4 py-10 text-center shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900/60 dark:shadow-soft sm:px-12 sm:py-12"
          whileHover={reduceMotion ? undefined : { y: -4 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
        >
          <h2 className="text-balance text-2xl font-bold text-zinc-950 sm:text-3xl dark:text-white">
            Evaluate the product
          </h2>
          <p className="mx-auto mt-3 max-w-lg break-words text-zinc-600 dark:text-zinc-400">
            Open the application or review the on-page demonstration.
          </p>
          <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:mx-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-center">
            <a
              href={WARUNG_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-8 text-sm font-semibold text-zinc-800 transition hover:border-accent/40 hover:bg-accent/5 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:w-auto"
            >
              Read documentation
            </a>
            <a
              href={WARUNG_AGENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-8 text-sm font-semibold text-zinc-800 transition hover:border-accent/40 hover:bg-accent/5 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:w-auto"
            >
              Open agent
            </a>
            <a
              href={WARUNG_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-8 text-sm font-semibold text-white shadow-glow transition hover:opacity-95 sm:w-auto"
            >
              Launch application
            </a>
            <button
              type="button"
              onClick={() => scrollToSection("demo")}
              className="inline-flex h-11 min-h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-8 text-sm font-semibold text-zinc-800 transition hover:border-accent/40 hover:bg-accent/5 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:w-auto"
            >
              View demonstration
            </button>
          </div>
        </motion.div>
      </motion.section>

      <motion.footer
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={sectionView}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="border-t border-zinc-200/90 py-10 pb-page dark:border-white/5"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-2 px-safe text-center text-sm text-zinc-600 dark:text-zinc-500">
          <p className="font-semibold text-zinc-900 dark:text-zinc-300">
            Warung Agent
          </p>
          <p className="break-words">
            Conversational commerce platform · © {new Date().getFullYear()}
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
