"use client";

import { useState } from "react";
import { Shuffle } from "lucide-react";
import { CodeBlock } from "@/components/ui/CodeBlock";
import type { OnResult } from "./types";

const CODE = `int binarySearch(int a[], int n, int target) {
  int low = 0, high = n - 1;
  while (low <= high) {
    int mid = (low + high) / 2;
    if (a[mid] == target) return mid;
    if (a[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`;

type Choice = "found" | "right" | "left";

const START = { arr: [3, 8, 12, 17, 23, 29, 34, 41, 47, 56, 62, 75], target: 41 };

export function CppSearch({ onResult }: { onResult: OnResult }) {
  const [arr, setArr] = useState(START.arr);
  const [target, setTarget] = useState(START.target);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(START.arr.length - 1);
  const [steps, setSteps] = useState(1);
  const [line, setLine] = useState(3);
  const [found, setFound] = useState(false);
  const mid = Math.floor((low + high) / 2);

  const newPuzzle = () => {
    const set = new Set<number>();
    while (set.size < 12) set.add(1 + Math.floor(Math.random() * 99));
    const a = [...set].sort((x, y) => x - y);
    setArr(a);
    setTarget(a[Math.floor(Math.random() * a.length)]);
    setLow(0); setHigh(a.length - 1); setSteps(1); setLine(3); setFound(false);
  };

  const choose = (c: Choice) => {
    if (found) return;
    const v = arr[mid];
    const correct: Choice = v === target ? "found" : v < target ? "right" : "left";
    if (c !== correct) {
      const why =
        correct === "found" ? `Look again: a[mid] is ${v}, which equals the target ${target}. The search is done!`
        : correct === "right" ? `Not quite. a[mid] = ${v} is smaller than ${target}, and the array is sorted, so the target must be to the right.`
        : `Not quite. a[mid] = ${v} is bigger than ${target}, so everything to the right is too big. Search left.`;
      onResult("mistake", why);
      return;
    }
    if (c === "found") {
      setLine(4);
      setFound(true);
      const linear = arr.indexOf(target) + 1;
      onResult("success", `Found ${target} at index ${mid} in ${steps} step${steps > 1 ? "s" : ""}. Checking one-by-one would take ${linear}.`);
      return;
    }
    if (c === "right") { setLow(mid + 1); setLine(5); } else { setHigh(mid - 1); setLine(6); }
    setSteps((s) => s + 1);
    onResult("info", c === "right" ? `Correct: low = mid + 1. Half the array is gone!` : `Correct: high = mid - 1. Half the array is gone!`);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="rounded-2xl bg-[#0a0f1f] p-3 ring-1 ring-white/10">
        <div className="mb-2 flex justify-between px-1 font-mono text-[0.7rem] text-dim"><span>binary_search.cpp</span><span>C++</span></div>
        <CodeBlock code={CODE} lang="cpp" activeLine={line} label="C++ binary search" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-mist">Find <span className="rounded-md bg-[#FFBF00]/15 px-2 py-0.5 font-mono font-semibold text-[#FFBF00]">{target}</span> in the sorted array</p>
          <button type="button" onClick={newPuzzle} className="flex items-center gap-1.5 text-xs text-mist hover:text-cyan"><Shuffle className="h-3.5 w-3.5" /> New puzzle</button>
        </div>

        <ol className="grid grid-cols-6 gap-1.5 sm:grid-cols-12" aria-label="Sorted array">
          {arr.map((v, i) => {
            const out = i < low || i > high;
            const isMid = i === mid && !out;
            const hit = found && i === mid;
            return (
              <li key={i} className="flex flex-col items-center gap-1">
                <span className={`grid h-11 w-full place-items-center rounded-lg font-mono text-sm tabular-nums transition-all duration-300 ${hit ? "bg-ok text-ink shadow-[0_0_20px_rgba(52,211,153,.6)]" : isMid ? "bg-cyan text-ink" : out ? "bg-white/[0.03] text-dim/40 line-through" : "bg-blue/20 text-snow ring-1 ring-blue/40"}`}>
                  {v}
                </span>
                <span className="h-3 font-mono text-[0.55rem] uppercase text-dim">
                  {i === low && !found ? "low" : i === high && !found ? "high" : `${i}`}
                </span>
              </li>
            );
          })}
        </ol>

        <dl className="grid grid-cols-4 gap-2 font-mono text-xs">
          {[["low", low], ["high", high], ["mid", mid], ["a[mid]", arr[mid]]].map(([k, val]) => (
            <div key={k} className="rounded-xl border border-white/10 p-2"><dt className="text-dim">{k}</dt><dd className="mt-0.5 text-snow">{val}</dd></div>
          ))}
        </dl>

        {!found ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="text-sm"><span className="font-mono text-cyan">a[{mid}] = {arr[mid]}</span>, target = <span className="font-mono text-[#FFBF00]">{target}</span>. What does the program do next?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => choose("found")} className="btn btn-ghost btn-sm normal-case tracking-normal">return mid (found)</button>
              <button type="button" onClick={() => choose("left")} className="btn btn-ghost btn-sm normal-case tracking-normal">← high = mid - 1</button>
              <button type="button" onClick={() => choose("right")} className="btn btn-ghost btn-sm normal-case tracking-normal">low = mid + 1 →</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={newPuzzle} className="btn btn-primary btn-sm self-start"><Shuffle className="h-3.5 w-3.5" /> Try another number</button>
        )}
      </div>
    </div>
  );
}
