import { highlight, type Lang } from "@/lib/highlight";

type Props = {
  code: string;
  lang: Lang;
  /** 0-based line to emphasise (e.g. the line currently executing). */
  activeLine?: number | null;
  showNumbers?: boolean;
  className?: string;
  label?: string;
};

export function CodeBlock({ code, lang, activeLine = null, showNumbers = true, className = "", label }: Props) {
  const lines = highlight(code, lang);
  return (
    <pre className={`code scroll-thin overflow-x-auto ${className}`} aria-label={label}>
      <code>
        {lines.map((toks, i) => (
          <span
            key={i}
            className={`relative block rounded-md pr-3 transition-colors duration-300 ${activeLine === i ? "bg-blue/15 shadow-[inset_2px_0_0_#27D8FF]" : ""}`}
          >
            {showNumbers && (
              <span aria-hidden className="mr-4 inline-block w-5 select-none pl-1 text-right text-dim/60">
                {i + 1}
              </span>
            )}
            {toks.length === 0 ? "​" : toks.map((t, j) => (
              <span key={j} className={t.cls}>{t.text}</span>
            ))}
          </span>
        ))}
      </code>
    </pre>
  );
}
