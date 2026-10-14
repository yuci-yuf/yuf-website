"use client";

import { useEffect, useRef } from "react";
import { CalendarDays, MapPin } from "lucide-react";

/* ── NDC Award Ceremony banner ──
   A faithful port of the supplied gala poster (gold filigree corners,
   flanking trophies, poppers, confetti, sparkle field, engraved title and
   date/venue tickets) — re-skinned from the original navy+metallic-gold into
   the YUF brand: the site's hero gradient as the backdrop, and the brand
   highlight amber as the "gold". Sits directly below the home hero. */

/* Brand hero-gradient backdrop (mirrors .bg-hero-gradient in globals.css). */
const HERO_BG =
  "radial-gradient(110% 90% at 18% 22%, rgba(89,31,172,0.6) 0%, transparent 50%)," +
  "radial-gradient(100% 90% at 88% 78%, rgba(89,31,172,0.5) 0%, transparent 48%)," +
  "linear-gradient(125deg, #133a8c 0%, #155fa6 38%, #15938f 58%, #1d5fbf 100%)";

/* Brand "gold" = highlight amber family. */
const GOLD_600 = "#ef7a1a";
const GOLD_400 = "#ffa552";
const GOLD_300 = "#ffc078";
const FOIL = "#ffe8cf";
const INK_DEEP = "#0a2836"; // brand primary-950, for the star emblem shadow

const GOLDS = [FOIL, GOLD_300, GOLD_400, GOLD_600];

const PROGRAMME = [
  { k: "Date", v: "24 October 2026", Icon: CalendarDays },
  { k: "Venue", v: "VIT Chennai", Icon: MapPin },
];

/* Popper burst — radial pips fired from a corner cone. Deterministic. */
const PIPS = Array.from({ length: 12 }, (_, i) => {
  const a = (-70 + i * (120 / 11)) * (Math.PI / 180);
  const d = 120 + (i % 3) * 34;
  return {
    bx: Math.round(Math.cos(a) * d),
    by: Math.round(Math.sin(a) * d),
    color: GOLDS[i % GOLDS.length],
    delay: +(i * 0.015).toFixed(3),
    round: i % 2 === 0,
  };
});

/* Scattered bokeh + sparkle field — deterministic so it never reflows. */
const SPARKS = [
  { x: 6, y: 20, s: 3 }, { x: 11, y: 54, s: 4 }, { x: 17, y: 34, s: 2 }, { x: 24, y: 72, s: 3 },
  { x: 29, y: 14, s: 5 }, { x: 34, y: 44, s: 2 }, { x: 68, y: 18, s: 3 }, { x: 72, y: 50, s: 4 },
  { x: 78, y: 32, s: 2 }, { x: 83, y: 66, s: 3 }, { x: 88, y: 24, s: 5 }, { x: 93, y: 46, s: 3 },
  { x: 14, y: 84, s: 2 }, { x: 40, y: 88, s: 3 }, { x: 60, y: 86, s: 2 }, { x: 90, y: 80, s: 3 },
  { x: 4, y: 40, s: 2 }, { x: 96, y: 60, s: 2 }, { x: 52, y: 10, s: 2 }, { x: 46, y: 84, s: 2 },
];

