"use client";

import { useRef } from "react";
import { Rocket, Target } from "lucide-react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { SectionHeading } from "@/components/ui/SectionHeading";

const BLOCKS = [
  { label: "complex concepts → simple steps", cat: "control" },
  { label: "fun & interactive", cat: "events" },
  { label: "beginner-friendly", cat: "motion" },
  { label: "creativity", cat: "pen" },
  { label: "problem-solving", cat: "motion" },
] as const;

const ORBITS = [
  { r: 70, label: "Developers", color: "#4285FF", dur: 22 },
  { r: 112, label: "Engineers", color: "#27D8FF", dur: 30 },
  { r: 154, label: "Tech innovators", color: "#8B5CF6", dur: 40 },
];

export function Purpose() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // Mission: blocks stack one at a time as the visitor scrolls.
        gsap.fromTo(
          "[data-stack-block]",
          { y: -140, opacity: 0, rotate: (i) => (i % 2 ? 6 : -6) },
          {
            y: 0, opacity: 1, rotate: 0, stagger: 0.25, ease: "bounce.out",
            scrollTrigger: { trigger: "[data-mission]", start: "top 75%", end: "center 45%", scrub: 0.8 },
          },
        );
        // Vision: orbit system scales out from the first line of code.
        gsap.from("[data-orbit]", {
          scale: 0.2, opacity: 0, transformOrigin: "50% 50%", stagger: 0.18, duration: 1.4, ease: "expo.out",
          scrollTrigger: { trigger: "[data-vision]", start: "top 70%", once: true },
        });
        gsap.utils.toArray<HTMLElement>("[data-orbit-spin]").forEach((el, i) => {
          gsap.to(el, { rotate: i % 2 ? -360 : 360, duration: ORBITS[i].dur, repeat: -1, ease: "none", svgOrigin: "0 0" });
        });
        gsap.utils.toArray<HTMLElement>("[data-orbit-label]").forEach((el, i) => {
          // counter-rotate so labels stay upright
          gsap.to(el, { rotate: i % 2 ? 360 : -360, duration: ORBITS[i].dur, repeat: -1, ease: "none", transformOrigin: "50% 50%" });
        });
        gsap.from("[data-purpose-text]", {
          opacity: 0, y: 40, duration: 1.1, stagger: 0.15, ease: "expo.out",
          scrollTrigger: { trigger: root.current, start: "top 65%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="purpose" aria-labelledby="purpose-title" className="relative overflow-hidden section-y">
      <div aria-hidden data-depth="0.4" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(66,133,255,0.12),transparent_70%)]" />
      <div className="container-x">
        <SectionHeading id="purpose-title" label="Our purpose" title="Mission & Vision" align="center" />

        <div className="section-gap grid gap-6 lg:grid-cols-2">
          {/* Mission */}
          <article data-mission className="depth depth-hover noise relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,#0f1a3a,#0a1020_60%)] p-7 sm:p-10">
            <div aria-hidden className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue/20 blur-3xl" />
            <div data-purpose-text className="relative">
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-cyan"><Target className="h-4 w-4" /> Our mission</p>
              <p className="mt-5 font-display text-xl font-medium leading-snug sm:text-2xl">
                To inspire and educate young learners by transforming complex coding concepts into fun, interactive, and beginner-friendly learning experiences.
              </p>
              <p className="mt-4 leading-relaxed text-mist">
                We aim to nurture a love for technology, creativity, and problem-solving, guiding each learner one code block at a time.
              </p>
            </div>
            <div className="relative mt-10 flex min-h-[17rem] flex-col items-start justify-end gap-[3px] pl-1" aria-label="Learning blocks stacking up one at a time" role="img">
              {BLOCKS.map((b, i) => (
                <div key={b.label} data-stack-block className="sblock" data-cat={b.cat} style={{ marginLeft: `${(i % 3) * 14}px` }}>
                  {i === 0 ? <span className="opacity-80">learn</span> : <span className="opacity-80">add</span>}
                  <span className="slot">{b.label}</span>
                </div>
              ))}
            </div>
          </article>

          {/* Vision */}
          <article data-vision className="depth depth-hover noise relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(200deg,#1a1240,#0a1020_60%)] p-7 sm:p-10">
            <div aria-hidden className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet/25 blur-3xl" />
            <div data-purpose-text className="relative">
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-violet"><Rocket className="h-4 w-4" /> Our vision</p>
              <p className="mt-5 font-display text-xl font-medium leading-snug sm:text-2xl">
                To become a launchpad for tomorrow&apos;s developers, engineers, and tech innovators, starting from their very first line of code.
              </p>
              <p className="mt-4 leading-relaxed text-mist">
                We envision a future where every child has the confidence and skills to create with technology, not just consume it.
              </p>
            </div>
            <div className="relative mx-auto mt-8 aspect-square w-full max-w-[22rem]" role="img" aria-label="Orbits expanding from a first line of code to developers, engineers and tech innovators">
              <svg viewBox="-180 -180 360 360" className="h-full w-full overflow-visible">
                <defs>
                  <radialGradient id="core-g">
                    <stop offset="0" stopColor="#27D8FF" stopOpacity="0.6" />
                    <stop offset="1" stopColor="#27D8FF" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle r="60" fill="url(#core-g)" />
                {ORBITS.map((o, i) => (
                  <g key={o.label} data-orbit>
                    <circle r={o.r} fill="none" stroke={o.color} strokeOpacity="0.35" strokeDasharray={i === 1 ? "2 6" : undefined} />
                    <g data-orbit-spin>
                      <g transform={`rotate(${i * 120 - 60}) translate(${o.r} 0)`}>
                        <g data-orbit-label>
                          <circle r="6" fill={o.color} />
                          <circle r="12" fill={o.color} opacity="0.2" />
                        </g>
                      </g>
                    </g>
                  </g>
                ))}
                <rect x="-62" y="-15" width="124" height="30" rx="8" fill="#0C1224" stroke="rgba(148,163,184,.35)" />
                <text y="5" textAnchor="middle" fontSize="11.5" fontFamily="var(--font-geist-mono)">
                  <tspan fill="#6fb8ff">print</tspan><tspan fill="#e7ecf5">(</tspan><tspan fill="#8ee6b4">&quot;Hello!&quot;</tspan><tspan fill="#e7ecf5">)</tspan>
                </text>
              </svg>
              <ul className="mt-2 flex flex-wrap justify-center gap-2">
                {ORBITS.map((o) => (
                  <li key={o.label} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-mist">
                    <span className="h-2 w-2 rounded-full" style={{ background: o.color }} /> {o.label}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
