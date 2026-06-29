"use client";

import Image from "next/image";
import {
  useEffect,
  useLayoutEffect,
  useState,
  Fragment,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/* ──────────────────────────────────────────────────────────────
   Events Entrance Reveal
   A once-per-session intro for the events page: the headline
   "YUF 2026" rises out of cyan mist, then every event name fans
   in beneath it before dissolving to reveal the page.
   ────────────────────────────────────────────────────────────── */

const SESSION_KEY = "yuf-events-intro-seen";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Phase = "head" | "list" | "exit";

export function EventsIntro({ items }: { items: string[] }) {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<Phase>("head");
  const prefersReduced = useReducedMotion();

  useIsoLayoutEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    if (prefersReduced) {
      sessionStorage.setItem(SESSION_KEY, "1");
      return;
    }
    setShow(true);
  }, [prefersReduced]);

  useEffect(() => {
    if (!show) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const toList = window.setTimeout(() => setPhase("list"), 1400);
    const toExit = window.setTimeout(() => setPhase("exit"), 3300);
    const toEnd = window.setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, "1");
      setShow(false);
      document.body.style.overflow = overflow;
    }, 4100);

    return () => {
      window.clearTimeout(toList);
      window.clearTimeout(toExit);
      window.clearTimeout(toEnd);
      document.body.style.overflow = overflow;
    };
  }, [show]);

  const listed = phase !== "head";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="yuf-events-intro"
          role="presentation"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden px-6"
          style={{
            background:
              "radial-gradient(120% 120% at 50% 32%, #146b94 0%, #0f475f 45%, #082b3d 100%)",
          }}
          initial={{ opacity: 1 }}
          animate={
            phase === "exit"
              ? { opacity: 0, filter: "blur(12px)", scale: 1.04 }
              : { opacity: 1, filter: "blur(0px)", scale: 1 }
          }
          transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
        >
          <Mist />

          {/* Grain */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-screen"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          {/* Emblem watermark */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 grid place-items-center"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: phase === "exit" ? 0 : 0.12, scale: 1.02 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          >
            <Image
              src="/images/logo.png"
              alt=""
              width={1080}
              height={558}
              priority
              className="h-auto w-[min(82vw,720px)]"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </motion.div>

          {/* Content */}
          <div
            className="relative z-[2] flex flex-col items-center text-center"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 36, filter: "blur(16px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="font-extrabold leading-none tracking-tight text-white"
              style={{ fontSize: "clamp(3.5rem, 13vw, 9rem)" }}
            >
              YUF{" "}
              <span
                className="text-accent-400"
                style={{ textShadow: "0 0 50px rgba(100,209,236,0.45)" }}
              >
                2026
              </span>
            </motion.h1>

            {/* Divider */}
            <motion.div
              aria-hidden
              className="mt-6 h-px w-full origin-center bg-gradient-to-r from-accent-400/0 via-accent-400/70 to-accent-400/0"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={listed ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Event names */}
            <div
              className="mt-7 flex max-w-3xl flex-wrap items-center justify-center gap-x-1.5 gap-y-2"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {items.map((name, i) => (
                <Fragment key={name}>
                  {i > 0 && (
                    <motion.span
                      aria-hidden
                      className="text-accent-400/70"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: listed ? 1 : 0 }}
                      transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
                    >
                      ·
                    </motion.span>
                  )}
                  <motion.span
                    className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-100 sm:text-base"
                    initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
                    animate={
                      listed
                        ? { opacity: 1, y: 0, filter: "blur(0px)" }
                        : { opacity: 0, y: 12, filter: "blur(8px)" }
                    }
                    transition={{
                      delay: 0.35 + i * 0.12,
                      duration: 0.55,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {name}
                  </motion.span>
                </Fragment>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Mist() {
  const blobs = [
    {
      className: "left-[8%] top-[12%] h-[42vw] w-[42vw]",
      color: "rgba(31,168,215,0.30)",
      anim: { x: [0, 40, -20, 0], y: [0, -30, 20, 0] },
      dur: 18,
    },
    {
      className: "right-[6%] top-[22%] h-[36vw] w-[36vw]",
      color: "rgba(100,209,236,0.26)",
      anim: { x: [0, -35, 25, 0], y: [0, 25, -15, 0] },
      dur: 22,
    },
    {
      className: "bottom-[6%] left-[34%] h-[40vw] w-[40vw]",
      color: "rgba(157,224,239,0.20)",
      anim: { x: [0, 30, -30, 0], y: [0, -20, 10, 0] },
      dur: 26,
    },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-[90px] ${b.className}`}
          style={{
            background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
          }}
          animate={b.anim}
          transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
