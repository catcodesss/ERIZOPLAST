import { cn } from "@/lib/cn";

type Props = {
  /** "color": cuerpo petróleo + púas naranja. "claro": cuerpo blanco + púas naranja (fondos oscuros). */
  variante?: "color" | "claro" | "mono";
  className?: string;
};

// Símbolo: una jaba calada (cuerpo con dos ranuras de asa) coronada por púas de erizo.
// Geometría de 32×32; el cuerpo usa currentColor y las ranuras son huecos reales (evenodd),
// así funciona sobre cualquier fondo sin tocar el SVG.
export function Simbolo({ variante = "color", className }: Props) {
  const colorCuerpo = variante === "claro" ? "text-white" : "text-petroleo-700";
  const colorPuas = variante === "mono" ? "currentColor" : "var(--color-naranja-500)";

  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", variante !== "mono" && colorCuerpo, className)}
    >
      <path
        fill={colorPuas}
        d="M3 14 6.25 4 9.5 14 12.75 4 16 14 19.25 4 22.5 14 25.75 4 29 14Z"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M3 15H29V29H3ZM8.5 18.5H23.5A1.5 1.5 0 0 1 23.5 21.5H8.5A1.5 1.5 0 0 1 8.5 18.5ZM8.5 24H23.5A1.5 1.5 0 0 1 23.5 27H8.5A1.5 1.5 0 0 1 8.5 24Z"
      />
    </svg>
  );
}
