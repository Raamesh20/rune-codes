"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Float, Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { confettiBurst } from "@/lib/confetti";
import { buildSymbol, type SymbolKind } from "./symbols";

/* ───────────────────────── Shared types ───────────────────────── */

type Pointer = MutableRefObject<{ x: number; y: number }>;
type Action = "jump" | "wave" | "tilt" | "celebrate";
type StageProps = {
  src: string;
  aspect: number; // image width / height
  compact: boolean;
  active: boolean;
  onReady: () => void;
  onSlow: () => void;
  onHover: (h: boolean) => void;
};

/* ───────────────────────── Shaders ───────────────────────── */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Draws the original artwork untouched, then adds:
 *  - an animated blue rim light on the edge facing the (orbiting) light,
 *  - an optional flash for celebrations,
 *  - a vertical fade used by the floor reflection.
 */
const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uTime;
  uniform vec2 uLight;
  uniform vec2 uTexel;
  uniform float uRim;
  uniform float uFlash;
  uniform float uOpacity;
  uniform float uReflect;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(uMap, vUv);
    if (c.a < 0.04) discard;
    float a1 = texture2D(uMap, vUv + uLight * uTexel * 5.0).a;
    float a2 = texture2D(uMap, vUv + uLight * uTexel * 14.0).a;
    float rim = clamp(c.a - a1, 0.0, 1.0) * 0.85 + clamp(c.a - a2, 0.0, 1.0) * 0.35;
    vec3 rimCol = mix(vec3(0.16, 0.42, 1.0), vec3(0.15, 0.85, 1.0), 0.5 + 0.5 * sin(uTime * 0.8));
    vec3 col = c.rgb + rimCol * rim * uRim + vec3(0.35, 0.6, 1.0) * uFlash * 0.3;
    float a = c.a * uOpacity;
    if (uReflect > 0.5) {
      a *= (1.0 - smoothstep(0.0, 0.32, vUv.y)) * 0.22;
      col = mix(col, vec3(0.1, 0.25, 0.7), 0.35);
    }
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`;

function radialTexture(inner: string, outer: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, inner);
  grd.addColorStop(1, outer);
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ───────────────────────── Floating 3D symbols ───────────────────────── */

const SYMBOLS: { kind: SymbolKind; pos: [number, number, number]; color: string; scale: number; depth: number }[] = [
  { kind: "code", pos: [-0.36, 0.34, -1.2], color: "#4285FF", scale: 0.55, depth: 0.6 },
  { kind: "braces", pos: [0.42, 0.36, -0.8], color: "#8B5CF6", scale: 0.5, depth: 0.8 },
  { kind: "logo", pos: [0.46, -0.06, -1.6], color: "#27D8FF", scale: 0.62, depth: 0.5 },
  { kind: "hash", pos: [-0.44, -0.16, -0.6], color: "#8B5CF6", scale: 0.38, depth: 1 },
  { kind: "parens", pos: [-0.08, 0.46, -2.2], color: "#27D8FF", scale: 0.42, depth: 0.35 },
];

function Symbols({ vw, vh, compact, pointer, burst }: { vw: number; vh: number; compact: boolean; pointer: Pointer; burst: MutableRefObject<THREE.Group | null> }) {
  const geos = useMemo(() => SYMBOLS.map((s) => buildSymbol(s.kind)), []);
  const items = compact ? SYMBOLS.filter((s) => s.kind !== "parens" && s.kind !== "hash") : SYMBOLS;
  const layer = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = layer.current;
    if (!g) return;
    g.position.x += (pointer.current.x * 0.35 - g.position.x) * 0.05;
    g.position.y += (pointer.current.y * 0.2 - g.position.y) * 0.05;
  });
  return (
    <group ref={layer}>
      <group ref={burst}>
        {items.map((s) => {
          const i = SYMBOLS.indexOf(s);
          return (
            <Float key={s.kind} speed={1.2 + s.depth} rotationIntensity={0.6} floatIntensity={0.8}>
              <mesh geometry={geos[i]} position={[s.pos[0] * vw, s.pos[1] * vh, s.pos[2]]} scale={s.scale * (compact ? 0.8 : 1)} rotation={[0.2, -0.4 + i * 0.3, 0.1]}>
                <meshStandardMaterial color={s.color} metalness={0.55} roughness={0.22} emissive={s.color} emissiveIntensity={0.35} />
              </mesh>
            </Float>
          );
        })}
      </group>
    </group>
  );
}

function Particles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    let seed = 11;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 14;
      pos[i * 3 + 1] = (rand() - 0.5) * 9;
      pos[i * 3 + 2] = (rand() - 0.5) * 6 - 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.015; });
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.03} color="#9cc0ff" transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ───────────────────────── The character ───────────────────────── */

function Scene({ src, aspect, compact, onReady, onHover, pointer }: Omit<StageProps, "active" | "onSlow"> & { pointer: Pointer }) {
  const viewport = useThree((s) => s.viewport);
  const vw = viewport.width;
  const vh = viewport.height;
  const planeH = vh * (compact ? 0.66 : 0.6);
  const planeW = planeH * aspect;
  const floorY = -vh * (compact ? 0.36 : 0.33);
  const baseX = compact ? 0 : vw * 0.14;

  const tex = useTexture(src, (t) => {
    const texture = Array.isArray(t) ? t[0] : t;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
  });

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(planeW, planeH);
    g.translate(0, planeH / 2, 0); // pivot at the feet for natural tilts and squash
    return g;
  }, [planeW, planeH]);

  const makeUniforms = useCallback((reflect: number) => ({
    uMap: { value: tex },
    uTime: { value: 0 },
    uLight: { value: new THREE.Vector2(1, 0) },
    uTexel: { value: new THREE.Vector2(1 / 927, 1 / 1533) },
    uRim: { value: 0.5 },
    uFlash: { value: 0 },
    uOpacity: { value: 0 },
    uReflect: { value: reflect },
  }), [tex]);
  const uniforms = useMemo(() => makeUniforms(0), [makeUniforms]);
  const reflUniforms = useMemo(() => makeUniforms(1), [makeUniforms]);

  const shadowTex = useMemo(() => radialTexture("rgba(0,0,0,0.85)", "rgba(0,0,0,0)"), []);
  const glowTex = useMemo(() => radialTexture("rgba(66,133,255,0.9)", "rgba(66,133,255,0)"), []);

  const rig = useRef<THREE.Group>(null);
  const floatG = useRef<THREE.Group>(null);
  const act = useRef<THREE.Group>(null);
  const refl = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const keyLight = useRef<THREE.PointLight>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const reflMat = useRef<THREE.ShaderMaterial>(null);
  const burst = useRef<THREE.Group>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const clicks = useRef(0);

  const [bubble, setBubble] = useState<string | null>(null);
  const [status, setStatus] = useState({ mood: "happy", clicks: 0, last: "hello()" });
  const [activeLine, setActiveLine] = useState<Action | null>(null);

  // Alpha map for pixel-accurate clicking (transparent areas are not clickable).
  const alpha = useRef<{ w: number; h: number; d: Uint8ClampedArray } | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const w = 200, h = Math.round(200 / aspect);
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);
      alpha.current = { w, h, d: ctx.getImageData(0, 0, w, h).data };
    };
  }, [src, aspect]);
  const opaque = (uv?: THREE.Vector2) => {
    const a = alpha.current;
    if (!a || !uv) return true;
    const x = Math.min(a.w - 1, Math.floor(uv.x * a.w));
    const y = Math.min(a.h - 1, Math.floor((1 - uv.y) * a.h));
    return a.d[(y * a.w + x) * 4 + 3] > 40;
  };

  // Clear the speech bubble after a moment.
  useEffect(() => {
    if (!bubble) return;
    const t = window.setTimeout(() => setBubble(null), 3400);
    return () => window.clearTimeout(t);
  }, [bubble]);

  // Cinematic entrance.
  useEffect(() => {
    const a = act.current, m = mat.current, rm = reflMat.current, b = burst.current;
    if (!a || !m || !rm || !b) return;
    onReady();
    a.position.y = -planeH * 0.9;
    a.scale.set(0.75, 0.75, 1);
    b.scale.setScalar(0.001);
    const t = gsap.timeline({ delay: 0.2 });
    t.to([m.uniforms.uOpacity, rm.uniforms.uOpacity], { value: 1, duration: 0.6, ease: "power2.out" }, 0)
      .to(a.position, { y: planeH * 0.12, duration: 0.9, ease: "power3.out" }, 0)
      .to(a.scale, { x: 1, y: 1, duration: 0.9, ease: "back.out(1.7)" }, 0)
      .to(a.position, { y: 0, duration: 0.5, ease: "bounce.out" }, 0.9)
      .fromTo(m.uniforms.uFlash, { value: 1 }, { value: 0, duration: 1.4, ease: "power2.out" }, 0.3)
      .to(b.scale, { x: 1, y: 1, z: 1, duration: 1.2, ease: "elastic.out(1, 0.6)" }, 0.6)
      .to(a.rotation, { z: -0.06, duration: 0.18, yoyo: true, repeat: 3, ease: "sine.inOut" }, 1.3)
      .call(() => setBubble("Hi! I'm Rune. Click me or run some code!"), [], 1.3);
    tl.current = t;
    return () => { t.kill(); };
  }, [onReady, planeH]);

  const play = useCallback((action: Action, origin?: { x: number; y: number }) => {
    const a = act.current, m = mat.current, b = burst.current;
    if (!a || !m || !b) return;
    tl.current?.progress(1).kill();
    a.position.y = 0; a.rotation.z = 0; a.scale.set(1, 1, 1);
    const t = gsap.timeline();
    const up = planeH * 0.22;
    const hop = (h: number, at: number | string = ">") =>
      t.to(a.scale, { x: 1.06, y: 0.92, duration: 0.12, ease: "power2.out" }, at)
        .to(a.position, { y: h, duration: 0.32, ease: "power2.out" })
        .to(a.scale, { x: 0.96, y: 1.06, duration: 0.32 }, "<")
        .to(a.position, { y: 0, duration: 0.28, ease: "power2.in" })
        .to(a.scale, { x: 1.06, y: 0.93, duration: 0.1 })
        .to(a.scale, { x: 1, y: 1, duration: 0.45, ease: "elastic.out(1, 0.45)" });

    if (action === "jump") {
      hop(up);
      setBubble("Boing! Loops make me jump again and again.");
    } else if (action === "tilt") {
      t.to(a.rotation, { z: 0.1, duration: 0.18, ease: "sine.out" })
        .to(a.rotation, { z: -0.08, duration: 0.22, ease: "sine.inOut" })
        .to(a.rotation, { z: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
      setBubble("Hmm… every bug is just a puzzle!");
    } else if (action === "wave") {
      t.to(a.rotation, { z: -0.07, duration: 0.2, yoyo: true, repeat: 5, ease: "sine.inOut" })
        .to(a.rotation, { z: 0, duration: 0.3 });
      setBubble("Hi there! Ready to code?");
    } else {
      hop(up * 1.2);
      hop(up * 0.8);
      t.fromTo(m.uniforms.uFlash, { value: 1 }, { value: 0, duration: 1.2 }, 0.2)
        .fromTo(b.scale, { x: 1, y: 1, z: 1 }, { x: 1.25, y: 1.25, z: 1.25, duration: 0.35, yoyo: true, repeat: 1, ease: "power2.out" }, 0.2)
        .to(b.rotation, { z: b.rotation.z + Math.PI * 2, duration: 1.4, ease: "power3.inOut" }, 0.2);
      confettiBurst(origin, 120);
      setBubble("You did it! Celebration time!");
    }
    tl.current = t;
    setActiveLine(action);
    setStatus((s) => ({ mood: action === "celebrate" ? "ecstatic" : action === "tilt" ? "curious" : "happy", clicks: s.clicks + 1, last: `${action}()` }));
  }, [planeH]);

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!opaque(e.uv)) return;
    e.stopPropagation();
    const n = clicks.current++;
    const kind: Action = n % 3 === 2 ? "celebrate" : n % 3 === 1 ? "tilt" : "jump";
    play(kind, { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY });
  };

  // Per-frame: float, breathing, mouse-follow, orbiting light, shadow + reflection sync.
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const r = rig.current, f = floatG.current, a = act.current;
    if (!r || !f || !a) return;
    const p = pointer.current;
    r.rotation.y += (p.x * 0.28 - r.rotation.y) * 0.06;
    r.rotation.x += (-p.y * 0.06 - r.rotation.x) * 0.06;
    r.position.x += (baseX + p.x * 0.12 - r.position.x) * 0.05;
    const floatY = (Math.sin(t * 1.25) * 0.5 + 0.5) * planeH * 0.045;
    f.position.y = floatY;
    f.rotation.z = Math.sin(t * 0.8) * 0.012;
    f.scale.y = 1 + Math.sin(t * 2.1) * 0.005;

    const ang = t * 0.55;
    const lx = Math.cos(ang), ly = Math.sin(ang) * 0.6 + 0.3;
    if (mat.current) {
      mat.current.uniforms.uTime.value = t;
      mat.current.uniforms.uLight.value.set(lx, ly).normalize();
    }
    if (reflMat.current) {
      reflMat.current.uniforms.uTime.value = t;
      reflMat.current.uniforms.uLight.value.set(lx, -ly).normalize();
    }
    if (keyLight.current) keyLight.current.position.set(baseX + lx * 3, ly * 2 + 0.5, 2.2);

    const lift = floatY + a.position.y; // height above the floor
    const k = 1 - Math.min(1, lift / (planeH * 0.35));
    if (shadow.current) {
      shadow.current.scale.setScalar(0.55 + 0.45 * k);
      (shadow.current.material as THREE.MeshBasicMaterial).opacity = 0.25 + 0.5 * k;
      shadow.current.position.x = r.position.x;
    }
    if (halo.current) {
      halo.current.position.x = r.position.x;
      (halo.current.material as THREE.MeshBasicMaterial).opacity = 0.35 + Math.sin(t * 1.6) * 0.12;
    }
    if (ring.current) {
      ring.current.position.x = r.position.x;
      ring.current.rotation.z += dt * 0.25;
    }
    const g = refl.current;
    if (g) {
      g.position.set(r.position.x, floorY - lift, 0);
      g.rotation.set(r.rotation.x, r.rotation.y, -(f.rotation.z + a.rotation.z));
      g.scale.set(a.scale.x, -a.scale.y * f.scale.y, 1);
    }
    // Gentle camera parallax for depth.
    state.camera.position.x += (p.x * 0.35 - state.camera.position.x) * 0.04;
    state.camera.position.y += (0.15 + p.y * 0.2 - state.camera.position.y) * 0.04;
    state.camera.lookAt(0, 0, 0);
  });

  const panelX = compact ? -vw * 0.27 : -vw * 0.3;
  const panelY = compact ? vh * 0.38 : vh * 0.26;
  const df = compact ? 3.0 : 2.4;
  const LINES: { a: Action; label: string }[] = [
    { a: "jump", label: "rune.jump()" },
    { a: "wave", label: "rune.wave()" },
    { a: "celebrate", label: "rune.celebrate()" },
  ];

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 4, 6]} intensity={1.2} />
      <pointLight ref={keyLight} color="#3a8bff" intensity={30} distance={12} />

      <Particles count={compact ? 160 : 380} />
      <Symbols vw={vw} vh={vh} compact={compact} pointer={pointer} burst={burst} />

      {/* Blue halo behind the character */}
      <mesh ref={halo} position={[baseX, floorY + planeH * 0.5, -0.6]}>
        <planeGeometry args={[planeW * 2.6, planeH * 1.5]} />
        <meshBasicMaterial map={glowTex} transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Floor: glow ring + contact shadow */}
      <mesh ref={ring} position={[baseX, floorY + 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[planeW * 0.5, planeW * 0.53, 64]} />
        <meshBasicMaterial color="#27D8FF" transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[baseX, floorY + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[planeW * 0.95, 48]} />
        <meshBasicMaterial map={glowTex} transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={shadow} position={[baseX, floorY + 0.006, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[planeW * 0.9, planeW * 0.32]} />
        <meshBasicMaterial map={shadowTex} transparent opacity={0.6} depthWrite={false} />
      </mesh>

      {/* Mirrored reflection on the glossy floor */}
      <group ref={refl}>
        <mesh geometry={geometry}>
          <shaderMaterial ref={reflMat} vertexShader={VERT} fragmentShader={FRAG} uniforms={reflUniforms} transparent depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* The mascot: rig (mouse) → float → action (GSAP) */}
      <group ref={rig} position={[baseX, floorY, 0]}>
        <group ref={floatG}>
          <group ref={act}>
            <mesh
              geometry={geometry}
              onClick={onClick}
              onPointerMove={(e) => onHover(opaque(e.uv))}
              onPointerOut={() => onHover(false)}
            >
              <shaderMaterial ref={mat} vertexShader={VERT} fragmentShader={FRAG} uniforms={uniforms} transparent side={THREE.DoubleSide} />
            </mesh>
            <Html position={[0, planeH * 1.02, 0]} center zIndexRange={[25, 0]} style={{ pointerEvents: "none" }}>
              <div aria-live="polite" className="w-max max-w-[15rem]">
                {bubble && (
                  <p key={bubble} className="glass animate-[bubble-in_.35s_cubic-bezier(.34,1.56,.64,1)] rounded-2xl px-4 py-2.5 text-center text-sm font-medium leading-snug text-snow shadow-[0_12px_40px_-12px_rgba(66,133,255,0.6)]">
                    {bubble}
                  </p>
                )}
              </div>
            </Html>
          </group>
        </group>
      </group>

      {/* Interactive code panel: each line runs an animation */}
      <Html transform distanceFactor={df} position={[panelX, panelY, 0.6]} rotation={[0, 0.22, 0]} zIndexRange={[24, 0]}>
        <div className="w-[15.5rem] select-none rounded-xl border border-white/15 bg-[#0b1226]/85 font-mono text-[0.78rem] shadow-[0_20px_60px_-20px_rgba(39,216,255,0.5)] backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-[0.65rem] text-dim">
            <span>mascot.py</span><span className="text-cyan">click a line to run ▸</span>
          </div>
          <ul className="p-1.5">
            {LINES.map((l, i) => (
              <li key={l.a}>
                <button
                  type="button"
                  onClick={(e) => play(l.a, e.detail === 0 ? undefined : { x: e.clientX, y: e.clientY })}
                  className={`flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-cyan/10 ${activeLine === l.a ? "bg-blue/20 text-snow" : "text-mist"}`}
                >
                  <span className="w-3 text-right text-dim/70">{i + 1}</span>
                  <span><span className="tok-var">rune</span><span className="text-mist">.</span><span className="tok-fn">{l.label.split(".")[1].replace("()", "")}</span><span className="text-mist">()</span></span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Html>

      {/* Live status panel reflecting interactions */}
      {!compact && (
        <Html transform distanceFactor={df} position={[vw * 0.31, vh * 0.36, 0.2]} rotation={[0, -0.25, 0]} zIndexRange={[24, 0]} style={{ pointerEvents: "none" }}>
          <div className="w-[11.5rem] rounded-xl border border-white/15 bg-[#0b1226]/80 p-3 font-mono text-[0.72rem] leading-6 shadow-[0_20px_60px_-20px_rgba(139,92,246,0.5)] backdrop-blur-md">
            <p><span className="tok-var">mood</span> <span className="tok-op">=</span> <span className="tok-str">&quot;{status.mood}&quot;</span></p>
            <p><span className="tok-var">clicks</span> <span className="tok-op">=</span> <span className="tok-num">{status.clicks}</span></p>
            <p><span className="tok-var">last</span> <span className="tok-op">=</span> <span className="tok-fn">{status.last}</span></p>
          </div>
        </Html>
      )}
    </>
  );
}

/** Watches real frame rate; if the device can't keep up, the parent falls back to the 2D mascot. */
function FpsGuard({ onSlow }: { onSlow: () => void }) {
  const acc = useRef({ warm: 0, t: 0, n: 0, done: false });
  useFrame((_, dt) => {
    const a = acc.current;
    if (a.done) return;
    if (a.warm < 0.8) { a.warm += dt; return; }
    a.t += dt; a.n++;
    if (a.t >= 2) { a.done = true; if (a.n / a.t < 22) onSlow(); }
  });
  return null;
}

export default function MascotStage({ src, aspect, compact, active, onReady, onSlow, onHover }: StageProps) {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <Canvas
      flat
      frameloop={active ? "always" : "never"}
      dpr={[1, compact ? 1.5 : 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.15, 9], fov: 35 }}
    >
      <Suspense fallback={null}>
        <Scene src={src} aspect={aspect} compact={compact} onReady={onReady} onHover={onHover} pointer={pointer} />
      </Suspense>
      <FpsGuard onSlow={onSlow} />
    </Canvas>
  );
}
