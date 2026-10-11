// Une clases condicionales. No resuelve conflictos entre utilidades de Tailwind:
// los componentes están diseñados para no necesitarlo.
export function cn(...clases: Array<string | false | null | undefined>): string {
  return clases.filter(Boolean).join(" ");
}
