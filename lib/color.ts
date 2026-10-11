// Contraste WCAG 2.x entre dos colores hex. La página /sistema-diseno lo calcula en vez de
// afirmarlo, para que el dato no se quede obsoleto si cambia la paleta.

function aLineal(canal: number): number {
  const c = canal / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminancia(hex: string): number {
  const limpio = hex.replace("#", "");
  const n = parseInt(limpio, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.2126 * aLineal(r) + 0.7152 * aLineal(g) + 0.0722 * aLineal(b);
}

export function contraste(a: string, b: string): number {
  const la = luminancia(a);
  const lb = luminancia(b);
  const [claro, oscuro] = la > lb ? [la, lb] : [lb, la];
  return (claro + 0.05) / (oscuro + 0.05);
}

export function nivelWcag(ratio: number, textoGrande = false): "AAA" | "AA" | "falla" {
  if (ratio >= (textoGrande ? 4.5 : 7)) return "AAA";
  if (ratio >= (textoGrande ? 3 : 4.5)) return "AA";
  return "falla";
}
