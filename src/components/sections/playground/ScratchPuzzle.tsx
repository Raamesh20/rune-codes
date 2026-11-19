"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Flag, RotateCcw, Star, Trash2, X, CornerUpLeft, CornerUpRight, ArrowUp, Lightbulb } from "lucide-react";
import type { OnResult } from "./types";
import { asset } from "@/lib/site";

type Dir = 0 | 1 | 2 | 3; // N, E, S, W
type Cell = [number, number]; // [col, row]
type Block = { id: number; kind: "move" | "left" | "right"; n: number };

type Level = { start: Cell; dir: Dir; goal: Cell; walls: Cell[]; hint: string };

const SIZE = 5;
const MAX_BLOCKS = 10;
const LEVELS: Level[] = [
  { start: [0, 2], dir: 1, goal: [3, 2], walls: [], hint: "The star is straight ahead. One move block with the right number is enough." },
  { start: [0, 4], dir: 1, goal: [4, 0], walls: [[1, 3], [2, 3], [3, 3], [2, 1]], hint: "Go all the way right first, then turn left to face up." },
  { start: [0, 0], dir: 2, goal: [4, 4], walls: [[1, 0], [1, 1], [1, 2], [3, 1], [3, 2], [3, 3], [3, 4]], hint: "Follow the zig-zag: down, right, up, right, down. Facing down, your left is →." },
];

const DIR_VEC: Record<Dir, Cell> = { 0: [0, -1], 1: [1, 0], 2: [0, 1], 3: [-1, 0] };
const DIR_DEG: Record<Dir, number> = { 0: -90, 1: 0, 2: 90, 3: 180 };

const isWall = (lv: Level, c: number, r: number) => lv.walls.some(([wc, wr]) => wc === c && wr === r);

