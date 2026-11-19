import * as THREE from "three";

/** Geometry helpers for extruded 3D programming symbols (no font files needed). */

const EXTRUDE: THREE.ExtrudeGeometryOptions = {
  depth: 0.16,
  bevelEnabled: true,
  bevelThickness: 0.035,
  bevelSize: 0.03,
  bevelSegments: 3,
  curveSegments: 16,
};

function polygon(pts: [number, number][]) {
  const s = new THREE.Shape();
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return s;
}

/** Turn a centre-line into a filled stroke outline of width `w`. */
function stroke(points: THREE.Vector2[], w: number) {
  const left: THREE.Vector2[] = [];
  const right: THREE.Vector2[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[Math.max(0, i - 1)];
    const b = points[Math.min(points.length - 1, i + 1)];
    const t = new THREE.Vector2().subVectors(b, a).normalize();
    const n = new THREE.Vector2(-t.y, t.x).multiplyScalar(w / 2);
    left.push(points[i].clone().add(n));
    right.push(points[i].clone().sub(n));
  }
  const outline = [...left, ...right.reverse()];
  return polygon(outline.map((p) => [p.x, p.y]));
}

function smooth(ctrl: [number, number][], n = 40) {
  const curve = new THREE.SplineCurve(ctrl.map(([x, y]) => new THREE.Vector2(x, y)));
  return curve.getPoints(n);
}

function geo(shapes: THREE.Shape[]) {
  const g = new THREE.ExtrudeGeometry(shapes, EXTRUDE);
  g.center();
  return g;
}

export type SymbolKind = "code" | "braces" | "parens" | "hash" | "logo";

export function buildSymbol(kind: SymbolKind): THREE.BufferGeometry {
  switch (kind) {
    case "code": // </>
      return geo([
        polygon([[-0.32, 0.36], [-0.72, 0], [-0.32, -0.36], [-0.32, -0.2], [-0.53, 0], [-0.32, 0.2]]),
        polygon([[0.32, 0.36], [0.72, 0], [0.32, -0.36], [0.32, -0.2], [0.53, 0], [0.32, 0.2]]),
        polygon([[-0.1, -0.46], [0.04, -0.46], [0.16, 0.46], [0.02, 0.46]]),
      ]);
    case "braces": { // { }
      const l = smooth([[-0.2, 0.5], [-0.38, 0.44], [-0.4, 0.2], [-0.42, 0.05], [-0.58, 0], [-0.42, -0.05], [-0.4, -0.2], [-0.38, -0.44], [-0.2, -0.5]]);
      const r = l.map((p) => new THREE.Vector2(-p.x, p.y));
      return geo([stroke(l, 0.11), stroke(r, 0.11)]);
    }
    case "parens": { // ( )
      const arc = (dir: number) => {
        const pts: THREE.Vector2[] = [];
        for (let i = 0; i <= 30; i++) {
          const a = (-0.42 + (0.84 * i) / 30) * Math.PI;
          pts.push(new THREE.Vector2(dir * (0.55 - Math.cos(a) * 0.32), Math.sin(a) * 0.5));
        }
        return pts;
      };
      return geo([stroke(arc(-1), 0.11), stroke(arc(1), 0.11)]);
    }
    case "hash":
      return geo([
        polygon([[-0.22, -0.5], [-0.1, -0.5], [0.02, 0.5], [-0.1, 0.5]]),
        polygon([[0.1, -0.5], [0.22, -0.5], [0.34, 0.5], [0.22, 0.5]]),
        polygon([[-0.42, 0.14], [0.48, 0.14], [0.48, 0.26], [-0.42, 0.26]]),
        polygon([[-0.48, -0.26], [0.42, -0.26], [0.42, -0.14], [-0.48, -0.14]]),
      ]);
    case "logo": { // Rune Codes mark (traced from the official logo, y flipped)
      const P: [number, number][][] = [
        [[187, 262], [328, 214], [328, 256], [259, 281], [328, 304], [328, 346], [187, 298]],
        [[369, 214], [510, 262], [510, 298], [369, 346], [369, 304], [437, 281], [369, 256]],
        [[231, 349], [273, 362], [254, 403], [309, 431], [258, 455], [159, 421]],
        [[424, 362], [466, 349], [537, 421], [347, 486], [305, 470], [443, 403]],
        [[189, 296], [208, 296], [208, 350], [189, 350]],
      ];
      const s = 1 / 280;
      return geo(P.map((poly) => polygon(poly.map(([x, y]) => [(x - 348) * s, -(y - 350) * s]))));
    }
  }
}
