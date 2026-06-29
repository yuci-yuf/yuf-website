"use client";

import Image from "next/image";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  Fragment,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/* ──────────────────────────────────────────────────────────────
   YUF Entrance Reveal
   A once-per-session cinematic intro. The YUCI emblem glows as a
   watermark while three giant letters Y · U · F reveal stacked &
   centred over a "26". The column then glides left as each letter
   unfurls its word — Youth · United · Festival — and the year
   builds 26 → 2026, its leading digit anchored under the lockup.
   ────────────────────────────────────────────────────────────── */

const SESSION_KEY = "yuf-intro-seen";

const WORDS = [
  { initial: "Y", rest: "outh" },
  { initial: "U", rest: "nited" },
  { initial: "F", rest: "estival" },
] as const;

// Run layout effects only on the client (avoids SSR warning).
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const LETTER_FS = "clamp(4.5rem, 16vw, 11rem)";
const YEAR_FS = "clamp(2rem, 7.5vw, 5.25rem)";

type Phase = "letters" | "expand" | "exit";

export function IntroReveal() {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<Phase>("letters");
  const prefersReduced = useReducedMotion();

  // Measured natural widths so we can animate 0 → w.
  const restRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const yearLeadRef = useRef<HTMLSpanElement | null>(null);
  const [restWidths, setRestWidths] = useState<number[]>([0, 0, 0]);
  const [leadWidth, setLeadWidth] = useState(0);

  // Decide whether to play — before first paint, so the page never flashes.
  useIsoLayoutEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    if (prefersReduced) {
      sessionStorage.setItem(SESSION_KEY, "1");
      return;
    }
    setShow(true);
  }, [prefersReduced]);

  // Lock scroll + drive the phase timeline while visible.
  useEffect(() => {
    if (!show) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    // Measure (scrollWidth works even when rendered width is 0).
    setRestWidths(restRefs.current.map((el) => el?.scrollWidth ?? 0));
    setLeadWidth(yearLeadRef.current?.scrollWidth ?? 0);

    const toExpand = window.setTimeout(() => setPhase("expand"), 1700);
    const toExit = window.setTimeout(() => setPhase("exit"), 3700);
    const toEnd = window.setTimeout(() => finish(), 4600);

    function finish() {
      sessionStorage.setItem(SESSION_KEY, "1");
      setShow(false);
      document.body.style.overflow = overflow;
    }

    return () => {
      window.clearTimeout(toExpand);
      window.clearTimeout(toExit);
      window.clearTimeout(toEnd);
      document.body.style.overflow = overflow;
    };
  }, [show]);

  const expanded = phase !== "letters";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="yuf-intro"
          role="presentation"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{
            background:
              "radial-gradient(120% 120% at 50% 30%, #146b94 0%, #0f475f 45%, #082b3d 100%)",
          }}
          initial={{ opacity: 1 }}
          animate={
            phase === "exit"
              ? { opacity: 0, filter: "blur(12px)", scale: 1.04 }
              : { opacity: 1, filter: "blur(0px)", scale: 1 }
          }
          transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
        >
          {/* ── Drifting cyan mist ── */}
          <Mist />

          {/* ── Grain overlay ── */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-screen"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          {/* ── Emblem watermark, behind the lockup ── */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1] grid place-items-center"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{
              opacity: phase === "exit" ? 0 : 0.28,
              scale: [1.02, 1.06, 1.02],
            }}
            transition={{
              opacity: { duration: 1.4, ease: "easeOut" },
              scale: { duration: 16, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <Image
              src="/images/logo.png"
              alt=""
              width={1080}
              height={558}
              priority
              className="h-auto w-[min(86vw,860px)]"
              style={{
                filter: "saturate(1.1) blur(0.4px)",
                maskImage:
                  "radial-gradient(closest-side, #000 52%, transparent 86%)",
                WebkitMaskImage:
                  "radial-gradient(closest-side, #000 52%, transparent 86%)",
              }}
            />
          </motion.div>

          {/* ── Letters / words / year ── */}
          <div
            className="relative z-[2] flex flex-col items-start px-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <div
              className="grid items-baseline gap-x-[0.12em] gap-y-2 sm:gap-y-3"
              style={{ gridTemplateColumns: "auto auto" }}
            >
              {WORDS.map((w, i) => (
                <Fragment key={w.initial}>
                  {/* Big initial */}
                  <motion.span
                    initial={{ opacity: 0, y: 40, filter: "blur(14px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                      delay: 0.25 + i * 0.22,
                      duration: 0.9,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="select-none font-extrabold leading-[0.92] text-accent-400"
                    style={{
                      fontSize: LETTER_FS,
                      textShadow: "0 0 50px rgba(100,209,236,0.45)",
                    }}
                  >
                    {w.initial}
                  </motion.span>

                  {/* Expanding word remainder */}
                  <span className="overflow-hidden">
                    <motion.span
                      ref={(el) => {
                        restRefs.current[i] = el;
                      }}
                      className="block whitespace-nowrap font-semibold leading-[0.92] text-[#eaf7fc]"
                      style={{ fontSize: LETTER_FS }}
                      initial={{ width: 0, opacity: 0, x: -12 }}
                      animate={
                        expanded
                          ? { width: restWidths[i], opacity: 1, x: 0 }
                          : { width: 0, opacity: 0, x: -12 }
                      }
                      transition={{
                        width: {
                          duration: 0.85,
                          ease: [0.16, 1, 0.3, 1],
                          delay: i * 0.12,
                        },
                        opacity: { duration: 0.6, delay: 0.15 + i * 0.12 },
                        x: { duration: 0.7, delay: 0.15 + i * 0.12 },
                      }}
                    >
                      {w.rest}
                    </motion.span>
                  </span>
                </Fragment>
              ))}
            </div>

            {/* Year — builds 26 → 2026, centred under the lockup */}
            <motion.div
              className="mt-4 flex items-baseline self-center overflow-hidden font-bold leading-none tracking-tight sm:mt-5"
              style={{ fontSize: YEAR_FS }}
              initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.95, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Prepended "20" — collapsed until expand */}
              <motion.span
                ref={yearLeadRef}
                className="block overflow-hidden whitespace-nowrap text-accent-400"
                initial={{ width: 0, opacity: 0 }}
                animate={
                  expanded
                    ? { width: leadWidth, opacity: 1 }
                    : { width: 0, opacity: 0 }
                }
                transition={{
                  width: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.25 },
                  opacity: { duration: 0.5, delay: 0.4 },
                }}
              >
                20
              </motion.span>
              {/* "26" — always present */}
              <span className="text-[#cfeefa]">26</span>
            </motion.div>

            {/* Thin underline sweep beneath the lockup */}
            <motion.div
              aria-hidden
              className="mt-7 h-px w-full origin-left bg-gradient-to-r from-accent-400/0 via-accent-400/70 to-accent-400/0"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={
                expanded ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }
              }
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            />
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* Slowly drifting blurred blobs = soft mist. */
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
