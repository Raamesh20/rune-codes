"use client";

/**
 * Lightweight, dependency-free confetti burst rendered on a temporary full-screen canvas.
 * The canvas is created on demand and removed when all particles have settled.
 */
const COLORS = ["#4285FF", "#27D8FF", "#8B5CF6", "#F8FAFC", "#FFBF00", "#34D399"];

type Particle = {
  x: number; y: number; vx: number; vy: number;
  w: number; h: number; rot: number; vr: number;
  color: string; life: number; shape: 0 | 1;
};

let active = 0;

export function confettiBurst(origin?: { x: number; y: number }, count = 90) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (active > 2) return; // avoid stacking many canvases on rapid clicks

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed", inset: "0", width: "100vw", height: "100vh",
    pointerEvents: "none", zIndex: "80",
  } as CSSStyleDeclaration);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) { canvas.remove(); return; }
  ctx.scale(dpr, dpr);
  active++;

  const ox = origin?.x ?? window.innerWidth / 2;
  const oy = origin?.y ?? window.innerHeight / 2;
  const n = window.innerWidth < 640 ? Math.round(count * 0.6) : count;
  const parts: Particle[] = Array.from({ length: n }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
    const speed = 6 + Math.random() * 9;
    return {
      x: ox, y: oy,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      w: 5 + Math.random() * 6, h: 8 + Math.random() * 8,
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.35,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      life: 1, shape: Math.random() > 0.7 ? 1 : 0,
    };
  });

  let last = performance.now();
  const tick = (now: number) => {
    const dt = Math.min((now - last) / 16.67, 3);
    last = now;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let alive = 0;
    for (const p of parts) {
      if (p.life <= 0) continue;
      p.vy += 0.32 * dt;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.life -= 0.0075 * dt;
      if (p.y > window.innerHeight + 40) p.life = 0;
      if (p.life <= 0) continue;
      alive++;
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life * 1.6);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 1) {
        ctx.beginPath();
        ctx.arc(0, 0, p.w * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 2)) + 2);
      }
      ctx.restore();
    }
    if (alive > 0) requestAnimationFrame(tick);
    else { canvas.remove(); active--; }
  };
  requestAnimationFrame(tick);
}

export function confettiFromElement(el: Element | null, count?: number) {
  if (!el) return confettiBurst(undefined, count);
  const r = el.getBoundingClientRect();
  confettiBurst({ x: r.left + r.width / 2, y: r.top + r.height * 0.35 }, count);
}
