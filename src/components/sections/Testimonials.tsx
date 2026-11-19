"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const ITEMS = [
  { who: "Proud Parent", quote: "My daughter's one-on-one lessons with Rune Codes have been amazing. The interactive and structured approach keeps learning engaging. We also receive regular progress updates. Highly recommended!", accent: "#27D8FF" },
  { who: "Happy Student", quote: "Attending the online coding class has been a meaningful experience. I gained practical skills and confidence through engaging lessons.", accent: "#8B5CF6" },
  { who: "Aspiring Coder", quote: "These C++ classes were awesome! The tutor explained things clearly and made learning fun. Now I can write my own programs confidently.", accent: "#4285FF" },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const reduce = useReducedMotion();
  const region = useRef<HTMLDivElement>(null);

  const go = (n: number) => { setDir(n > i || (i === ITEMS.length - 1 && n === 0) ? 1 : -1); setI((n + ITEMS.length) % ITEMS.length); };
  const autoplay = !paused && !hover && !reduce;

  useEffect(() => {
    if (!autoplay) return;
    const t = window.setTimeout(() => { setDir(1); setI((x) => (x + 1) % ITEMS.length); }, 7000);
    return () => window.clearTimeout(t);
  }, [autoplay, i]);

  const t = ITEMS[i];

  return (
    <section id="testimonials" aria-labelledby="testimonials-title" className="relative py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading id="testimonials-title" label="Testimonials" title="What Our Community Says" subtitle="Hear from parents and students who've experienced the Rune Codes difference." align="center" />

        <div
          ref={region}
          role="region"
          aria-roledescription="carousel"
          aria-label="Testimonials"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onFocus={() => setHover(true)}
          onBlur={(e) => { if (!region.current?.contains(e.relatedTarget as Node)) setHover(false); }}
          onKeyDown={(e) => { if (e.key === "ArrowRight") go(i + 1); if (e.key === "ArrowLeft") go(i - 1); }}
          className="relative mx-auto mt-14 max-w-4xl"
        >
          <div className="noise relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,#111a33,#0a1020)] p-8 sm:min-h-[20rem] sm:p-14">
            <div aria-hidden className="absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl transition-colors duration-700" style={{ background: `${t.accent}30` }} />
            <span aria-hidden className="absolute left-6 top-2 font-display text-[9rem] leading-none text-white/[0.05] sm:left-10">“</span>
            <div aria-live={autoplay ? "off" : "polite"}>
              <AnimatePresence mode="wait" custom={dir}>
                <motion.figure
                  key={i}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${ITEMS.length}`}
                  custom={dir}
                  initial={{ opacity: 0, x: reduce ? 0 : dir * 40, filter: "blur(6px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: reduce ? 0 : dir * -40, filter: "blur(6px)" }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative"
                >
                  <blockquote className="font-display text-xl font-medium leading-relaxed tracking-tight sm:text-[1.65rem] sm:leading-snug">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-8 flex items-center gap-3">
                    <span className="h-px w-10" style={{ background: t.accent }} />
                    <span className="font-mono text-sm uppercase tracking-[0.2em]" style={{ color: t.accent }}>{t.who}</span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {ITEMS.map((it, n) => (
                <button key={it.who} type="button" onClick={() => go(n)} aria-label={`Show testimonial ${n + 1}: ${it.who}`} aria-current={n === i ? "true" : undefined}
                  className="group grid h-10 place-items-center px-1">
                  <span className={`block h-1.5 rounded-full transition-all duration-500 ${n === i ? "w-10 bg-cyan" : "w-4 bg-white/20 group-hover:bg-white/40"}`} />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {!reduce && (
                <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? "Resume auto-rotation" : "Pause auto-rotation"} className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-mist hover:text-snow">
                  {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </button>
              )}
              <button type="button" onClick={() => go(i - 1)} aria-label="Previous testimonial" className="grid h-11 w-11 place-items-center rounded-full border border-white/10 hover:border-cyan/50">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => go(i + 1)} aria-label="Next testimonial" className="grid h-11 w-11 place-items-center rounded-full border border-white/10 hover:border-cyan/50">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