export function ScratchPuzzle({ onResult }: { onResult: OnResult }) {
  const [level, setLevel] = useState(0);
  const lv = LEVELS[level];
  const [program, setProgram] = useState<Block[]>([]);
  const [pos, setPos] = useState<Cell>(lv.start);
  const [dir, setDir] = useState<Dir>(lv.dir);
  const [running, setRunning] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [bump, setBump] = useState<Cell | null>(null);
  const [solved, setSolved] = useState<boolean[]>(LEVELS.map(() => false));
  const nextId = useRef(1);
  const timers = useRef<number[]>([]);

  const clearTimers = () => { timers.current.forEach((t) => window.clearTimeout(t)); timers.current = []; };
  useEffect(() => clearTimers, []);

  const resetBoard = (l = lv) => { clearTimers(); setRunning(false); setActiveIdx(null); setBump(null); setPos(l.start); setDir(l.dir); };

  const goLevel = (i: number) => { setLevel(i); setProgram([]); resetBoard(LEVELS[i]); };

  const add = (kind: Block["kind"]) => {
    if (running || program.length >= MAX_BLOCKS) return;
    resetBoard();
    setProgram((p) => [...p, { id: nextId.current++, kind, n: 1 }]);
  };
  const remove = (id: number) => { if (running) return; resetBoard(); setProgram((p) => p.filter((b) => b.id !== id)); };
  const cycle = (id: number) => { if (running) return; resetBoard(); setProgram((p) => p.map((b) => (b.id === id ? { ...b, n: (b.n % 4) + 1 } : b))); };

  const run = () => {
    if (running) return;
    if (program.length === 0) { onResult("mistake", "Your program is empty! Add some blocks first, then press the green flag."); return; }
    clearTimers();
    setBump(null);
    // Pre-compute the whole run, then play it back.
    type Ev = { idx: number; pos: Cell; dir: Dir; bump?: Cell };
    const evs: Ev[] = [];
    let p: Cell = [...lv.start];
    let d: Dir = lv.dir;
    let outcome: "goal" | "bump" | "end" = "end";
    let bumpStep = 0;
    outer: for (let i = 0; i < program.length; i++) {
      const b = program[i];
      if (b.kind === "left" || b.kind === "right") {
        d = (((d + (b.kind === "right" ? 1 : 3)) % 4) as Dir);
        evs.push({ idx: i, pos: p, dir: d });
        continue;
      }
      for (let k = 0; k < b.n; k++) {
        const [dx, dy] = DIR_VEC[d];
        const nx = p[0] + dx, ny = p[1] + dy;
        if (nx < 0 || ny < 0 || nx >= SIZE || ny >= SIZE || isWall(lv, nx, ny)) {
          evs.push({ idx: i, pos: p, dir: d, bump: [nx, ny] });
          outcome = "bump"; bumpStep = i + 1;
          break outer;
        }
        p = [nx, ny];
        evs.push({ idx: i, pos: p, dir: d });
        if (p[0] === lv.goal[0] && p[1] === lv.goal[1]) { outcome = "goal"; break outer; }
      }
    }

    setRunning(true);
    setPos(lv.start); setDir(lv.dir);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stepMs = reduce ? 0 : 340;
    evs.forEach((e, i) => {
      timers.current.push(window.setTimeout(() => {
        setActiveIdx(e.idx); setPos(e.pos); setDir(e.dir);
        if (e.bump) setBump(e.bump);
      }, 250 + i * stepMs));
    });
    timers.current.push(window.setTimeout(() => {
      setRunning(false);
      setActiveIdx(null);
      if (outcome === "goal") {
        setSolved((s) => s.map((v, i) => (i === level ? true : v)));
        onResult("success", level < LEVELS.length - 1 ? `Level ${level + 1} complete! You reached the star in ${program.length} block${program.length > 1 ? "s" : ""}.` : "You solved every maze! That's real algorithmic thinking.");
      } else if (outcome === "bump") {
        onResult("mistake", `Bump! Block ${bumpStep} ran into a ${p[0] < 0 || p[1] < 0 ? "edge" : "wall"}. Try turning before that move, or use a smaller number.`);
      } else {
        const dist = Math.abs(p[0] - lv.goal[0]) + Math.abs(p[1] - lv.goal[1]);
        onResult("mistake", `So close! Your program finished ${dist} square${dist > 1 ? "s" : ""} away from the star. Add or adjust a block and try again.`);
      }
    }, 250 + evs.length * stepMs + 200));
  };

  const label = (b: Block) => (b.kind === "move" ? `move ${b.n}` : b.kind === "left" ? "turn left" : "turn right");

  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Board */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex gap-1.5" role="group" aria-label="Choose a level">
            {LEVELS.map((_, i) => (
              <button key={i} type="button" onClick={() => goLevel(i)} aria-pressed={i === level} disabled={running}
                className={`flex h-8 items-center gap-1 rounded-full px-3 font-mono text-xs transition ${i === level ? "bg-blue text-white" : "border border-white/10 text-mist hover:text-snow"}`}>
                L{i + 1}{solved[i] && <Star className="h-3 w-3 fill-[#FFBF00] text-[#FFBF00]" />}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => onResult("info", lv.hint)} className="flex items-center gap-1.5 text-xs text-mist hover:text-cyan">
            <Lightbulb className="h-3.5 w-3.5" /> Hint
          </button>
        </div>
        <div
          className="relative grid aspect-square w-full grid-cols-5 gap-1.5 rounded-2xl bg-[#0a0f1f] p-2 ring-1 ring-white/10"
          role="img"
          aria-label={`Maze level ${level + 1}. The rover is at column ${pos[0] + 1}, row ${pos[1] + 1}. The star is at column ${lv.goal[0] + 1}, row ${lv.goal[1] + 1}.`}
        >
          {Array.from({ length: SIZE * SIZE }).map((_, i) => {
            const c = i % SIZE, r = Math.floor(i / SIZE);
            const wall = isWall(lv, c, r);
            const goal = lv.goal[0] === c && lv.goal[1] === r;
            const bumped = bump && bump[0] === c && bump[1] === r;
            return (
              <div key={i} className={`relative grid place-items-center rounded-lg ${wall ? "bg-[repeating-linear-gradient(45deg,#1b2547,#1b2547_6px,#141c38_6px,#141c38_12px)] ring-1 ring-white/10" : "bg-white/[0.035]"} ${bumped ? "ring-2 ring-err" : ""}`}>
                {goal && <Star className="h-1/2 w-1/2 fill-[#FFBF00] text-[#FFBF00] drop-shadow-[0_0_10px_rgba(255,191,0,0.7)]" />}
              </div>
            );
          })}
          {/* Rover */}
          <div
            aria-hidden
            className="absolute left-2 top-2 transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)]"
            style={{
              width: "calc((100% - 1rem - 4 * 0.375rem) / 5)",
              height: "calc((100% - 1rem - 4 * 0.375rem) / 5)",
              transform: `translate(calc(${pos[0]} * (100% + 0.375rem)), calc(${pos[1]} * (100% + 0.375rem)))`,
            }}
          >
            <div className="relative h-full w-full p-[8%]">
              <Image src={asset("/mascot-face.png")} alt="" width={160} height={160} className="h-full w-full rounded-full ring-2 ring-cyan shadow-[0_0_18px_rgba(39,216,255,0.6)]" />
              <span className="absolute inset-0 transition-transform duration-300" style={{ transform: `rotate(${DIR_DEG[dir]}deg)` }}>
                <span className="absolute right-[-6%] top-1/2 h-0 w-0 -translate-y-1/2 border-y-[6px] border-l-[9px] border-y-transparent border-l-cyan" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Program editor */}
      <div className="flex flex-col gap-3">
        <div>
          <p className="mb-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-dim">Blocks: tap to add</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => add("move")} disabled={running} className="sblock cursor-pointer transition hover:brightness-110" data-cat="motion"><ArrowUp className="h-3.5 w-3.5" /> move</button>
            <button type="button" onClick={() => add("left")} disabled={running} className="sblock cursor-pointer transition hover:brightness-110" data-cat="motion"><CornerUpLeft className="h-3.5 w-3.5" /> turn left</button>
            <button type="button" onClick={() => add("right")} disabled={running} className="sblock cursor-pointer transition hover:brightness-110" data-cat="motion"><CornerUpRight className="h-3.5 w-3.5" /> turn right</button>
          </div>
        </div>

        <div className="min-h-[13rem] flex-1 rounded-2xl bg-[#0f1630] p-3 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <span className="sblock hat" data-cat="events">when <Flag className="h-3.5 w-3.5 fill-[#1d6b1d] text-[#1d6b1d]" /> clicked</span>
            <span className="font-mono text-[0.7rem] text-dim">{program.length}/{MAX_BLOCKS}</span>
          </div>
          <ol className="mt-[3px] flex flex-col items-start gap-[3px]" aria-label="Your program">
            {program.map((b, i) => (
              <li key={b.id} className="sblock pr-1.5" data-cat="motion" data-active={activeIdx === i ? "true" : undefined}>
                <span className="font-mono text-[0.65rem] opacity-70">{i + 1}</span>
                {b.kind === "move" ? (
                  <>
                    move
                    <button type="button" onClick={() => cycle(b.id)} className="slot cursor-pointer hover:bg-cyan/80" aria-label={`Move ${b.n} squares. Click to change.`}>{b.n}</button>
                  </>
                ) : (
                  <>{b.kind === "left" ? <CornerUpLeft className="h-3.5 w-3.5" /> : <CornerUpRight className="h-3.5 w-3.5" />}{label(b)}</>
                )}
                <button type="button" onClick={() => remove(b.id)} aria-label={`Remove block ${i + 1}: ${label(b)}`} className="ml-1 grid h-6 w-6 place-items-center rounded-full bg-black/20 hover:bg-black/40">
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
            {program.length === 0 && <li className="mt-3 text-sm text-dim">Add blocks to guide the rover to the star. Tap a move block&apos;s number to change it.</li>}
          </ol>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={run} disabled={running} className="btn btn-sm bg-[#0fbd8c] text-[#02170f] hover:brightness-110">
            <Flag className="h-3.5 w-3.5 fill-current" /> Run
          </button>
          <button type="button" onClick={() => resetBoard()} disabled={running} className="btn btn-ghost btn-sm"><RotateCcw className="h-3.5 w-3.5" /> Reset rover</button>
          <button type="button" onClick={() => { setProgram([]); resetBoard(); }} disabled={running || !program.length} className="btn btn-ghost btn-sm"><Trash2 className="h-3.5 w-3.5" /> Clear</button>
          {solved[level] && level < LEVELS.length - 1 && (
            <button type="button" onClick={() => goLevel(level + 1)} className="btn btn-primary btn-sm">Next level →</button>
          )}
        </div>
      </div>
    </div>
  );
}
