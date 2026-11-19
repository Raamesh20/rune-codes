"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";

/** Round trig output so server and client render identical attribute strings. */
const r2 = (n: number) => Math.round(n * 100) / 100;

const loop = (reduce: boolean | null, t: object) => (reduce ? { duration: 0 } : t);

export function SparkVisual() {
  const reduce = useReducedMotion();
  const words = ["why?", "how?", "what if?", "let's try!"];
  return (
    <svg viewBox="0 0 320 240" className="h-full w-full" role="img" aria-label="Questions orbit a glowing spark, turning curiosity into ideas">
      <defs>
        <radialGradient id="spark-core" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.35" stopColor="#27D8FF" />
          <stop offset="1" stopColor="#4285FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const x1 = r2(160 + Math.cos(a) * 34), y1 = r2(120 + Math.sin(a) * 34);
        const x2 = r2(160 + Math.cos(a) * 74), y2 = r2(120 + Math.sin(a) * 74);
        return (
          <motion.line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i % 3 ? "#4285FF" : "#27D8FF"} strokeWidth="2" strokeLinecap="round"
            initial={{ pathLength: 0.2, opacity: 0.3 }}
            animate={reduce ? { pathLength: 1, opacity: 0.8 } : { pathLength: [0.2, 1, 0.2], opacity: [0.3, 1, 0.3] }}
            transition={loop(reduce, { duration: 2.2, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" })} />
        );
      })}
      <motion.circle cx="160" cy="120" r="44" fill="url(#spark-core)"
        animate={reduce ? {} : { r: [40, 48, 40] }} transition={loop(reduce, { duration: 2.4, repeat: Infinity, ease: "easeInOut" })} />
      <circle cx="160" cy="120" r="14" fill="#fff" />
      {words.map((w, i) => {
        const a = (i / words.length) * Math.PI * 2 - Math.PI / 4;
        const cx = r2(160 + Math.cos(a) * 112), cy = r2(120 + Math.sin(a) * 92);
        const dx = r2(Math.cos(a) * 6), dy = r2(Math.sin(a) * 6);
        return (
          <motion.g key={w}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1, x: reduce ? 0 : [0, dx, 0], y: reduce ? 0 : [0, dy, 0] }}
            transition={{ opacity: { delay: 0.2 + i * 0.15 }, scale: { delay: 0.2 + i * 0.15 }, x: loop(reduce, { duration: 3, repeat: Infinity, ease: "easeInOut" }), y: loop(reduce, { duration: 3, repeat: Infinity, ease: "easeInOut" }) }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}>
            <rect x={r2(cx - 46)} y={r2(cy - 14)} width="92" height="28" rx="14" fill="#111a33" stroke="rgba(148,163,184,.3)" />
            <text x={cx} y={r2(cy + 4)} textAnchor="middle" fontSize="11" fontFamily="var(--font-geist-mono), monospace" fill={i === 3 ? "#27D8FF" : "#cbd5e1"}>{w}</text>
          </motion.g>
        );
      })}
    </svg>
  );
}

