import { cn } from "@/lib/cn";
import { Simbolo } from "./Simbolo";

type Props = {
  /** "color" para fondos claros, "claro" para fondos oscuros. */
  variante?: "color" | "claro";
  /** Solo el símbolo, para espacios muy pequeños. */
  soloSimbolo?: boolean;
  className?: string;
};

// Logotipo tipográfico: PLASTI en peso máximo + NORTE más ligero, ambos en Archivo expandida.
// El texto es real (no una imagen): se lee, se selecciona y escala sin perder nitidez.
export function Logo({ variante = "color", soloSimbolo = false, className }: Props) {
  const oscuro = variante === "claro";

  return (
    <span className={cn("inline-flex items-center gap-2.5 leading-none", className)}>
      <Simbolo variante={variante} className="size-9" />
      {!soloSimbolo && (
        <span
          aria-hidden="true"
          className={cn(
            // Más pequeño bajo 400 px: con el tamaño pleno, logo + botón de menú no caben en 320 px.
            "font-display ancho-expandido text-[1.2rem] tracking-[0.01em] min-[400px]:text-[1.4rem]",
            oscuro ? "text-white" : "text-petroleo-800",
          )}
        >
          <span className="font-black">PLASTI</span>
          <span className={cn("font-semibold", oscuro ? "text-naranja-400" : "text-naranja-600")}>NORTE</span>
        </span>
      )}
      <span className="sr-only">PLASTINORTE</span>
    </span>
  );
}
