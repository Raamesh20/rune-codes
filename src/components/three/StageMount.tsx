"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Mascot } from "@/components/mascot/Mascot";
import mascotImg from "@/assets/rune-mascot.png";

const MascotStage = dynamic(() => import("./MascotStage"), { ssr: false, loading: () => null });

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Hero mascot. The original 2D artwork renders immediately (fast first paint, no-JS and fallback).
 * When WebGL works and motion is allowed, the 3D stage loads in the background and cross-fades in.
 * If the device can't keep a smooth frame rate, it falls back to the 2D character.
 */
export function StageMount() {
  const ref = useRef<HTMLDivElement>(null);
  const [use3d, setUse3d] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const [compact, setCompact] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.matchMedia("(max-width: 1023px)");
    const evaluate = () => {
      setCompact(small.matches);
      setUse3d(!reduce.matches && webglAvailable());
    };
    const hasIdle = typeof window.requestIdleCallback === "function";
    const id = hasIdle ? window.requestIdleCallback(evaluate, { timeout: 1200 }) : window.setTimeout(evaluate, 500);
    reduce.addEventListener("change", evaluate);
    small.addEventListener("change", evaluate);
    return () => {
      if (hasIdle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
      reduce.removeEventListener("change", evaluate);
      small.removeEventListener("change", evaluate);
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    const onVis = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  const onReady = useCallback(() => setReady(true), []);
  const onSlow = useCallback(() => {
    // `?force3d` keeps the 3D stage on for testing on throttled/preview browsers.
    if (new URLSearchParams(window.location.search).has("force3d")) return;
    setUse3d(false);
    setReady(false);
  }, []);
  const show3d = use3d && ready;

  return (
    <div ref={ref} className={`relative h-full w-full ${hover ? "cursor-pointer" : ""}`}>
      {/* 2D original artwork, positioned to match the 3D character exactly */}
      <div
        inert={show3d}
        aria-hidden={show3d || undefined}
        className={`absolute left-1/2 top-[53%] h-[66%] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700 lg:left-[67%] lg:h-[60%] ${show3d ? "pointer-events-none opacity-0" : "opacity-100"}`}
        style={{ aspectRatio: `${mascotImg.width} / ${mascotImg.height}` }}
      >
        <Mascot pose="greet" interactive priority bubbleSide="top" message="Hi! Ready to build something amazing?" sizes="(min-width: 1024px) 420px, 70vw" />
      </div>

      {use3d && (
        <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }}>
          <MascotStage
            src={mascotImg.src}
            aspect={mascotImg.width / mascotImg.height}
            compact={compact}
            active={visible}
            onReady={onReady}
            onSlow={onSlow}
            onHover={setHover}
          />
        </div>
      )}
    </div>
  );
}
