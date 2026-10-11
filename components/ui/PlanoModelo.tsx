import type { Medidas } from "@/data/tipos";
import { cn } from "@/lib/cn";

// Esquema isométrico de una caja con las medidas reales del modelo (largo × ancho × alto). Sustituye a la foto
// mientras PLASTINORTE no tenga fotos propias de ese modelo: es un DIBUJO esquemático y se rotula como tal, nunca
// como foto del producto. Solo representa las proporciones: no muestra calados, asas ni tapa, que dependen de la
// versión y se confirman al cotizar.
const ANCHO = 280;
const ALTO = 190;
const MARGEN = 30; // deja sitio a las cotas

const C = Math.cos(Math.PI / 6);
const proyectar = (x: number, y: number, z: number): [number, number] => [(x - y) * C, (x + y) * 0.5 - z];
const puntos = (lista: [number, number][]) => lista.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

export function PlanoModelo({ medidas, className }: { medidas: Medidas; className?: string }) {
  const { largo: L, ancho: A, alto: H } = medidas;

  // Vértices visibles (el observador está en el rincón +x +y +z).
  const v = {
    t0: proyectar(0, 0, H),
    t1: proyectar(L, 0, H),
    t2: proyectar(L, A, H),
    t3: proyectar(0, A, H),
    b1: proyectar(L, 0, 0),
    b2: proyectar(L, A, 0),
    b3: proyectar(0, A, 0),
  };
  const todos = Object.values(v);
  const xs = todos.map(([x]) => x);
  const ys = todos.map(([, y]) => y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const k = Math.min((ANCHO - 2 * MARGEN) / (maxX - minX), (ALTO - 2 * MARGEN - 8) / (maxY - minY));
  const dx = (ANCHO - (maxX - minX) * k) / 2 - minX * k;
  const dy = (ALTO - (maxY - minY) * k) / 2 - minY * k - 6;
  const e = (p: [number, number]): [number, number] => [p[0] * k + dx, p[1] * k + dy];
  const t0 = e(v.t0), t1 = e(v.t1), t2 = e(v.t2), t3 = e(v.t3), b1 = e(v.b1), b2 = e(v.b2), b3 = e(v.b3);

  // Reborde interior de la boca de la caja, para que se lea como cajón y no como un bloque macizo.
  const m = Math.min(L, A) * 0.07;
  const reborde = [proyectar(m, m, H), proyectar(L - m, m, H), proyectar(L - m, A - m, H), proyectar(m, A - m, H)].map(e);

  const medio = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const cotaL = medio(b3, b2); // largo: arista inferior izquierda
  const cotaA = medio(b2, b1); // ancho: arista inferior derecha
  const cotaH = medio(b1, t1); // alto: arista vertical derecha

  return (
    <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} role="img" aria-label={`Esquema del modelo: ${L} por ${A} por ${H} centímetros`} className={cn("h-auto w-full", className)}>
      <g strokeLinejoin="round" strokeLinecap="round">
        <polygon points={puntos([t3, t2, b2, b3])} className="fill-white/6 stroke-petroleo-200" strokeWidth="1.5" />
        <polygon points={puntos([t1, t2, b2, b1])} className="fill-white/12 stroke-petroleo-200" strokeWidth="1.5" />
        <polygon points={puntos([t0, t1, t2, t3])} className="fill-white/18 stroke-petroleo-100" strokeWidth="1.5" />
        <polygon points={puntos(reborde)} className="fill-petroleo-950/50 stroke-petroleo-300" strokeWidth="1" />
      </g>
      <g className="fill-naranja-300 font-mono" fontSize="11" fontWeight="500">
        <text x={cotaL[0] - 8} y={cotaL[1] + 15} textAnchor="end">
          {L}
        </text>
        <text x={cotaA[0] + 8} y={cotaA[1] + 15} textAnchor="start">
          {A}
        </text>
        <text x={cotaH[0] + 8} y={cotaH[1] + 4} textAnchor="start">
          {H}
        </text>
      </g>
    </svg>
  );
}
