"use client";

import { useCallback, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CheckCircle2, Info, XCircle } from "lucide-react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { whatsappLink } from "@/lib/site";
import { Mascot, type MascotMood } from "@/components/mascot/Mascot";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { ScratchPuzzle } from "./ScratchPuzzle";
import { PythonLab } from "./PythonLab";
import { CppSearch } from "./CppSearch";
import type { ResultKind } from "./types";

const MODES = [
  { id: "scratch", label: "Scratch", sub: "Block puzzle", color: "#8B5CF6" },
  { id: "python", label: "Python", sub: "Fix the output", color: "#27D8FF" },
  { id: "cpp", label: "C++", sub: "Binary search", color: "#4285FF" },
] as const;
type Mode = (typeof MODES)[number]["id"];

const INTRO: Record<Mode, string> = {
  scratch: "Snap blocks together to guide me to the star!",
  python: "Tweak the code until your output matches the target.",
  cpp: "Help the algorithm find the number. Pick each next step!",
};

export function Playground() {
  const root = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<Mode>("scratch");
  const [feedback, setFeedback] = useState<{ kind: ResultKind; msg: string; key: number } | null>(null);
  const [mood, setMood] = useState<MascotMood>("idle");
  const [moodKey, setMoodKey] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const onResult = useCallback((kind: ResultKind, msg: string) => {
    setFeedback((f) => ({ kind, msg, key: (f?.key ?? 0) + 1 }));
    setMood(kind === "success" ? "celebrate" : kind === "mistake" ? "oops" : "think");
    setMoodKey((k) => k + 1);
  }, []);

  const switchMode = (m: Mode) => { setMode(m); setFeedback(null); setMood("idle"); };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let n = i;
    if (e.key === "ArrowRight") n = (i + 1) % MODES.length;
    else if (e.key === "ArrowLeft") n = (i - 1 + MODES.length) % MODES.length;
    else return;
    e.preventDefault();
    switchMode(MODES[n].id);
    tabs.current[n]?.focus();
  };

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.from("[data-pg-heading] > *", { opacity: 0, y: 40, stagger: 0.12, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 70%", once: true } });
      gsap.from("[data-pg-panel]", { opacity: 0, y: 70, scale: 0.98, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: "[data-pg-panel]", start: "top 85%", once: true } });
    });
    return () => mm.revert();
  }, { scope: root });

  const bubble = feedback ? (feedback.kind === "success" ? "You did it!" : feedback.kind === "mistake" ? "Hmm, let's debug that." : "Nice thinking!") : INTRO[mode];

  return (
    <section ref={root} id="playground" aria-labelledby="playground-title" className="relative overflow-hidden section-y">
      <div aria-hidden data-depth="0.4" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_30%,rgba(139,92,246,0.14),transparent_70%)]" />
      <div className="container-x">
        <div data-pg-heading className="mx-auto max-w-3xl text-center">
          <p className="eyebrow justify-center">Interactive playground</p>
          <h2 id="playground-title" className="mt-5 font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
            Your first line of code <span className="text-gradient-cool">starts here</span>
          </h2>
          <p className="mt-5 text-lg text-mist">Discover how fun coding can be.</p>
        </div>

        <div data-pg-panel className="section-gap grid gap-6 lg:grid-cols-12">
          <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-navy/90 shadow-[0_40px_120px_-40px_rgba(139,92,246,0.4)] lg:col-span-9">
            <div role="tablist" aria-label="Playground modes" className="flex border-b border-white/10">
              {MODES.map((m, i) => {
                const sel = m.id === mode;
                return (
                  <button key={m.id} ref={(el) => { tabs.current[i] = el; }} role="tab" id={`pg-tab-${m.id}`} aria-selected={sel} aria-controls="pg-panel" tabIndex={sel ? 0 : -1}
                    onClick={() => switchMode(m.id)} onKeyDown={(e) => onKey(e, i)}
                    className={`relative flex-1 px-3 py-4 text-left transition-colors sm:px-6 ${sel ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"}`}>
                    <span className="block font-display text-base font-semibold sm:text-lg" style={{ color: sel ? m.color : undefined }}>{m.label}</span>
                    <span className="hidden text-xs text-dim sm:block">{m.sub}</span>
                    {sel && <motion.span layoutId="pg-tab-line" className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: m.color }} />}
                  </button>
                );
              })}
            </div>
            <div id="pg-panel" role="tabpanel" aria-labelledby={`pg-tab-${mode}`} className="p-4 sm:p-6">
              {mode === "scratch" && <ScratchPuzzle onResult={onResult} />}
              {mode === "python" && <PythonLab onResult={onResult} />}
              {mode === "cpp" && <CppSearch onResult={onResult} />}
            </div>
          </div>

          <aside className="flex flex-col gap-4 lg:col-span-3" aria-label="Mascot coach">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,#111a33,#0a1020)] p-4">
              <div className="relative mx-auto aspect-[2/3] w-40 sm:w-48 lg:w-full lg:max-w-[13rem]">
                <Mascot pose="idle" mood={mood} reactionKey={moodKey} decorative bubbleSide="top" message={null} sizes="220px" />
              </div>
              <p className="mt-2 text-center font-display text-sm font-semibold text-snow">{bubble}</p>
            </div>
            <div aria-live="polite" className="min-h-[7rem]">
              <AnimatePresence mode="wait">
                {feedback && (
                  <motion.div key={feedback.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}
                    className={`flex gap-3 rounded-2xl border p-4 text-sm leading-relaxed ${feedback.kind === "success" ? "border-ok/40 bg-ok/10" : feedback.kind === "mistake" ? "border-warn/40 bg-warn/10" : "border-cyan/30 bg-cyan/10"}`}>
                    {feedback.kind === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ok" /> : feedback.kind === "mistake" ? <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-warn" /> : <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />}
                    <p>{feedback.msg}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </aside>
        </div>

        {/* CTA */}
        <div className="noise relative mt-16 overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(120deg,#1b3a8f_0%,#1a1f5c_45%,#3b1f7a_100%)] px-6 py-12 text-center sm:px-12 sm:py-16">
          <div aria-hidden className="grid-bg absolute inset-0 opacity-40" />
          <div aria-hidden className="absolute -top-24 left-1/2 h-64 w-[70%] -translate-x-1/2 rounded-full bg-cyan/25 blur-3xl" />
          <div className="relative">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">Ready to start coding?</p>
            <p className="mx-auto mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">Turn this curiosity into real projects, one lesson at a time.</p>
            <a href={whatsappLink("Hi Rune Codes! We just tried the coding playground on your website and would like to join. Could you share the next steps?")} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp group mt-8">
              <WhatsAppIcon className="h-4 w-4" /> Join Rune Codes <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              <span className="sr-only">(opens WhatsApp in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
