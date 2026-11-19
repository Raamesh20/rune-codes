"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

type Props = {
  label: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  id?: string;
  className?: string;
};

/** Section label + heading + subtitle with a masked line-rise reveal. */
export function SectionHeading({ label, title, subtitle, align = "left", id, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top 82%", once: true } });
        tl.from("[data-sh-label]", { opacity: 0, x: -16, duration: 0.6, ease: "power3.out" })
          .from("[data-sh-word]", { yPercent: 110, rotate: 4, duration: 0.9, stagger: 0.06, ease: "expo.out" }, 0.1);
        if (subtitle) tl.from("[data-sh-sub]", { opacity: 0, y: 14, duration: 0.7, ease: "power3.out" }, 0.35);
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [subtitle] },
  );

  return (
    <div ref={ref} className={`${align === "center" ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      <p data-sh-label className={`eyebrow ${align === "center" ? "justify-center" : ""}`}>{label}</p>
      <h2 id={id} className="mt-5 font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
        {title.split(" ").map((w, i) => (
          <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <span data-sh-word className="inline-block">
              {w}
              {i < title.split(" ").length - 1 ? " " : ""}
            </span>
          </span>
        ))}
      </h2>
      {subtitle && (
        <p data-sh-sub className="mt-5 text-base leading-relaxed text-mist sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