export function ConfidenceVisual() {
  const reduce = useReducedMotion();
  const steps = [22, 38, 56, 78, 100];
  return (
    <div className="flex h-full w-full flex-col justify-end px-6 pb-6 pt-10" role="img" aria-label="Five rising steps showing confidence growing with each lesson">
      <div className="relative flex h-full items-end gap-3 sm:gap-4">
        {steps.map((h, i) => (
          <div key={i} className="relative flex h-full flex-1 flex-col items-center justify-end">
            <motion.div
              className="w-full rounded-t-xl bg-gradient-to-t from-blue/30 to-cyan/80 shadow-[0_0_30px_-6px_rgba(39,216,255,0.6)]"
              initial={{ height: reduce ? `${h}%` : "0%" }}
              animate={{ height: `${h}%` }}
              transition={{ delay: reduce ? 0 : 0.15 + i * 0.14, duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
            <span className="mt-2 font-mono text-[0.65rem] text-dim">L{i + 1}</span>
            {i === steps.length - 1 && (
              <motion.span
                className="absolute grid h-9 w-9 place-items-center rounded-full bg-ok text-ink shadow-[0_0_24px_rgba(52,211,153,0.7)]"
                style={{ bottom: `calc(${h}% + 0.5rem)` }}
                initial={{ scale: reduce ? 1 : 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: reduce ? 0 : 1, type: "spring", stiffness: 400, damping: 14 }}
              >
                <Check className="h-5 w-5" strokeWidth={3} />
              </motion.span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CreateVisual() {
  const reduce = useReducedMotion();
  const lines = [
    { code: "draw(circle, blue)", shape: <circle cx="70" cy="70" r="34" fill="#4285FF" /> },
    { code: "draw(square, violet)", shape: <rect x="120" y="40" width="62" height="62" rx="8" fill="#8B5CF6" /> },
    { code: "draw(triangle, cyan)", shape: <path d="M60 190 L100 122 L140 190 Z" fill="#27D8FF" /> },
    { code: "add(star)", shape: <path d="M160 128 l9 19 21 3-15 15 4 21-19-10-19 10 4-21-15-15 21-3z" fill="#F8FAFC" /> },
  ];
  return (
    <div className="grid h-full w-full grid-cols-2 items-center gap-4 p-5" role="img" aria-label="Lines of code turn into shapes on a canvas">
      <div className="code space-y-2 text-[0.72rem] sm:text-xs">
        {lines.map((l, i) => (
          <motion.div key={l.code} initial={{ opacity: reduce ? 1 : 0, x: reduce ? 0 : -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduce ? 0 : 0.2 + i * 0.45, duration: 0.4 }}
            className="rounded-md bg-white/[0.04] px-2 py-1.5">
            <span className="text-dim">{i + 1} </span><span className="tok-fn">{l.code.split("(")[0]}</span>
            <span className="text-mist">({l.code.split("(")[1]}</span>
          </motion.div>
        ))}
      </div>
      <svg viewBox="0 0 220 220" className="h-full max-h-56 w-full rounded-xl bg-white/[0.03] ring-1 ring-white/10">
        {lines.map((l, i) => (
          <motion.g key={l.code} initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.4 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduce ? 0 : 0.45 + i * 0.45, type: "spring", stiffness: 260, damping: 16 }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}>
            {l.shape}
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

type Ball = { id: number; x: number; color: string; h: number };
const BALL_COLORS = ["#4285FF", "#27D8FF", "#8B5CF6", "#FFBF00", "#34D399"];

export function FunVisual() {
  const reduce = useReducedMotion();
  const [balls, setBalls] = useState<Ball[]>([
    { id: 1, x: 22, color: "#4285FF", h: 70 },
    { id: 2, x: 52, color: "#27D8FF", h: 50 },
    { id: 3, x: 78, color: "#8B5CF6", h: 80 },
  ]);
  const add = () =>
    setBalls((b) => {
      const id = (b[b.length - 1]?.id ?? 0) + 1;
      const next = [...b, { id, x: 10 + ((id * 23) % 80), color: BALL_COLORS[id % BALL_COLORS.length], h: 40 + ((id * 17) % 45) }];
      return next.slice(-8);
    });
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-x-6 bottom-6 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      {balls.map((b) => (
        <motion.span
          key={b.id}
          className="absolute bottom-6 h-9 w-9 -translate-x-1/2 rounded-full"
          style={{ left: `${b.x}%`, background: `radial-gradient(circle at 30% 30%, #fff, ${b.color} 45%, ${b.color})`, boxShadow: `0 0 24px ${b.color}` }}
          initial={{ y: reduce ? 0 : -200, opacity: 0 }}
          animate={reduce ? { y: 0, opacity: 1 } : { y: [0, -b.h * 2, 0], scaleY: [0.85, 1.05, 0.85], opacity: 1 }}
          transition={reduce ? { duration: 0 } : { duration: 0.9 + b.h / 140, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 1] }}
        />
      ))}
      <button type="button" onClick={add} className="btn btn-ghost btn-sm absolute right-4 top-4">
        Add a ball
      </button>
      <p className="absolute left-5 top-5 font-mono text-[0.7rem] text-dim">bouncing_ball.sb3</p>
    </div>
  );
}
