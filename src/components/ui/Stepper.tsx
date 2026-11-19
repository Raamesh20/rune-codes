"use client";

import { Minus, Plus } from "lucide-react";

type Props = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
  disabled?: boolean;
};

/** Accessible numeric stepper (buttons + spinbutton semantics). */
export function Stepper({ label, value, min, max, step = 1, onChange, suffix = "", disabled }: Props) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, v)));
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-mist">{label}</span>
      <div
        role="spinbutton"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={`${value}${suffix}`}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "ArrowUp" || e.key === "ArrowRight") { e.preventDefault(); set(value + step); }
          if (e.key === "ArrowDown" || e.key === "ArrowLeft") { e.preventDefault(); set(value - step); }
          if (e.key === "Home") { e.preventDefault(); set(min); }
          if (e.key === "End") { e.preventDefault(); set(max); }
        }}
        className="flex items-center gap-1 rounded-full border border-white/10 bg-ink/60 p-1"
      >
        <button type="button" tabIndex={-1} aria-hidden disabled={disabled || value <= min} onClick={() => set(value - step)} className="grid h-8 w-8 place-items-center rounded-full text-mist hover:bg-white/10 hover:text-snow disabled:opacity-30">
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="min-w-[3.25rem] text-center font-mono text-sm tabular-nums">{value}{suffix}</span>
        <button type="button" tabIndex={-1} aria-hidden disabled={disabled || value >= max} onClick={() => set(value + step)} className="grid h-8 w-8 place-items-center rounded-full text-mist hover:bg-white/10 hover:text-snow disabled:opacity-30">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
