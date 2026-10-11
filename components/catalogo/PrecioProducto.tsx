import type { Precio } from "@/data/tipos";
import { AVISO_PRECIOS, formatearSoles } from "@/lib/productos";
import { cn } from "@/lib/cn";

type Props = {
  precio: Precio;
  /** En la tarjeta va resumido; en la ficha lleva el aviso completo. */
  completo?: boolean;
  className?: string;
};

// Todo precio publicado sale con «referencial» pegado: es un aviso legal, no un detalle de estilo.
export function PrecioProducto({ precio, completo = false, className }: Props) {
  if (precio.tipo === "consultar") {
    return (
      <div className={className}>
        <p className="font-display ancho-normal text-lg font-extrabold text-petroleo-800">{precio.etiqueta}</p>
        {completo && <p className="mt-1 text-sm text-concreto-600">Te respondemos por WhatsApp con el precio según cantidad y destino.</p>}
      </div>
    );
  }

  return (
    <div className={className}>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className={cn("cifras font-display ancho-normal font-extrabold text-petroleo-800", completo ? "text-display-md" : "text-xl")}>
          {formatearSoles(precio.soles)}
        </span>
        <span className="text-sm text-concreto-600">{precio.unidad} · referencial</span>
      </p>
      {completo && <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-concreto-600">{AVISO_PRECIOS}</p>}
    </div>
  );
}
