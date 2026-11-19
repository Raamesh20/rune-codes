"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { highlight } from "@/lib/highlight";

const CODE = `def learn_to_code():
    skills = []
    confidence = 0

    while True:
        skills.grow()
        confidence += 1

    # You're amazing!`;

/** Typing terminal showing the illustrative Rune Codes pseudo-code. */
export function Terminal({ className = "" }: { className?: string }) {
  const lines = useMemo(() => highlight(CODE, "python"), []);
  const total = CODE.length;
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer: number | undefined;
    const run = () => {
      if (started.current) return;
      started.current = true;
      if (reduce) { timer = window.setTimeout(() => setN(total), 0); return; }
      let i = 0;
      const step = () => {
        const ch = CODE[i];
        i = Math.min(total, i + 1);
        setN(i);
        if (i < total) timer = window.setTimeout(step, ch === "\n" ? 140 : 26 + ((i * 37) % 30));
      };
      timer = window.setTimeout(step, 1400);
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) run(); }, { threshold: 0.3 });
    io.observe(el);
    return () => { io.disconnect(); if (timer) window.clearTimeout(timer); };
  }, [total]);

  // Slice tokens up to `n` typed characters (computed with a plain loop, outside JSX callbacks).
  const done = n >= total;
  const rendered: { parts: { text: string; cls: string }[]; caret: boolean }[] = [];
  let budget = n;
  for (let li = 0; li < lines.length && budget >= 0; li++) {
    const parts: { text: string; cls: string }[] = [];
    for (const t of lines[li]) {
      if (budget <= 0) break;
      const slice = t.text.slice(0, budget);
      budget -= slice.length;
      parts.push({ text: slice, cls: t.cls });
    }
    const isLast = li === lines.length - 1;
    rendered.push({ parts, caret: (!done && budget === 0) || (done && isLast) });
    budget -= 1; // newline
  }

  return (
    <div ref={ref} className={`glass overflow-hidden rounded-2xl shadow-[0_30px_80px_-30px_rgba(39,216,255,0.35)] ${className}`}>
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-[0.7rem] text-dim">rune_codes.py</span>
        <span className="ml-auto rounded-full border border-white/10 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-dim">pseudo-code</span>
      </div>
      <pre className="code min-h-[15.5rem] px-4 py-3 text-[0.78rem] sm:text-[0.8125rem]" aria-label="Illustrative pseudo-code: learn_to_code, where skills grow and confidence increases in a loop. Comment: You're amazing!">
        <code aria-hidden>
          {rendered.map((line, li) => (
            <span key={li} className="block">
              <span className="mr-4 inline-block w-4 select-none text-right text-dim/50">{li + 1}</span>
              {line.parts.map((p, j) => <span key={j} className={p.cls}>{p.text}</span>)}
              {line.caret && <span className="ml-px inline-block h-[1.05em] w-[0.55em] translate-y-[0.18em] animate-caret bg-cyan" />}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
