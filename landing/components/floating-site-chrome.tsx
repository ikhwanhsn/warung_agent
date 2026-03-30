"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const SCROLL_SHOW_PX = 380;

export function FloatingSiteChrome() {
  const [mounted, setMounted] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > SCROLL_SHOW_PX);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!mounted) {
    return null;
  }

  const fabClass =
    "flex h-12 w-12 touch-manipulation items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-offset-zinc-950 border-zinc-200/90 bg-white/95 text-zinc-800 dark:border-white/15 dark:bg-zinc-900/95 dark:text-zinc-100";

  return (
    <div
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-[100] flex flex-col gap-2 sm:bottom-8 sm:right-8"
      role="region"
      aria-label="Page tools"
    >
      <AnimatePresence>
        {showTop ? (
          <motion.div
            key="back-to-top"
            initial={
              reduceMotion
                ? false
                : { opacity: 0, scale: 0.86, y: 12 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              reduceMotion
                ? undefined
                : { opacity: 0, scale: 0.9, y: 8 }
            }
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 28,
              mass: 0.65,
            }}
          >
            <motion.button
              type="button"
              onClick={scrollToTop}
              className={fabClass}
              aria-label="Back to top"
              title="Back to top"
              whileHover={reduceMotion ? undefined : { scale: 1.06 }}
              whileTap={reduceMotion ? undefined : { scale: 0.94 }}
            >
              <ChevronUp
                className="h-5 w-5 shrink-0"
                strokeWidth={2.5}
                aria-hidden
              />
            </motion.button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
