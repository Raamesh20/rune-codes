"use client";

import { useRef } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { programEnquiryLink } from "@/lib/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { ScratchDemo } from "./ScratchDemo";
import { PythonDemo } from "./PythonDemo";
import { CppDemo } from "./CppDemo";

const PROGRAMS = [
  {
    id: "scratch",
    n: "01",
    name: "Scratch Programming",
    short: "Scratch",
    ages: "Ages 7+",
    tagline: "Perfect for beginners.",
    accent: "#8B5CF6",
    glow: "rgba(139,92,246,0.35)",
    features: [
      "Drag-and-drop coding for young beginners",
      "Create games, interactive stories, and animations",
      "Learn loops, conditions, and events",
      "Builds logical thinking in a playful way",
    ],
    demoTitle: "Try it: draw shapes with a loop",
    Demo: ScratchDemo,
  },
  {
    id: "python",
    n: "02",
    name: "Python",
    short: "Python",
    ages: "Ages 11+",
    tagline: "A great starting language.",
    accent: "#27D8FF",
    glow: "rgba(39,216,255,0.3)",
    features: [
      "Simple and readable language, perfect for first-time coders",
      "Learn coding through mini projects and real examples",
      "Explore basics of logic, problem-solving, and automation",
      "Widely used in AI, data science, and everyday applications",
    ],
    demoTitle: "Try it: change the inputs and run",
    Demo: PythonDemo,
  },
  {
    id: "cpp",
    n: "03",
    name: "C++",
    short: "C++",
    ages: "Ages 12+",
    tagline: "For aspiring developers.",
    accent: "#4285FF",
    glow: "rgba(66,133,255,0.35)",
    features: [
      "Introduction to real-world programming syntax",
      "Step-by-step training on variables, loops, functions, and algorithms",
      "Ideal for school syllabus, coding contests, and early tech careers",
      "Builds strong problem-solving foundations",
    ],
    demoTitle: "Try it: step through a sorting algorithm",
    Demo: CppDemo,
  },
] as const;

export function Programs() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.utils.toArray<HTMLElement>("[data-program]").forEach((el) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 78%", once: true } });
          tl.from(el.querySelector("[data-prog-num]"), { yPercent: 60, opacity: 0, duration: 1.2, ease: "expo.out" })
            .from(el.querySelectorAll("[data-prog-text]"), { opacity: 0, y: 24, stagger: 0.08, duration: 0.9, ease: "expo.out" }, 0.1)
            .from(el.querySelector("[data-prog-demo]"), { opacity: 0, y: 60, rotateX: 8, duration: 1.3, ease: "expo.out" }, 0.2);
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="programs" aria-labelledby="programs-title" className="relative overflow-x-clip py-24 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute right-0 top-20 -z-10 h-[36rem] w-[36rem] rounded-full bg-blue/10 blur-[140px]" />
      <div className="container-x">
        <div data-programs-intro className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionHeading id="programs-title" label="Our programs" title="What We Offer" subtitle="Age-appropriate courses designed to build coding skills from the ground up." />
            <nav aria-label="Programs" className="mt-8 flex flex-wrap gap-2">
              {PROGRAMS.map((p) => (
                <a key={p.id} href={`#program-${p.id}`} className="group flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] py-2 pl-2 pr-4 text-sm transition hover:border-white/25">
                  <span className="grid h-7 w-7 place-items-center rounded-full font-mono text-[0.65rem] text-ink" style={{ background: p.accent }}>{p.n}</span>
                  <span className="font-medium">{p.short}</span>
                  <span className="text-dim">{p.ages}</span>
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-16 space-y-24 sm:mt-20 lg:space-y-32">
          {PROGRAMS.map((p, idx) => (
            <article key={p.id} id={`program-${p.id}`} data-program aria-labelledby={`program-${p.id}-title`} className="relative scroll-mt-28">
              <div className={`grid items-start gap-10 lg:grid-cols-12 lg:gap-12`}>
                <div className={`lg:col-span-4 ${idx % 2 ? "lg:order-2" : ""} lg:sticky lg:top-28`}>
                  <div className="overflow-hidden">
                    <span data-prog-num aria-hidden className="block font-display text-[5.5rem] font-bold leading-none tracking-tighter sm:text-[7rem]" style={{ WebkitTextStroke: `1.5px ${p.accent}`, color: "transparent" }}>
                      {p.n}
                    </span>
                  </div>
                  <p data-prog-text className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-xs uppercase tracking-[0.18em]" style={{ color: p.accent, background: `${p.accent}1a`, boxShadow: `inset 0 0 0 1px ${p.accent}40` }}>
                    {p.ages}
                  </p>
                  <h3 data-prog-text id={`program-${p.id}-title`} className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{p.name}</h3>
                  <p data-prog-text className="mt-2 font-display text-lg italic text-mist">{p.tagline}</p>
                  <ul className="mt-6 space-y-3">
                    {p.features.map((f) => (
                      <li data-prog-text key={f} className="flex gap-3 text-[0.95rem] leading-relaxed text-mist">
                        <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full" style={{ background: `${p.accent}22`, color: p.accent }}>
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a data-prog-text href={programEnquiryLink(p.name, p.ages)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost group mt-8">
                    <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                    Enquire about {p.short}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    <span className="sr-only">(opens WhatsApp in a new tab)</span>
                  </a>
                </div>

                <div data-prog-demo className={`[perspective:1200px] lg:col-span-8 ${idx % 2 ? "lg:order-1" : ""}`}>
                  <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-navy/90" style={{ boxShadow: `0 40px 120px -40px ${p.glow}` }}>
                    <div aria-hidden className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${p.accent}, transparent)` }} />
                    <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <span className="h-2 w-2 rounded-full" style={{ background: p.accent, boxShadow: `0 0 10px ${p.accent}` }} />
                        {p.demoTitle}
                      </p>
                      <span className="hidden font-mono text-[0.65rem] uppercase tracking-[0.18em] text-dim sm:inline">Interactive</span>
                    </div>
                    <p.Demo />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
