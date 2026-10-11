import { Info } from "lucide-react";
import { AVISO_MODELO_CATALOGO, AVISO_MODELO_FICHA } from "@/lib/productos";
import { cn } from "@/lib/cn";

type Props = {
  /** "ficha": un modelo concreto. "catalogo": el aviso general sobre la rejilla. */
  alcance: "ficha" | "catalogo";
  className?: string;
};

// Mientras PLASTINORTE no confirme cada modelo, el aviso va a la vista y no escondido en la letra
// pequeña: el visitante debe saber que los datos son referenciales antes de pedir una cotización.
export function AvisoModeloReferencial({ alcance, className }: Props) {
  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 rounded-tarjeta border border-naranja-200 bg-naranja-50 p-4 text-sm leading-relaxed text-naranja-900",
        className,
      )}
    >
      <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-naranja-700" />
      <p>
        <strong className="font-semibold">{alcance === "ficha" ? "Modelo referencial." : "Catálogo referencial."}</strong>{" "}
        {alcance === "ficha" ? AVISO_MODELO_FICHA : AVISO_MODELO_CATALOGO}
      </p>
    </div>
  );
}
