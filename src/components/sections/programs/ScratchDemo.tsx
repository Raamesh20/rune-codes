"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Flag, RotateCcw } from "lucide-react";
import { Stepper } from "@/components/ui/Stepper";

const W = 320;
const H = 230;
const PAD = 22;

const PRESETS = [
  { name: "Square", repeat: 4, turn: 90, steps: 90 },
  { name: "Hexagon", repeat: 6, turn: 60, steps: 60 },
  { name: "Star", repeat: 5, turn: 144, steps: 120 },
  { name: "Spiral-ish", repeat: 12, turn: 100, steps: 80 },
];

const POLY: Record<number, string> = { 3: "triangle", 4: "square", 5: "pentagon", 6: "hexagon", 7: "heptagon", 8: "octagon", 9: "nonagon", 10: "decagon", 12: "dodecagon" };

function describe(repeat: number, turn: number) {
  const total = repeat * turn;
  if (total % 360 !== 0) return `The turns add up to ${total}°, not a multiple of 360°, so the path doesn't close. Try changing the turn.`;
  if (total === 360) return `Perfect! ${repeat} × ${turn}° = 360°, so you drew a ${POLY[repeat] ?? `${repeat}-sided shape`}.`;
  return `${repeat} × ${turn}° = ${total}°. The sprite circled ${total / 360} times and drew a star pattern!`;
}

/** Compute the pen path, then fit it neatly into the stage. */
function computePath(repeat: number, steps: number, turn: number) {
  const pts: { x: number; y: number; dir: number }[] = [{ x: 0, y: 0, dir: 0 }];
  let x = 0, y = 0, dir = 0; // dir 0 = pointing right (Scratch direction 90)
  for (let i = 0; i < repeat; i++) {
    x += Math.cos((dir * Math.PI) / 180) * steps;
    y += Math.sin((dir * Math.PI) / 180) * steps;
    dir += turn; // turn clockwise (screen y points down)
    pts.push({ x, y, dir });
  }
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const s = Math.min(1, (W - PAD * 2) / Math.max(1, maxX - minX), (H - PAD * 2) / Math.max(1, maxY - minY));
  const ox = (W - (maxX - minX) * s) / 2 - minX * s;
  const oy = (H - (maxY - minY) * s) / 2 - minY * s;
  const r2 = (n: number) => Math.round(n * 100) / 100; // identical SSR + client output
  return { pts: pts.map((p) => ({ x: r2(p.x * s + ox), y: r2(p.y * s + oy), dir: p.dir })), scaled: s < 1 };
}