/* Golden confetti — gentle continuous fall. Deterministic so it never reflows. */
const CONFETTI = Array.from({ length: 28 }, (_, i) => {
  const r = (n: number) =>
    (((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1) + 1) % 1;
  return {
    left: Math.round(r(1) * 100),
    drift: Math.round((r(2) - 0.5) * 80),
    w: 5 + Math.round(r(3) * 5),
    h: 9 + Math.round(r(4) * 8),
    delay: +(r(5) * 7).toFixed(2),
    dur: +(5 + r(6) * 5).toFixed(2),
    rot: Math.round(r(7) * 360),
    color: GOLDS[Math.floor(r(8) * GOLDS.length)],
    round: r(9) > 0.7,
  };
});

/* Gold filigree scrollwork for a corner, mirrored to all four. */
function CornerFiligree() {
  return (
    <svg className="yac-corner-svg" viewBox="0 0 170 170" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="yacGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={FOIL} />
          <stop offset=".45" stopColor={GOLD_300} />
          <stop offset="1" stopColor={GOLD_600} />
        </linearGradient>
      </defs>
      <g stroke="url(#yacGold)" strokeLinecap="round" fill="none">
        <path d="M6 164 C6 86 40 22 164 8" strokeWidth="3" />
        <path d="M17 164 C17 98 54 38 164 24" strokeWidth="1.6" opacity=".75" />
        <path d="M164 24 C134 26 120 42 127 60 C132 72 148 72 150 60 C151 53 144 49 140 54" strokeWidth="2.2" />
        <path d="M44 100 C32 93 30 76 40 69" strokeWidth="2" />
        <path d="M72 62 C63 53 63 39 72 34" strokeWidth="2" />
        <path d="M30 128 C22 122 21 110 29 104" strokeWidth="1.6" opacity=".7" />
      </g>
      <circle cx="164" cy="24" r="3" fill={GOLD_300} />
      <circle cx="40" cy="69" r="2.4" fill={GOLD_300} />
      <circle cx="72" cy="34" r="2.4" fill={GOLD_300} />
    </svg>
  );
}

/* Award cup — a two-handled trophy on a stepped plinth, gold-foil filled. */
function Trophy() {
  return (
    <svg className="yac-trophy-svg" viewBox="0 0 120 190" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="yacTrophy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={FOIL} />
          <stop offset=".4" stopColor={GOLD_300} />
          <stop offset=".72" stopColor={GOLD_400} />
          <stop offset="1" stopColor={GOLD_600} />
        </linearGradient>
        <linearGradient id="yacTrophyEdge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={GOLD_600} />
          <stop offset=".5" stopColor={FOIL} />
          <stop offset="1" stopColor={GOLD_600} />
        </linearGradient>
      </defs>
      <g stroke="url(#yacTrophyEdge)" strokeWidth="1.4">
        <path d="M30 40 C6 40 6 86 34 90" fill="none" strokeWidth="5" stroke="url(#yacTrophy)" />
        <path d="M90 40 C114 40 114 86 86 90" fill="none" strokeWidth="5" stroke="url(#yacTrophy)" />
        <path d="M26 34 H94 V54 C94 86 78 104 60 104 C42 104 26 86 26 54 Z" fill="url(#yacTrophy)" />
        <rect x="22" y="28" width="76" height="9" rx="4.5" fill="url(#yacTrophy)" />
        <rect x="54" y="104" width="12" height="20" fill="url(#yacTrophy)" />
        <path d="M44 124 H76 L72 138 H48 Z" fill="url(#yacTrophy)" />
        <rect x="38" y="138" width="44" height="12" rx="2" fill="url(#yacTrophy)" />
        <rect x="30" y="150" width="60" height="14" rx="2" fill="url(#yacTrophy)" />
      </g>
      <path
        d="M60 50 L63.4 60.4 L74.3 60.4 L65.4 66.8 L68.8 77.2 L60 70.8 L51.2 77.2 L54.6 66.8 L45.7 60.4 L56.6 60.4 Z"
        fill={INK_DEEP}
        opacity=".55"
      />
    </svg>
  );
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=DM+Mono:wght@400;500&display=swap');

  .yac {
    --gold-600:${GOLD_600}; --gold-400:${GOLD_400};
    --gold-300:${GOLD_300}; --foil:${FOIL};
    position: relative; isolation: isolate; overflow: hidden;
    /* Brand hero gradient backdrop. */
    background-color: #133a8c;
    background-image: ${HERO_BG};
    font-family: 'Cormorant Garamond', Georgia, serif;
    padding: clamp(78px, 9vw, 132px) 24px clamp(70px, 7vw, 108px);
    color: #f3ecd6;
  }
  /* Contained warm glow behind the title only. */
  .yac::before {
    content: ''; position: absolute; z-index: -2; pointer-events: none;
    top: 10%; left: 50%; transform: translateX(-50%);
    width: min(680px, 82%); height: 540px;
    background: radial-gradient(ellipse 50% 44% at 50% 42%,
      rgba(255,165,82,0.16) 0%, rgba(255,165,82,0.06) 40%, transparent 72%);
  }
  /* Edge vignette so the gold ornament pops against the band. */
  .yac::after {
    content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none;
    background: radial-gradient(120% 90% at 50% 40%, transparent 54%, rgba(8,20,50,0.55) 100%);
    box-shadow: inset 0 0 160px 40px rgba(8,20,50,0.5);
  }

  .yac-sky { position: absolute; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
  .yac-spark {
    position: absolute; border-radius: 50%;
    background: radial-gradient(circle, var(--foil) 0%, rgba(255,165,82,0.55) 42%, transparent 74%);
    animation: yacTwinkle 4s ease-in-out infinite;
  }
  @keyframes yacTwinkle { 0%,100% { opacity: .3; } 50% { opacity: 1; } }

  .yac-confetti { position: absolute; inset: 0; z-index: 1; pointer-events: none; overflow: hidden; }
  .yac-conf { position: absolute; top: -6%; animation: yacFall linear infinite; will-change: transform, opacity; }
  @keyframes yacFall {
    0%   { transform: translateY(-10%) translateX(0) rotate(0deg); opacity: 0; }
    8%   { opacity: 1; }
    90%  { opacity: 1; }
    100% { transform: translateY(640px) translateX(var(--drift)) rotate(720deg); opacity: 0; }
  }

  .yac-popper { position: absolute; top: 2%; z-index: 2; pointer-events: none; }
  .yac-popper.l { left: 4%; }
  .yac-popper.r { right: 4%; transform: scaleX(-1); }
  .yac-pip { position: absolute; left: 0; top: 0; width: 7px; height: 7px; border-radius: 1px; opacity: 0; }
  .yac-popper.fire .yac-pip { animation: yacBurst 1.1s cubic-bezier(.12,.66,.3,1) forwards; }
  @keyframes yacBurst {
    0%   { opacity: 0; transform: translate(0,0) scale(.4) rotate(0deg); }
    12%  { opacity: 1; }
    100% { opacity: 0; transform: translate(var(--bx), var(--by)) scale(1) rotate(300deg); }
  }

  .yac-corner { position: absolute; width: clamp(120px, 17vw, 210px); height: clamp(120px, 17vw, 210px); z-index: 3; pointer-events: none; }
  .yac-corner-svg { width: 100%; height: 100%; display: block; filter: drop-shadow(0 2px 7px rgba(0,0,0,0.45)); }
  .yac-corner.tl { top: 10px; left: 10px; }
  .yac-corner.tr { top: 10px; right: 10px; transform: scaleX(-1); }
  .yac-corner.bl { bottom: 10px; left: 10px; transform: scaleY(-1); }
  .yac-corner.br { bottom: 10px; right: 10px; transform: scale(-1,-1); }

  .yac-trophy {
    position: absolute; z-index: 1; top: 50%; transform: translateY(-50%);
    width: clamp(110px, 15vw, 200px); pointer-events: none;
    filter: drop-shadow(0 8px 20px rgba(255,165,82,0.25)) drop-shadow(0 2px 6px rgba(0,0,0,0.4));
  }
  .yac-trophy-svg { width: 100%; height: auto; display: block; }
  .yac-trophy.left  { left: clamp(8px, 7vw, 120px); transform: translateY(-50%) rotate(-4deg); }
  .yac-trophy.right { right: clamp(8px, 7vw, 120px); transform: translateY(-50%) rotate(4deg); }
  .yac-trophy::after {
    content: ''; position: absolute; left: 50%; bottom: -6%; transform: translateX(-50%);
    width: 120%; height: 34px; border-radius: 50%;
    background: radial-gradient(ellipse, rgba(255,165,82,0.22), transparent 70%);
  }
  @media (max-width: 860px) { .yac-trophy { opacity: .4; } }
  @media (max-width: 560px) { .yac-trophy { display: none; } }

  .yac-inner { position: relative; z-index: 2; max-width: 980px; margin: 0 auto; text-align: center; }

  .yac-presents {
    font-family: 'DM Mono', monospace; font-weight: 500;
    font-size: clamp(9px, 1.2vw, 11.5px); letter-spacing: .4em; text-indent: .4em;
    text-transform: uppercase; color: var(--gold-300); margin: 0 0 20px; opacity: .95;
  }

  .yac-title { margin: 0; }
  .yac-ln {
    display: block; width: 100%;
    font-family: 'Cinzel', Georgia, serif; line-height: 1.04; letter-spacing: .02em;
    background: linear-gradient(180deg, var(--foil) 0%, var(--gold-300) 34%, var(--gold-400) 60%, var(--gold-600) 100%);
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent; color: transparent;
    filter: drop-shadow(0 1px 6px rgba(239,122,26,0.3));
  }
  .yac-ln.big  { font-weight: 800; font-size: clamp(1.9rem, 6.4vw, 4.6rem); }
  .yac-ln.med  { font-weight: 700; font-size: clamp(1.4rem, 5vw, 3.4rem); }

  .yac-and {
    display: flex; align-items: center; justify-content: center; gap: 14px;
    margin: clamp(10px, 1.6vw, 18px) 0;
    font-family: 'Cormorant Garamond', serif; font-weight: 700; font-style: italic;
    font-size: clamp(.95rem, 1.7vw, 1.2rem); letter-spacing: .34em; text-indent: .34em;
    color: var(--gold-300); text-transform: uppercase;
  }
  .yac-and i { height: 1px; width: clamp(44px, 11vw, 110px); background: linear-gradient(90deg, transparent, var(--gold-400)); }
  .yac-and i:last-child { background: linear-gradient(90deg, var(--gold-400), transparent); }
  .yac-and b { width: 7px; height: 7px; transform: rotate(45deg); background: var(--gold-300); box-shadow: 0 0 8px rgba(255,165,82,0.75); }

  .yac-details {
    position: relative; z-index: 2;
    display: flex; flex-wrap: wrap; justify-content: center; gap: clamp(16px, 2.5vw, 26px);
    margin: clamp(42px, 5vw, 64px) auto 0;
  }
  .yac-card {
    position: relative; min-width: 230px; padding: 26px 34px 24px; text-align: center;
    border: 1px solid rgba(255,165,82,0.4); border-radius: 14px;
    background: linear-gradient(180deg, rgba(19,58,140,0.55), rgba(10,40,54,0.8));
    box-shadow: 0 16px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,232,207,0.16);
    overflow: hidden;
  }
  .yac-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, transparent, var(--gold-400), var(--foil), var(--gold-400), transparent);
  }
  .yac-card-ico {
    width: 34px; height: 34px; margin: 0 auto 12px; display: grid; place-items: center;
    border-radius: 50%; color: var(--gold-300); border: 1px solid rgba(255,165,82,0.45);
    background: radial-gradient(circle at 36% 30%, rgba(255,232,207,0.16), rgba(10,40,54,0.5));
  }
  .yac-card-ico svg { width: 17px; height: 17px; }
  .yac-card dt {
    font-family: 'DM Mono', monospace; font-size: 9.5px; letter-spacing: .3em; text-indent: .3em;
    text-transform: uppercase; color: var(--gold-300); margin-bottom: 8px;
  }
  .yac-card dd {
    margin: 0; font-family: 'Cinzel', serif; font-weight: 600;
    font-size: clamp(1.1rem, 1.9vw, 1.42rem); line-height: 1.15; color: #fff; letter-spacing: .01em;
  }

  .yac .reveal { opacity: 0; transform: translateY(22px);
    transition: opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1); }
  .yac .reveal.visible { opacity: 1; transform: none; }
  .yac .d1.visible { transition-delay: .06s; }
  .yac .d2.visible { transition-delay: .16s; }
  .yac .d3.visible { transition-delay: .28s; }

  @media (max-width: 560px) {
    .yac-corner { width: 96px; height: 96px; }
    .yac-details { gap: 14px; }
    .yac-card { min-width: 0; width: 100%; max-width: 320px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .yac *, .yac *::before, .yac *::after { animation: none !important; transition: none !important; }
    .yac .reveal { opacity: 1 !important; transform: none !important; }
  }
`;

export function AwardCeremonyBanner() {
  const sectionRef = useRef<HTMLElement>(null);

  // Reveal content + fire the corner poppers once, on scroll into view.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.querySelectorAll(".reveal").forEach((n) => n.classList.add("visible"));
            if (!reduce) {
              el.querySelectorAll(".yac-popper").forEach((p) => p.classList.add("fire"));
            }
            io.disconnect();
          }
        }),
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="yac" aria-labelledby="yac-title" ref={sectionRef}>
      <style>{STYLES}</style>

      {/* Golden confetti */}
      <div className="yac-confetti" aria-hidden="true">
        {CONFETTI.map((c, i) => (
          <span
            key={`c${i}`}
            className="yac-conf"
            style={
              {
                left: `${c.left}%`,
                width: c.w,
                height: c.round ? c.w : c.h,
                background: c.color,
                borderRadius: c.round ? "50%" : "1px",
                "--drift": `${c.drift}px`,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.dur}s`,
                transform: `rotate(${c.rot}deg)`,
                opacity: 0.9,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Corner party poppers */}
      {(["l", "r"] as const).map((side) => (
        <div key={side} className={`yac-popper ${side}`} aria-hidden="true">
          {PIPS.map((p, i) => (
            <span
              key={i}
              className="yac-pip"
              style={
                {
                  background: p.color,
                  borderRadius: p.round ? "50%" : "1px",
                  "--bx": `${p.bx}px`,
                  "--by": `${p.by}px`,
                  animationDelay: `${p.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      ))}

      {/* Bokeh + sparkle field */}
      <div className="yac-sky" aria-hidden="true">
        {SPARKS.map((p, i) => (
          <span
            key={`k${i}`}
            className="yac-spark"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.s,
              height: p.s,
              animationDelay: `${(i % 6) * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Ornamental gold corners */}
      <div className="yac-corner tl" aria-hidden="true"><CornerFiligree /></div>
      <div className="yac-corner tr" aria-hidden="true"><CornerFiligree /></div>
      <div className="yac-corner bl" aria-hidden="true"><CornerFiligree /></div>
      <div className="yac-corner br" aria-hidden="true"><CornerFiligree /></div>

      {/* Award trophies flanking the title */}
      <div className="yac-trophy left" aria-hidden="true"><Trophy /></div>
      <div className="yac-trophy right" aria-hidden="true"><Trophy /></div>

      {/* Content */}
      <div className="yac-inner">
        <p className="yac-presents reveal d1">
          Youth United Council of India presents
        </p>

        <h2 id="yac-title" className="yac-title reveal d2">
          <span className="yac-ln big">YOUTH UNITED</span>
          <span className="yac-ln big">FESTIVAL 2026</span>
          <span className="yac-and" aria-hidden="true"><i /><b />and<b /><i /></span>
          <span className="yac-ln med">NDC AWARD CEREMONY</span>
        </h2>

        <dl className="yac-details reveal d3">
          {PROGRAMME.map(({ k, v, Icon }) => (
            <div className="yac-card" key={k}>
              <div className="yac-card-ico"><Icon strokeWidth={1.75} /></div>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
