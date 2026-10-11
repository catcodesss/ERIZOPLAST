import { readFile } from "node:fs/promises";
import path from "node:path";

export type Escala = { nombre: string; tonos: { tono: string; hex: string }[] };

// La guía de estilo lee los colores del propio globals.css: así la fuente de verdad es una sola
// y lo que se ve en /sistema-diseno no puede divergir de lo que usa el sitio.
export async function leerPaleta(): Promise<Escala[]> {
  "use cache";
  const css = await readFile(path.join(process.cwd(), "app", "globals.css"), "utf8");
  const escalas = new Map<string, { tono: string; hex: string }[]>();
  for (const [, nombre, tono, hex] of css.matchAll(/--color-([a-z]+)-(\d+):\s*(#[0-9a-fA-F]{6})/g)) {
    escalas.set(nombre, [...(escalas.get(nombre) ?? []), { tono, hex }]);
  }
  return [...escalas].map(([nombre, tonos]) => ({ nombre, tonos }));
}
