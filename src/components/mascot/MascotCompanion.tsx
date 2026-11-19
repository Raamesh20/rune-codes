"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { confettiFromElement } from "@/lib/confetti";
import mascotImg from "@/assets/rune-mascot.png";

type Stop = { id: string; side?: "left" | "right"; line?: string; hide?: boolean };

/** Where the travelling mascot docks in each section. Sections with their own mascot hide it. */
const STOPS: Stop[] = [
  { id: "about", side: "right", line: "Curious? That's the best way to start!" },
  { id: "purpose", side: "left", line: "We learn one code block at a time." },
  { id: "programs", side: "right", line: "Pick a program and try its live demo!" },
  { id: "approach", side: "left", line: "Here's how your lessons work." },
  { id: "playground", hide: true },
  { id: "testimonials", side: "right", line: "Hear it from our community!" },
  { id: "contact", hide: true },
];

const W = 84;
const H = Math.round((W * mascotImg.height) / mascotImg.width);
/** Width of the page content (container max 80rem minus its 2rem side padding). */
const CONTENT = 1216;
/** Only appear when the empty margin beside the content can fit the mascot, so it never covers content. */
const MIN_FREE = W + 16;
const freeSpace = () => Math.max(0, (window.innerWidth - CONTENT) / 2);
const xFor = (s: "left" | "right") => {
  const inset = Math.max(4, (freeSpace() - W) / 2);
  return s === "left" ? inset : window.innerWidth - inset - W;
};
const STORE_KEY = "rc-companion-hidden";

/**
 * Desktop companion: once the hero mascot scrolls away, a small Rune hops between
 * the left and right edges as the visitor moves through sections.
 */
