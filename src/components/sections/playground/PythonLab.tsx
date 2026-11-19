"use client";

import { useState, type ReactNode } from "react";
import { Play, Star } from "lucide-react";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Stepper } from "@/components/ui/Stepper";
import type { OnResult } from "./types";

type Values = { a: number; b: string | number };

type Level = {
  title: string;
  goal: string;
  initial: Values;
  code: (v: Values) => string;
  run: (v: Values) => string[];
  target: string[];
  controls: (v: Values, set: (v: Values) => void) => ReactNode;
  feedback: (v: Values) => string;
};

const SYMBOLS = ["*", "#", "@"];

function Choice({ label, options, value, onChange }: { label: string; options: (string | number)[]; value: string | number; onChange: (v: string | number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-mist">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-full border border-white/10 bg-ink/60 p-1">
        {options.map((o) => (
          <button key={String(o)} type="button" role="radio" aria-checked={o === value} onClick={() => onChange(o)}
            className={`min-w-9 rounded-full px-3 py-1 font-mono text-sm transition ${o === value ? "bg-cyan/20 text-cyan" : "text-mist hover:text-snow"}`}>
            {String(o)}
          </button>
        ))}
      </div>
    </div>
  );
}

const LEVELS: Level[] = [
  {
    title: "Line of stars",
    goal: "Print a line of exactly 8 stars: ********",
    initial: { a: 3, b: "#" },
    code: (v) => `symbol = "${v.b}"\ncount = ${v.a}\n\nprint(symbol * count)`,
    run: (v) => [String(v.b).repeat(v.a)],
    target: ["********"],
    controls: (v, set) => (
      <>
        <Stepper label="count" value={v.a} min={1} max={12} onChange={(a) => set({ ...v, a })} />
        <Choice label="symbol" options={SYMBOLS} value={v.b} onChange={(b) => set({ ...v, b })} />
      </>
    ),
    feedback: (v) =>
      v.a !== 8
        ? `Your line has ${v.a} symbol${v.a > 1 ? "s" : ""}, but the target has 8. Multiplying a string repeats it, so change count.`
        : `Right length! Now check which symbol the target uses.`,
  },
  {
    title: "Staircase",
    goal: "Print a 4-row staircase with no empty first line.",
    initial: { a: 2, b: 0 },
    code: (v) => `rows = ${v.a}\n\nfor i in range(${v.b}, rows + 1):\n    print("#" * i)`,
    run: (v) => Array.from({ length: Math.max(0, v.a + 1 - Number(v.b)) }, (_, k) => "#".repeat(k + Number(v.b))),
    target: ["#", "##", "###", "####"],
    controls: (v, set) => (
      <>
        <Stepper label="rows" value={v.a} min={1} max={7} onChange={(a) => set({ ...v, a })} />
        <Choice label="range starts at" options={[0, 1]} value={v.b} onChange={(b) => set({ ...v, b })} />
      </>
    ),
    feedback: (v) =>
      Number(v.b) === 0
        ? `Your first line is empty: range(0, …) starts counting at 0, and "#" * 0 prints nothing. Try starting at 1.`
        : `You printed ${v.a} row${v.a > 1 ? "s" : ""}; the target staircase has 4.`,
  },
  {
    title: "Rocket countdown",
    goal: "Count down 5, 4, 3, 2, 1, then print Liftoff!",
    initial: { a: 3, b: -2 },
    code: (v) => `start = ${v.a}\n\nfor n in range(start, 0, ${v.b}):\n    print(n)\nprint("Liftoff!")`,
    run: (v) => {
      const out: string[] = [];
      for (let n = v.a; n > 0; n += Number(v.b)) out.push(String(n));
      return [...out, "Liftoff!"];
    },
    target: ["5", "4", "3", "2", "1", "Liftoff!"],
    controls: (v, set) => (
      <>
        <Stepper label="start" value={v.a} min={1} max={10} onChange={(a) => set({ ...v, a })} />
        <Choice label="step" options={[-1, -2]} value={v.b} onChange={(b) => set({ ...v, b })} />
      </>
    ),
    feedback: (v) =>
      Number(v.b) === -2
        ? `A step of -2 skips numbers (${v.a}, ${v.a - 2}, …). Use -1 to count down one at a time.`
        : `Your countdown starts at ${v.a}. The rocket needs to start at 5.`,
  },
];

export function PythonLab({ onResult }: { onResult: OnResult }) {
  const [level, setLevel] = useState(0);
  const [values, setValues] = useState<Values[]>(LEVELS.map((l) => l.initial));
  const [output, setOutput] = useState<string[] | null>(null);
  const [solved, setSolved] = useState<boolean[]>(LEVELS.map(() => false));
  const L = LEVELS[level];
  const v = values[level];

  const set = (nv: Values) => { setValues((all) => all.map((x, i) => (i === level ? nv : x))); setOutput(null); };

  const run = () => {
    const out = L.run(v);
    setOutput(out);
    const ok = out.length === L.target.length && out.every((l, i) => l === L.target[i]);
    if (ok) {
      setSolved((s) => s.map((x, i) => (i === level ? true : x)));
      onResult("success", level < LEVELS.length - 1 ? `Output matches! "${L.title}" solved.` : "All three Python challenges solved. You're thinking like a programmer!");
    } else {
      onResult("mistake", L.feedback(v));
    }
  };

  const matches = output && output.length === L.target.length && output.every((l, i) => l === L.target[i]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Choose a challenge">
        {LEVELS.map((l, i) => (
          <button key={l.title} type="button" aria-pressed={i === level} onClick={() => { setLevel(i); setOutput(null); }}
            className={`flex h-8 items-center gap-1 rounded-full px-3 font-mono text-xs transition ${i === level ? "bg-blue text-white" : "border border-white/10 text-mist hover:text-snow"}`}>
            L{i + 1}{solved[i] && <Star className="h-3 w-3 fill-[#FFBF00] text-[#FFBF00]" />}
          </button>
        ))}
        <p className="ml-2 text-sm text-snow"><span className="text-dim">Goal:</span> {L.goal}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="rounded-2xl bg-[#0a0f1f] p-3 ring-1 ring-white/10">
          <div className="mb-2 flex justify-between px-1 font-mono text-[0.7rem] text-dim"><span>challenge_{level + 1}.py</span><span>Python 3</span></div>
          <CodeBlock code={L.code(v)} lang="python" label={`Challenge code: ${L.title}`} />
        </div>
        <div className="flex flex-col gap-3">
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-dim">Adjust the code</p>
            {L.controls(v, set)}
          </div>
          <button type="button" onClick={run} className="btn btn-primary btn-sm self-start"><Play className="h-3.5 w-3.5 fill-current" /> Run</button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-black/50 p-4 ring-1 ring-white/10">
          <p className="mb-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-dim">Your output</p>
          <pre aria-live="polite" className={`code min-h-[7rem] whitespace-pre-wrap ${output ? (matches ? "text-ok" : "text-warn") : "text-dim"}`}>
            {output ? output.map((l) => (l === "" ? " " : l)).join("\n") : "Press Run to see the output."}
          </pre>
        </div>
        <div className="rounded-2xl border border-dashed border-white/15 p-4">
          <p className="mb-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-dim">Target output</p>
          <pre className="code min-h-[7rem] text-mist">{L.target.join("\n")}</pre>
        </div>
      </div>
      <p className="text-xs text-dim">Predefined challenges: output is computed in your browser to match the snippet. This is not a live Python interpreter.</p>
    </div>
  );
}
