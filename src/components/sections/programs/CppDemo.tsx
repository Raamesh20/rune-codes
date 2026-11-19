"use client";

import { useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw, Shuffle, StepForward } from "lucide-react";
import { CodeBlock } from "@/components/ui/CodeBlock";

const CODE = `void bubbleSort(int a[], int n) {
  for (int i = 0; i < n - 1; i++) {
    for (int j = 0; j < n - i - 1; j++) {
      if (a[j] > a[j + 1]) {
        swap(a[j], a[j + 1]);
      }
    }
  }
}`;

type Frame = {
  line: number;
  arr: number[];
  i: number;
  j: number | null;
  compare: [number, number] | null;
  swapped: boolean;
  sortedFrom: number; // indices >= sortedFrom are in final position
  comparisons: number;
  swaps: number;
  note: string;
};

function trace(input: number[]): Frame[] {
  const a = [...input];
  const n = a.length;
  const frames: Frame[] = [];
  let comparisons = 0, swaps = 0;
  const push = (f: Omit<Frame, "arr" | "comparisons" | "swaps">) => frames.push({ ...f, arr: [...a], comparisons, swaps });
  push({ line: 0, i: 0, j: null, compare: null, swapped: false, sortedFrom: n, note: `Start: sort ${n} numbers.` });
  for (let i = 0; i < n - 1; i++) {
    push({ line: 1, i, j: null, compare: null, swapped: false, sortedFrom: n - i, note: `Pass ${i + 1}: bubble the largest remaining value to the end.` });
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      push({ line: 3, i, j, compare: [j, j + 1], swapped: false, sortedFrom: n - i, note: `Compare a[${j}] = ${a[j]} with a[${j + 1}] = ${a[j + 1]}.` });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swaps++;
        push({ line: 4, i, j, compare: [j, j + 1], swapped: true, sortedFrom: n - i, note: `${a[j + 1]} > ${a[j]}, so swap them.` });
      }
    }
  }
  push({ line: 8, i: n - 1, j: null, compare: null, swapped: false, sortedFrom: 0, note: `Sorted with ${comparisons} comparisons and ${swaps} swaps.` });
  return frames;
}

const START = [42, 17, 63, 8, 29, 51, 12];

export function CppDemo() {
  const [data, setData] = useState(START);
  const frames = useMemo(() => trace(data), [data]);
  const [k, setK] = useState(0);
  const [playing, setPlaying] = useState(false);
  const f = frames[Math.min(k, frames.length - 1)];
  const max = Math.max(...data);
  const atEnd = k >= frames.length - 1;

  useEffect(() => {
    if (!playing) return;
    if (atEnd) return;
    const t = window.setTimeout(() => setK((x) => x + 1), 520);
    return () => window.clearTimeout(t);
  }, [playing, k, atEnd]);

  const shuffle = () => {
    const arr = Array.from({ length: 7 }, () => 5 + Math.floor(Math.random() * 90));
    setData(arr);
    setK(0);
    setPlaying(false);
  };

  return (
    <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-2xl bg-[#0a0f1f] p-3 ring-1 ring-white/10">
        <div className="mb-2 flex items-center justify-between px-1 font-mono text-[0.7rem] text-dim">
          <span>bubble_sort.cpp</span>
          <span>C++</span>
        </div>
        <CodeBlock code={CODE} lang="cpp" activeLine={f.line} label="C++ bubble sort" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative flex h-48 items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 pb-4 pt-6" role="img" aria-label={`Array: ${f.arr.join(", ")}`}>
          {f.arr.map((v, idx) => {
            const comparing = f.compare?.includes(idx);
            const sorted = idx >= f.sortedFrom;
            return (
              <div key={idx} className="flex flex-1 flex-col items-center justify-end gap-1.5 self-stretch">
                <span className={`font-mono text-[0.7rem] tabular-nums ${comparing ? "text-snow" : "text-dim"}`}>{v}</span>
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${sorted ? "bg-ok/80" : comparing ? (f.swapped ? "bg-[#fb7185]" : "bg-cyan") : "bg-blue/60"}`}
                  style={{ height: `${(v / max) * 100}%`, boxShadow: comparing ? "0 0 20px rgba(39,216,255,.6)" : undefined }}
                />
                <span className="font-mono text-[0.6rem] text-dim/70">[{idx}]</span>
              </div>
            );
          })}
        </div>

        <p aria-live="polite" className="min-h-[2.75rem] text-sm leading-relaxed text-mist">{f.note}</p>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => (atEnd ? (setK(0), setPlaying(true)) : setPlaying((p) => !p))} className="btn btn-primary btn-sm">
            {playing && !atEnd ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            {playing && !atEnd ? "Pause" : atEnd ? "Replay" : "Play"}
          </button>
          <button type="button" onClick={() => { setPlaying(false); setK((x) => Math.min(frames.length - 1, x + 1)); }} disabled={atEnd} className="btn btn-ghost btn-sm">
            <StepForward className="h-3.5 w-3.5" /> Step
          </button>
          <button type="button" onClick={() => { setPlaying(false); setK(0); }} className="btn btn-ghost btn-sm" aria-label="Reset">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={shuffle} className="btn btn-ghost btn-sm" aria-label="New random numbers">
            <Shuffle className="h-3.5 w-3.5" />
          </button>
        </div>
        <dl className="grid grid-cols-3 gap-2 font-mono text-xs">
          <div className="rounded-xl border border-white/10 p-2.5"><dt className="text-dim">step</dt><dd className="mt-0.5 text-snow">{k + 1}/{frames.length}</dd></div>
          <div className="rounded-xl border border-white/10 p-2.5"><dt className="text-dim">compares</dt><dd className="mt-0.5 text-snow">{f.comparisons}</dd></div>
          <div className="rounded-xl border border-white/10 p-2.5"><dt className="text-dim">swaps</dt><dd className="mt-0.5 text-snow">{f.swaps}</dd></div>
        </dl>
      </div>
    </div>
  );
}
