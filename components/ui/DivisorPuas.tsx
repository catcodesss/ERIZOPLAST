import { useId } from "react";
import { cn } from "@/lib/cn";

type Props = {
  /** Clase de color de texto: el divisor se pinta con currentColor. Debe igualar el fondo de la sección contigua. */
  className?: string;
  /** "arriba": las púas apuntan hacia arriba (borde superior de una sección). */
  sentido?: "arriba" | "abajo";
};

// Borde de púas: el motivo de marca (erizo) convertido en transición entre secciones.
// Se coloca al borde de una sección y toma el color de la que lo precede/sigue.
export function DivisorPuas({ className, sentido = "arriba" }: Props) {
  const id = useId();
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={cn("block h-3.5 w-full sm:h-[1.125rem]", sentido === "abajo" && "-scale-y-100", className)}
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id={id} width="36" height="18" patternUnits="userSpaceOnUse">
          <path d="M0 18 18 0 36 18Z" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
