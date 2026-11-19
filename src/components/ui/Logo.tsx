/**
 * Official Rune Codes mark: code chevrons forming a graduation cap with a tassel.
 * Traced from the supplied logo artwork. Renders in `currentColor` (white by default).
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="152 207 392 286" className={`text-snow ${className}`} fill="currentColor" aria-hidden="true">
      <path d="M187 262 328 214 328 256 259 281 328 304 328 346 187 298Z" />
      <path d="M369 214 510 262 510 298 369 346 369 304 437 281 369 256Z" />
      <path d="M231 349 273 362 254 403 309 431 258 455 159 421Z" />
      <path d="M424 362 466 349 537 421 347 486 305 470 443 403Z" />
      <path d="M194 296h9v26h-9z" />
      <rect x="189" y="320" width="19" height="30" rx="4" />
    </svg>
  );
}
