"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Types out `text` character-by-character with a blinking caret. Renders the
 * full text instantly (no animation) when the visitor prefers reduced motion.
 * The full string is exposed via aria-label so screen readers get it at once.
 */
export function TypingHeadline({
  text,
  className,
  caretClassName = "ml-1.5 inline-block h-[0.82em] w-[3px] translate-y-[0.1em] rounded-full bg-white/85 animate-blink sm:w-[4px]",
  speed = 62,
  startDelay = 300,
}: {
  text: string;
  className?: string;
  caretClassName?: string;
  speed?: number;
  startDelay?: number;
}) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduce) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let i = 0;
    let interval = 0;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length) window.clearInterval(interval);
      }, speed);
    }, startDelay);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [text, reduce, speed, startDelay]);

  return (
    <h1 className={className} aria-label={text}>
      <span aria-hidden>{text.slice(0, count)}</span>
      <span aria-hidden className={caretClassName} />
    </h1>
  );
}
