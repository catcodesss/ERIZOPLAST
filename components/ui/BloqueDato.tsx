import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  icono?: ReactNode;
  /** Dato principal: una cifra, una medida o una frase corta. */
  valor: ReactNode;
  etiqueta: string;
  texto?: string;
  className?: string;
};

// Bloque industrial de información: lectura de ficha técnica, con regla vertical a la izquierda.
// Pensado para ir en filas de 2–4 sobre un fondo continuo, no como tarjetas sueltas.
export function BloqueDato({ icono, valor, etiqueta, texto, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-l-2 pl-5",
        "border-naranja-500",
        className,
      )}
    >
      {icono && (
        <span className="text-petroleo-600 group-data-[tono=oscuro]/seccion:text-petroleo-200 [&>svg]:size-7" aria-hidden="true">
          {icono}
        </span>
      )}
      <p className="cifras text-display-md font-semibold text-petroleo-800 group-data-[tono=oscuro]/seccion:text-white">{valor}</p>
      <div>
        <p className="font-display ancho-expandido text-eyebrow font-bold uppercase text-concreto-600 group-data-[tono=oscuro]/seccion:text-petroleo-200">
          {etiqueta}
        </p>
        {texto && (
          <p className="mt-2 text-[0.9375rem] leading-snug text-concreto-700 group-data-[tono=oscuro]/seccion:text-petroleo-100">
            {texto}
          </p>
        )}
      </div>
    </div>
  );
}
