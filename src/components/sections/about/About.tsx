"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Lightbulb, TrendingUp, CodeXml, Smile } from "lucide-react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ConfidenceVisual, CreateVisual, FunVisual, SparkVisual } from "./ValueVisuals";

const VALUES = [
  { key: "spark", title: "Spark Curiosity", body: "Ignite the love for learning through engaging projects.", Icon: Lightbulb, Visual: SparkVisual, accent: "#27D8FF" },
  { key: "confidence", title: "Build Confidence", body: "Every success builds self-belief and motivation.", Icon: TrendingUp, Visual: ConfidenceVisual, accent: "#34D399" },
  { key: "create", title: "Create & Code", body: "Transform ideas into working programs.", Icon: CodeXml, Visual: CreateVisual, accent: "#8B5CF6" },
  { key: "fun", title: "Have Fun", body: "Learning should be enjoyable and exciting.", Icon: Smile, Visual: FunVisual, accent: "#FFBF00" },
] as const;

const STORY =
  "Rune Codes empowers young minds to unlock their tech potential through fun, hands-on programming lessons designed for beginners.";

export function About() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // Scroll-scrubbed word illumination for the story statement.
        gsap.fromTo(
          "[data-story-word]",
          { opacity: 0.16 },
          {
            opacity: 1,
            stagger: 0.08,
            ease: "none",
            scrollTrigger: { trigger: "[data-story]", start: "top 80%", end: "bottom 45%", scrub: 0.6 },
          },
        );
        gsap.from("[data-about-fade]", {
          opacity: 0, y: 30, duration: 1, stagger: 0.12, ease: "power3.out",
          scrollTrigger: { trigger: "[data-about-body]", start: "top 80%", once: true },
        });
        gsap.from("[data-quote]", {
          opacity: 0, y: 50, scale: 0.97, duration: 1.2, ease: "expo.out",
          scrollTrigger: { trigger: "[data-quote]", start: "top 85%", once: true },
        });
        gsap.from("[data-values]", {
          opacity: 0, y: 60, duration: 1.2, ease: "expo.out",
          scrollTrigger: { trigger: "[data-values]", start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next = i;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % VALUES.length;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + VALUES.length) % VALUES.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = VALUES.length - 1;
    else return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  const V = VALUES[active];

  return (
    <section ref={root} id="about" aria-labelledby="about-title" className="relative overflow-x-clip section-y">
      <div aria-hidden data-depth="0.6" className="pointer-events-none absolute left-0 top-40 -z-10 h-[30rem] w-[30rem] rounded-full bg-violet/10 blur-[120px]" />
      <div className="container-x">
        <SectionHeading id="about-title" label="Who we are" title="About Rune Codes" />

        <div className="section-gap grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <p data-story className="font-display text-2xl font-medium leading-snug tracking-tight sm:text-3xl lg:text-[2.35rem] lg:leading-[1.2]">
              {STORY.split(" ").map((w, i) => (
                <span key={i} data-story-word className="inline">{w} </span>
              ))}
            </p>
            <div data-about-body className="mt-10 grid gap-6 text-mist sm:grid-cols-2 sm:text-lg">
              <p data-about-fade className="leading-relaxed">
                We don&apos;t just teach code — we spark curiosity, build confidence, and turn ideas into real creations.
              </p>
              <p data-about-fade className="leading-relaxed">
                From bouncing ball games to problem-solving algorithms, our students learn to think logically, solve creatively, and code fearlessly.
              </p>
            </div>
          </div>

          <figure data-quote className="relative lg:col-span-5">
            <div className="depth noise relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(150deg,#13204a_0%,#0c1224_55%,#1a1240_100%)] p-8 sm:p-10">
              <div aria-hidden className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-blue/30 blur-3xl" />
              <svg aria-hidden viewBox="0 0 48 36" className="h-10 w-12 text-cyan"><path fill="currentColor" d="M0 36V22C0 10 6 2 18 0l2 5c-6 2-9 6-9 12h8v19H0Zm28 0V22c0-12 6-20 18-22l2 5c-6 2-9 6-9 12h8v19H28Z" /></svg>
              <blockquote className="relative mt-6 font-display text-2xl font-semibold leading-snug tracking-tight sm:text-[1.9rem]">
                At Rune Codes, every child becomes a <span className="text-gradient-cool">creator</span>, not just a user of technology.
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-dim">
                <span className="h-px w-8 bg-cyan/60" /> Our promise
              </figcaption>
            </div>
          </figure>
        </div>

        {/* Core values explorer */}
        <div data-values className="mt-[clamp(4rem,8vw,7rem)] grid gap-6 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Four values behind every lesson</h3>
            <p className="mt-3 text-mist">Select a value to see it come to life.</p>
            <div role="tablist" aria-label="Rune Codes core values" aria-orientation="vertical" className="mt-8 flex flex-col gap-2">
              {VALUES.map((v, i) => {
                const selected = i === active;
                return (
                  <button
                    key={v.key}
                    ref={(el) => { tabs.current[i] = el; }}
                    role="tab"
                    id={`value-tab-${v.key}`}
                    aria-selected={selected}
                    aria-controls="value-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActive(i)}
                    onMouseEnter={() => window.matchMedia("(pointer: fine)").matches && setActive(i)}
                    onKeyDown={(e) => onKey(e, i)}
                    className={`group relative flex w-full items-start gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-colors duration-300 sm:p-5 ${selected ? "border-white/15 bg-white/[0.05]" : "border-transparent hover:bg-white/[0.03]"}`}
                  >
                    {selected && (
                      <motion.span layoutId="value-bar" className="absolute inset-y-3 left-0 w-[3px] rounded-full" style={{ background: v.accent }} />
                    )}
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-navy" style={{ color: v.accent }}>
                      <v.Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="flex items-baseline gap-3">
                        <span className="font-mono text-xs text-dim">0{i + 1}</span>
                        <span className="font-display text-lg font-semibold">{v.title}</span>
                      </span>
                      <span className={`mt-1 block text-sm leading-relaxed transition-colors ${selected ? "text-mist" : "text-dim"}`}>{v.body}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            id="value-panel"
            role="tabpanel"
            aria-labelledby={`value-tab-${V.key}`}
            className="depth relative min-h-[20rem] overflow-hidden rounded-[2rem] border border-white/10 bg-navy/80 sm:min-h-[24rem] lg:col-span-7"
          >
            <div aria-hidden className="grid-bg absolute inset-0 opacity-60" />
            <div aria-hidden className="absolute -bottom-24 left-1/2 h-64 w-[80%] -translate-x-1/2 rounded-full blur-3xl transition-colors duration-700" style={{ background: `${V.accent}33` }} />
            <AnimatePresence mode="wait">
              <motion.div
                key={V.key}
                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <V.Visual />
              </motion.div>
            </AnimatePresence>
            <p className="absolute bottom-4 left-5 font-display text-sm font-semibold" style={{ color: V.accent }}>{V.title}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
