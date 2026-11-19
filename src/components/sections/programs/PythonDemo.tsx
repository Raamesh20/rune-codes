"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Stepper } from "@/components/ui/Stepper";

type Example = "greet" | "table" | "scores";

const TABS: { id: Example; label: string }[] = [
  { id: "greet", label: "Greeting" },
  { id: "table", label: "Times table" },
  { id: "scores", label: "Score stats" },
];

/** Safe display of a user-typed name inside a Python string literal. */
function pyStr(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function PythonDemo() {
  const [tab, setTab] = useState<Example>("greet");
  const [name, setName] = useState("Coder");
  const [age, setAge] = useState(9);
  const [num, setNum] = useState(7);
  const [upto, setUpto] = useState(5);
  const [scores, setScores] = useState([78, 92, 85]);
  const [out, setOut] = useState<string[] | null>(null);
  const [shown, setShown] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);

  const cleanName = name.trim().slice(0, 20) || "Coder";

  const code =
    tab === "greet"
      ? `name = "${pyStr(cleanName)}"\nage = ${age}\n\nprint(f"Hi {name}!")\nprint(f"In 5 years you'll be {age + 5}.")`
      : tab === "table"
        ? `number = ${num}\n\nfor i in range(1, ${upto} + 1):\n    print(f"{number} x {i} = {number * i}")`
        : `scores = [${scores.join(", ")}]\n\nprint("Highest:", max(scores))\nprint("Lowest:", min(scores))\nprint("Average:", round(sum(scores) / len(scores), 1))`;

  // Outputs computed in the browser to mirror exactly what the snippet prints.
  const compute = (): string[] => {
    if (tab === "greet") return [`Hi ${cleanName}!`, `In 5 years you'll be ${age + 5}.`];
    if (tab === "table") return Array.from({ length: upto }, (_, k) => `${num} x ${k + 1} = ${num * (k + 1)}`);
    const avg = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    // Python prints a float like 85.0 with a trailing .0
    const avgStr = Number.isInteger(avg) ? `${avg}.0` : `${avg}`;
    return [`Highest: ${Math.max(...scores)}`, `Lowest: ${Math.min(...scores)}`, `Average: ${avgStr}`];
  };

  const run = () => {
    if (timer.current) window.clearInterval(timer.current);
    const lines = compute();
    setOut(lines);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setShown(lines.length); return; }
    setShown(0);
    let i = 0;
    timer.current = window.setInterval(() => {
      i++;
      setShown(i);
      if (i >= lines.length && timer.current) { window.clearInterval(timer.current); timer.current = null; }
    }, 160);
  };

  const edit = <T,>(fn: (v: T) => void) => (v: T) => { setOut(null); fn(v); };

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5">
      <div role="tablist" aria-label="Python examples" className="flex gap-1 rounded-full border border-white/10 bg-ink/50 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => { setTab(t.id); setOut(null); }}
            className={`flex-1 rounded-full px-3 py-2 text-xs font-medium transition sm:text-sm ${tab === t.id ? "bg-cyan/15 text-cyan ring-1 ring-cyan/40" : "text-mist hover:text-snow"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="rounded-2xl bg-[#0a0f1f] p-3 ring-1 ring-white/10">
          <div className="mb-2 flex items-center justify-between px-1 font-mono text-[0.7rem] text-dim">
            <span>{tab}.py</span>
            <span>Python 3</span>
          </div>
          <CodeBlock code={code} lang="python" label={`Python example: ${tab}`} />
        </div>

        <div className="flex flex-col gap-3">
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-dim">Inputs</p>
            {tab === "greet" && (
              <>
                <label className="flex items-center justify-between gap-3 text-sm text-mist">
                  name
                  <input
                    value={name}
                    maxLength={20}
                    onChange={(e) => edit(setName)(e.target.value)}
                    className="w-36 rounded-full border border-white/10 bg-ink/60 px-3 py-1.5 font-mono text-sm text-snow outline-none focus:border-cyan/60"
                  />
                </label>
                <Stepper label="age" value={age} min={5} max={17} onChange={edit(setAge)} />
              </>
            )}
            {tab === "table" && (
              <>
                <Stepper label="number" value={num} min={1} max={12} onChange={edit(setNum)} />
                <Stepper label="rows" value={upto} min={1} max={10} onChange={edit(setUpto)} />
              </>
            )}
            {tab === "scores" &&
              scores.map((s, i) => (
                <Stepper key={i} label={`score ${i + 1}`} value={s} min={0} max={100} step={1} onChange={edit((v: number) => setScores((arr) => arr.map((x, j) => (j === i ? v : x))))} />
              ))}
          </div>
          <button type="button" onClick={run} className="btn btn-primary btn-sm self-start">
            <Play className="h-3.5 w-3.5 fill-current" /> Run example
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-black/50 p-4 ring-1 ring-white/10">
        <p className="mb-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-dim">Output</p>
        <div aria-live="polite" className="code min-h-[4.5rem] text-ok">
          {out ? out.slice(0, shown).map((l, i) => <div key={i}>{l}</div>) : <span className="text-dim">Press “Run example” to see the output.</span>}
        </div>
      </div>
      <p className="text-xs leading-relaxed text-dim">
        Demo note: these are predefined examples. The output is calculated in your browser to match what each snippet prints. It is not a live Python interpreter.
      </p>
    </div>
  );
}
