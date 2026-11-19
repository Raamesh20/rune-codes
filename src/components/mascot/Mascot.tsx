"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { confettiFromElement } from "@/lib/confetti";
import mascotImg from "@/assets/rune-mascot.png";

export type MascotPose = "greet" | "point" | "celebrate" | "wave" | "idle";
export type MascotMood = "idle" | "celebrate" | "oops" | "think";

type Props = {
  pose?: MascotPose;
  /** Mood changes trigger a one-off reaction. Change `reactionKey` to replay the same mood. */
  mood?: MascotMood;
  reactionKey?: number;
  message?: string | null;
  /** Tilt toward the pointer and react to clicks. */
  interactive?: boolean;
  /** Where the speech bubble sits relative to the character. */
  bubbleSide?: "left" | "right" | "top";
  priority?: boolean;
  className?: string;
  sizes?: string;
  /** Decorative instances are hidden from assistive tech (message bubbles stay announced). */
  decorative?: boolean;
};

const CLICK_LINES = [
  "Hi there! I'm the Rune Codes mascot.",
  "Every expert was once a beginner.",
  "Loops, logic, launch!",
  "Bugs are just puzzles in disguise.",
  "Ready to write your first line of code?",
];

export function Mascot({
  pose = "idle",
  mood = "idle",
  reactionKey = 0,
  message,
  interactive = false,
  bubbleSide = "left",
  priority = false,
  className = "",
  sizes = "(min-width: 1024px) 420px, 60vw",
  decorative = false,
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const [clickLine, setClickLine] = useState<string | null>(null);
  const clickCount = useRef(0);

  // Entrance + idle loop (float, breathe, sway). Skipped entirely for reduced motion.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const el = body.current!;
        const sh = shadow.current!;
        const enter = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
        });
        enter
          .fromTo(el, { y: 70, scale: 0.86, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 1.1, ease: "back.out(1.6)" })
          .fromTo(sh, { scaleX: 0.3, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.9, ease: "power3.out" }, 0.15);

        if (pose === "greet" || pose === "wave") {
          enter.to(el, { rotation: -4, duration: 0.25, ease: "sine.inOut", yoyo: true, repeat: 3, transformOrigin: "50% 95%" }, ">-0.2");
        }
        if (pose === "point") {
          enter.to(el, { rotation: 3, x: 8, duration: 0.6, ease: "power2.out", transformOrigin: "50% 95%" }, ">-0.3");
        }

        // Idle: gentle float with synchronized ground shadow, plus breathing.
        gsap.to(el, { y: -12, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.2 });
        gsap.to(sh, { scaleX: 0.82, opacity: 0.55, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.2 });
        gsap.to(el.querySelector("[data-breathe]"), {
          scaleY: 1.014, scaleX: 0.994, duration: 1.9, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 100%",
        });
        if (pose === "wave") {
          gsap.to(el.querySelector("[data-wave]"), { rotation: 18, duration: 0.45, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "80% 90%" });
        }
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [pose] },
  );

  // Pointer tilt for interactive instances (desktop pointers only).
  useEffect(() => {
    if (!interactive) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce || !tilt.current) return;
    const rx = gsap.quickTo(tilt.current, "rotationX", { duration: 0.8, ease: "power3.out" });
    const ry = gsap.quickTo(tilt.current, "rotationY", { duration: 0.8, ease: "power3.out" });
    const tx = gsap.quickTo(tilt.current, "x", { duration: 1, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      const r = tilt.current?.getBoundingClientRect();
      if (!r) return;
      const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      ry(gsap.utils.clamp(-10, 10, dx * 22));
      rx(gsap.utils.clamp(-7, 7, -dy * 14));
      tx(gsap.utils.clamp(-14, 14, dx * 30));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [interactive]);

  // Mood reactions.
  useEffect(() => {
    const el = body.current;
    if (!el || mood === "idle") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (mood === "celebrate") confettiFromElement(el, 110);
    if (reduce) return;
    const tl = gsap.timeline();
    if (mood === "celebrate") {
      tl.to(el, { y: -60, scaleY: 1.06, scaleX: 0.96, duration: 0.32, ease: "power2.out" })
        .to(el, { y: 0, scaleY: 0.92, scaleX: 1.06, duration: 0.28, ease: "power2.in" })
        .to(el, { y: -34, scaleY: 1.04, scaleX: 0.97, rotation: 6, duration: 0.26, ease: "power2.out" })
        .to(el, { y: 0, scaleY: 1, scaleX: 1, rotation: 0, duration: 0.5, ease: "bounce.out" });
    } else if (mood === "oops") {
      tl.to(el, { rotation: -5, duration: 0.12, transformOrigin: "50% 95%" })
        .to(el, { rotation: 4, duration: 0.14, repeat: 2, yoyo: true })
        .to(el, { rotation: 0, duration: 0.3, ease: "elastic.out(1, 0.4)" });
    } else if (mood === "think") {
      tl.to(el, { rotation: -3, x: -4, duration: 0.5, ease: "sine.inOut", transformOrigin: "50% 95%" })
        .to(el, { rotation: 0, x: 0, duration: 0.6, ease: "sine.inOut" }, "+=0.6");
    }
    return () => { tl.kill(); };
  }, [mood, reactionKey]);

  // Click / tap: hop + a friendly line + a small confetti pop.
  const onActivate = () => {
    const el = body.current;
    if (!el) return;
    const line = CLICK_LINES[clickCount.current % CLICK_LINES.length];
    clickCount.current += 1;
    setClickLine(line);
    confettiFromElement(el, 40);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      gsap.timeline()
        .to(el, { y: -42, scaleY: 1.05, scaleX: 0.96, duration: 0.25, ease: "power2.out" })
        .to(el, { y: 0, scaleY: 0.94, scaleX: 1.05, duration: 0.22, ease: "power2.in" })
        .to(el, { scaleY: 1, scaleX: 1, duration: 0.4, ease: "elastic.out(1, 0.45)" });
    }
  };

  // Clear the click line after a while (timer callback, not synchronous in effect).
  useEffect(() => {
    if (!clickLine) return;
    const t = window.setTimeout(() => setClickLine(null), 3200);
    return () => window.clearTimeout(t);
  }, [clickLine]);

  const bubble = clickLine ?? message ?? null;

  const bubblePos =
    bubbleSide === "left"
      ? "left-1/2 -top-6 -translate-x-1/2 origin-bottom lg:left-auto lg:right-[78%] lg:top-[14%] lg:translate-x-0 lg:origin-bottom-right"
      : bubbleSide === "right"
        ? "left-[78%] top-[14%] origin-bottom-left"
        : "left-1/2 -top-4 -translate-x-1/2 origin-bottom";

  const figure = (
    <div ref={tilt} className="relative h-full w-full [transform-style:preserve-3d]">
      <div ref={body} className="relative h-full w-full will-change-transform">
        <div data-breathe className="relative h-full w-full">
          <Image
            src={mascotImg}
            alt={decorative ? "" : "Rune Codes mascot: a friendly grey wolf in round glasses and a Rune Codes hoodie, giving a thumbs-up and holding a tablet"}
            priority={priority}
            sizes={sizes}
            draggable={false}
            className="pointer-events-none h-full w-full select-none object-contain drop-shadow-[0_30px_40px_rgba(7,11,20,0.65)]"
          />
          {pose === "wave" && (
            <span data-wave aria-hidden className="absolute left-[4%] top-[30%] block h-[16%] w-[22%]">
              <svg viewBox="0 0 60 50" className="h-full w-full overflow-visible">
                <path d="M8 30 Q2 18 10 6" stroke="#27D8FF" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9" />
                <path d="M18 34 Q10 20 18 4" stroke="#4285FF" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div ref={root} className={`relative h-full w-full [perspective:1200px] ${className}`}>
      {/* back glow */}
      <div aria-hidden className="pointer-events-none absolute inset-x-[10%] top-[12%] bottom-[18%] rounded-full bg-[radial-gradient(closest-side,rgba(66,133,255,0.45),rgba(139,92,246,0.18)_55%,transparent)] blur-2xl" />
      {/* ground shadow */}
      <div ref={shadow} aria-hidden className="pointer-events-none absolute bottom-[1%] left-1/2 h-[5%] w-[56%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(39,216,255,0.45),rgba(66,133,255,0.15)_60%,transparent)] blur-[2px]" />

      {interactive ? (
        <button
          type="button"
          onClick={onActivate}
          aria-label="Say hi to the Rune Codes mascot"
          className="relative block h-full w-full cursor-pointer rounded-[2rem]"
        >
          {figure}
        </button>
      ) : (
        <div className="relative h-full w-full" aria-hidden={decorative || undefined}>{figure}</div>
      )}

      <div aria-live="polite" className={`absolute z-10 ${bubblePos}`}>
        <AnimatePresence mode="wait">
          {bubble && (
            <motion.p
              key={bubble}
              initial={{ opacity: 0, scale: 0.7, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -4 }}
              transition={{ type: "spring", stiffness: 380, damping: 24 }}
              className="glass w-max max-w-[15rem] rounded-2xl px-4 py-2.5 text-sm font-medium leading-snug text-snow shadow-[0_12px_40px_-12px_rgba(66,133,255,0.6)]"
            >
              {bubble}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