export function ScratchDemo() {
  const [repeat, setRepeat] = useState(6);
  const [steps, setSteps] = useState(60);
  const [turn, setTurn] = useState(60);
  const [progress, setProgress] = useState<number | null>(null); // segments drawn (fractional)
  const raf = useRef<number | null>(null);

  const path = useMemo(() => computePath(repeat, steps, turn), [repeat, steps, turn]);
  const running = progress !== null && progress < repeat;
  const finished = progress !== null && progress >= repeat;

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  const stop = () => { if (raf.current) cancelAnimationFrame(raf.current); raf.current = null; };

  const run = () => {
    stop();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setProgress(repeat); return; }
    const per = Math.max(180, Math.min(520, 3200 / repeat));
    let t0 = -1;
    const tick = (now: number) => {
      if (t0 < 0) t0 = now;
      const p = Math.min(repeat, (now - t0) / per);
      setProgress(p);
      if (p < repeat) raf.current = requestAnimationFrame(tick);
      else raf.current = null;
    };
    raf.current = requestAnimationFrame(tick);
  };

  const reset = () => { stop(); setProgress(null); };

  // Build the visible polyline up to `progress`.
  const p = progress ?? 0;
  const whole = Math.floor(p);
  const frac = p - whole;
  const visible = path.pts.slice(0, whole + 1);
  let head = path.pts[Math.min(whole, path.pts.length - 1)];
  if (whole < repeat && frac > 0) {
    const a = path.pts[whole], b = path.pts[whole + 1];
    head = { x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac, dir: a.dir };
    visible.push(head);
  }
  const headDir = finished ? path.pts[path.pts.length - 1].dir : head.dir;
  const activeBlock = !running ? null : frac < 0.85 ? "move" : "turn";

  return (
    <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:p-5">
      {/* Block workspace */}
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl bg-[#0f1630] p-4 ring-1 ring-white/10" aria-label="Scratch program" role="group">
          <div className="flex flex-col items-start gap-[3px]">
            <div className="sblock hat" data-cat="events" data-active={running ? "true" : undefined}>
              when <Flag className="h-3.5 w-3.5 fill-[#1d6b1d] text-[#1d6b1d]" /> clicked
            </div>
            <div className="sblock" data-cat="pen">pen down</div>
            <div className="sblock c-top" data-cat="control">repeat <span className="slot">{repeat}</span></div>
            <div className="ml-4 flex flex-col items-start gap-[3px] border-l-[14px] border-[#ffab19] pl-1">
              <div className="sblock" data-cat="motion" data-active={activeBlock === "move" ? "true" : undefined}>move <span className="slot">{steps}</span> steps</div>
              <div className="sblock" data-cat="motion" data-active={activeBlock === "turn" ? "true" : undefined}>turn ↻ <span className="slot">{turn}</span> degrees</div>
            </div>
            <div className="h-3 w-24 rounded-b-md bg-[#ffab19]" />
          </div>
        </div>
        <div className="space-y-2.5 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <Stepper label="repeat" value={repeat} min={3} max={12} onChange={(v) => { reset(); setRepeat(v); }} />
          <Stepper label="move steps" value={steps} min={30} max={140} step={10} onChange={(v) => { reset(); setSteps(v); }} />
          <Stepper label="turn degrees" value={turn} min={15} max={180} step={1} suffix="°" onChange={(v) => { reset(); setTurn(v); }} />
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((pr) => (
            <button
              key={pr.name}
              type="button"
              onClick={() => { stop(); setProgress(null); setRepeat(pr.repeat); setTurn(pr.turn); setSteps(pr.steps); }}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-mist transition hover:border-violet/60 hover:text-snow"
            >
              {pr.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stage */}
      <div className="flex flex-col gap-3">
        <div className="relative overflow-hidden rounded-2xl bg-[#f6f8ff] ring-1 ring-white/10">
          <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={finished ? describe(repeat, turn) : "Scratch stage with the sprite ready to draw"}>
            <defs>
              <pattern id="stage-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M20 0H0V20" fill="none" stroke="#e3e8f5" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width={W} height={H} fill="url(#stage-grid)" />
            {visible.length > 1 && (
              <polyline points={visible.map((q) => `${q.x},${q.y}`).join(" ")} fill="none" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            )}
            <g transform={`translate(${progress === null ? path.pts[0].x : head.x} ${progress === null ? path.pts[0].y : head.y}) rotate(${progress === null ? 0 : headDir})`}>
              <circle r="13" fill="#4285FF" stroke="#fff" strokeWidth="3" />
              <path d="M2 -6 L10 0 L2 6 Z" fill="#fff" />
            </g>
          </svg>
          <div className="absolute right-3 top-3 flex gap-2">
            <button type="button" onClick={run} aria-label="Run program (green flag)" className="grid h-10 w-10 place-items-center rounded-full bg-[#0fbd8c] text-white shadow-lg transition hover:scale-105">
              <Flag className="h-4 w-4 fill-white" />
            </button>
            <button type="button" onClick={reset} aria-label="Clear stage" className="grid h-10 w-10 place-items-center rounded-full bg-[#1c2333] text-white shadow-lg transition hover:scale-105">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p aria-live="polite" className="min-h-[3rem] text-sm leading-relaxed text-mist">
          {finished
            ? describe(repeat, turn)
            : running
              ? "Running… watch which block lights up."
              : "Change the numbers, then press the green flag to run your program."}
          {finished && path.scaled && <span className="block text-xs text-dim">(The stage zoomed out so the whole drawing fits.)</span>}
        </p>
      </div>
    </div>
  );
}