export function MascotCompanion() {
  const wrap = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [free, setFree] = useState(0);
  const [heroVisible, setHeroVisible] = useState(true);
  const [stop, setStop] = useState<Stop | null>(null);
  const [line, setLine] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    try { return sessionStorage.getItem(STORE_KEY) === "1"; } catch { return false; }
  });
  const shown = useRef(false);
  const side = useRef<"left" | "right">("right");

  // Only on large screens with a fine pointer; respects a previous dismissal this session.
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => {
      setFree(freeSpace());
      setEnabled(mq.matches && freeSpace() >= MIN_FREE);
    };
    update();
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => { mq.removeEventListener("change", update); window.removeEventListener("resize", update); };
  }, []);

  // Track hero visibility and the current section.
  useEffect(() => {
    const hero = document.getElementById("top");
    const heroIo = new IntersectionObserver(([e]) => setHeroVisible(e.isIntersecting), { threshold: 0.15 });
    if (hero) heroIo.observe(hero);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setStop(STOPS.find((s) => s.id === e.target.id) ?? null);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    STOPS.forEach((s) => { const el = document.getElementById(s.id); if (el) io.observe(el); });
    return () => { heroIo.disconnect(); io.disconnect(); };
  }, []);

  const want = enabled && !dismissed && !heroVisible && !!stop && !stop.hide;
  const targetSide = stop?.side ?? "right";

  // Animate show / hide / hop between sides.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!want) {
      if (shown.current) {
        shown.current = false;
        if (reduce) gsap.set(el, { autoAlpha: 0 });
        else gsap.to(el, { y: H + 60, autoAlpha: 0, duration: 0.5, ease: "power2.in" });
      }
      return;
    }

    let t: number | undefined;
    if (!shown.current) {
      shown.current = true;
      side.current = targetSide;
      gsap.set(el, { x: xFor(targetSide) });
      if (reduce) gsap.set(el, { y: 0, autoAlpha: 1 });
      else gsap.fromTo(el, { y: H + 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: "back.out(1.6)" });
    } else if (side.current !== targetSide) {
      side.current = targetSide;
      if (reduce) gsap.set(el, { x: xFor(targetSide) });
      else {
        // Dip below the screen edge on one side and pop up on the other, so it never crosses the content.
        gsap.timeline()
          .to(el, { scaleY: 0.86, scaleX: 1.08, duration: 0.14, ease: "power2.out", transformOrigin: "50% 100%" })
          .to(el, { y: H + 40, scaleY: 1, scaleX: 1, duration: 0.4, ease: "power2.in" })
          .set(el, { x: xFor(targetSide) })
          .to(el, { y: -18, duration: 0.45, ease: "power2.out" })
          .to(el, { y: 0, duration: 0.25, ease: "power2.in" })
          .to(el, { scaleY: 0.9, scaleX: 1.08, duration: 0.1 })
          .to(el, { scaleY: 1, scaleX: 1, duration: 0.45, ease: "elastic.out(1, 0.45)" });
      }
    }
    if (stop?.line) {
      t = window.setTimeout(() => setLine(stop.line ?? null), reduce ? 0 : 900);
    }
    return () => { if (t) window.clearTimeout(t); };
  }, [want, targetSide, stop]);

  // Keep docked position correct on resize.
  useEffect(() => {
    const onResize = () => {
      if (!wrap.current || !shown.current) return;
      gsap.set(wrap.current, { x: xFor(side.current) });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Idle float.
  useEffect(() => {
    if (!body.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tw = gsap.to(body.current, { y: -8, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
    return () => { tw.kill(); };
  }, []);

  // Hide the line after a while.
  useEffect(() => {
    if (!line) return;
    const t = window.setTimeout(() => setLine(null), 4200);
    return () => window.clearTimeout(t);
  }, [line]);

  const onClick = () => {
    const el = body.current;
    if (!el) return;
    confettiFromElement(el, 50);
    setLine("Keep going, you're doing great!");
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.timeline()
        .to(el, { scaleY: 0.9, scaleX: 1.06, duration: 0.1, transformOrigin: "50% 100%" })
        .to(el, { y: -46, scaleY: 1.06, scaleX: 0.96, duration: 0.28, ease: "power2.out" })
        .to(el, { y: 0, duration: 0.26, ease: "power2.in" })
        .to(el, { scaleY: 1, scaleX: 1, duration: 0.4, ease: "elastic.out(1, 0.45)" });
    }
  };

  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem(STORE_KEY, "1"); } catch { /* storage unavailable */ }
  };

  if (!enabled) return null;

  // Bubble sits above the head and is limited to the free margin width.
  const bubbleW = Math.max(W, Math.floor(free) - 8);
  return (
    <div
      ref={wrap}
      className="pointer-events-none fixed bottom-4 left-0 z-40 invisible opacity-0"
      style={{ width: W, height: H }}
      aria-hidden={!want || undefined}
    >
      <div ref={body} className="relative h-full w-full">
        <div aria-hidden className="absolute bottom-[-2px] left-1/2 h-3 w-[70%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(39,216,255,0.5),transparent)]" />
        <button type="button" onClick={onClick} aria-label="Rune, the Rune Codes mascot. Click for encouragement." className="pointer-events-auto relative block h-full w-full rounded-2xl">
          <Image src={mascotImg} alt="" sizes={`${W}px`} className="h-full w-full object-contain drop-shadow-[0_10px_20px_rgba(7,11,20,0.7)]" />
        </button>
        <button type="button" onClick={dismiss} aria-label="Hide the mascot companion" className="pointer-events-auto absolute -top-1 right-0 grid h-6 w-6 place-items-center rounded-full border border-white/15 bg-navy text-mist hover:text-snow">
          <X className="h-3 w-3" />
        </button>
        <div aria-live="polite" className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2" style={{ width: bubbleW }}>
          {line && (
            <p key={line} className="glass mx-auto w-max max-w-full animate-[bubble-in_.35s_cubic-bezier(.34,1.56,.64,1)] rounded-2xl px-3 py-2 text-center text-[0.75rem] font-medium leading-snug text-snow shadow-[0_12px_40px_-12px_rgba(66,133,255,0.6)]">
              {line}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
