"use client";

import { useRef } from "react";
import { Award, CalendarClock, ChartLine, Heart, MonitorPlay, Wrench, Gamepad2, ClipboardCheck, Tent, Trophy } from "lucide-react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS = [
  { title: "1-on-1 Online Lessons", body: "Tailored to each student's pace and learning level.", Icon: MonitorPlay, tag: "learn" },
  { title: "Hands-on Projects", body: "Mini projects, challenges, and guided exercises.", Icon: Wrench, tag: "build" },
  { title: "Progress Tracking", body: "Personalized feedback and development monitoring.", Icon: ChartLine, tag: "grow" },
  { title: "Certificates", body: "Completion certificates after each program.", Icon: Award, tag: "achieve" },
  { title: "Passionate Tutors", body: "Experienced with teaching young learners.", Icon: Heart, tag: "guide" },
  { title: "Flexible Schedule", body: "Curriculum adapted for different age groups.", Icon: CalendarClock, tag: "fit" },
];

const BENEFITS = [
  { text: "Project-based and gamified learning", Icon: Gamepad2 },
  { text: "Class-based progress reports for parents", Icon: ClipboardCheck },
  { text: "Holiday camps and workshops", Icon: Tent },
  { text: "Competition preparation", Icon: Trophy },
];

export function Approach() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // The journey line draws as you scroll; each stop lights up when the line reaches it.
        gsap.fromTo("[data-journey-line]", { scaleY: 0 }, {
          scaleY: 1, ease: "none", transformOrigin: "top center",
          scrollTrigger: { trigger: "[data-journey]", start: "top 70%", end: "bottom 60%", scrub: 0.5 },
        });
        gsap.utils.toArray<HTMLElement>("[data-stop]").forEach((el) => {
          const dir = el.dataset.side === "right" ? 60 : -60;
          gsap.from(el.querySelector("[data-stop-card]"), {
            opacity: 0, x: window.innerWidth >= 768 ? dir : 30, duration: 1, ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 78%", once: true },
          });
          gsap.fromTo(el.querySelector("[data-stop-node]"),
            { scale: 0.4, backgroundColor: "#0C1224" },
            { scale: 1, backgroundColor: "#4285FF", duration: 0.6, ease: "back.out(3)", scrollTrigger: { trigger: el, start: "top 65%", toggleActions: "play none none reverse" } });
        });
        gsap.from("[data-benefit]", {
          opacity: 0, y: 30, stagger: 0.1, duration: 0.9, ease: "expo.out",
          scrollTrigger: { trigger: "[data-benefits]", start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="approach" aria-labelledby="approach-title" className="relative overflow-hidden section-y">
      <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:linear-gradient(transparent,#000_20%,#000_80%,transparent)]" />
      <div className="container-x">
        <SectionHeading id="approach-title" label="Our approach" title="How We Teach" subtitle="Personalized learning experience designed for every student's success." align="center" />

        <ol data-journey className="section-gap relative mx-auto max-w-5xl">
          {/* track */}
          <span aria-hidden className="absolute bottom-6 left-[1.375rem] top-6 w-px bg-white/10 md:left-1/2 md:-translate-x-1/2" />
          <span aria-hidden data-journey-line className="absolute bottom-6 left-[1.375rem] top-6 w-[2px] bg-gradient-to-b from-cyan via-blue to-violet shadow-[0_0_14px_rgba(39,216,255,0.6)] md:left-1/2 md:-translate-x-1/2" />

          {STEPS.map((s, i) => {
            const right = i % 2 === 1;
            return (
              <li key={s.title} data-stop data-side={right ? "right" : "left"} className="relative grid grid-cols-[2.75rem_1fr] gap-5 pb-10 last:pb-0 md:grid-cols-[1fr_3.5rem_1fr] md:gap-8 md:pb-14">
                <div className={`hidden md:block ${right ? "md:order-1" : "md:order-3"}`} />
                <div className="relative z-10 flex justify-center md:order-2">
                  <span data-stop-node className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-blue text-snow shadow-[0_0_0_6px_rgba(7,11,20,1)]">
                    <s.Icon className="h-5 w-5" />
                  </span>
                </div>
                <div data-stop-card className={`${right ? "md:order-3" : "md:order-1 md:text-right"}`}>
                  <div className="depth depth-hover group relative rounded-2xl border border-white/10 bg-navy/70 p-5 transition-colors duration-300 hover:border-cyan/40 sm:p-6">
                    <p className={`font-mono text-[0.68rem] uppercase tracking-[0.2em] text-cyan`}>
                      Step {String(i + 1).padStart(2, "0")} · {s.tag}
                    </p>
                    <h3 className="mt-2 font-display text-xl font-semibold tracking-tight sm:text-2xl">{s.title}</h3>
                    <p className="mt-2 leading-relaxed text-mist">{s.body}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div data-benefits className="mx-auto mt-20 max-w-5xl">
          <p className="text-center font-mono text-xs uppercase tracking-[0.22em] text-dim">Additional benefits</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <li key={b.text} data-benefit className="flex items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet/15 text-violet">
                  <b.Icon className="h-5 w-5" />
                </span>
                <span className="font-medium">{b.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
