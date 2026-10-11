import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Fondo = "blanco" | "concreto" | "petroleo" | "petroleo-profundo" | "naranja";

type Props = {
  fondo?: Fondo;
  espaciado?: "normal" | "compacto" | "ninguno";
  id?: string;
  /** Textura decorativa de jaba calada (solo petróleo y concreto). */
  textura?: boolean;
  className?: string;
  children: ReactNode;
};

const fondos: Record<Fondo, string> = {
  blanco: "bg-white text-petroleo-950",
  concreto: "bg-concreto-100 text-petroleo-950",
  petroleo: "bg-petroleo-700 text-white",
  "petroleo-profundo": "bg-petroleo-950 text-white",
  naranja: "bg-naranja-500 text-petroleo-950",
};

const espaciados = {
  normal: "py-seccion",
  compacto: "py-seccion-sm",
  ninguno: "",
} as const;

// `data-tono` permite que los hijos (encabezados, tarjetas, textos) se adapten al fondo
// con `group-data-[tono=oscuro]/seccion:` sin recibir props: el fondo manda, no cada componente.
export function Seccion({ fondo = "blanco", espaciado = "normal", id, textura = false, className, children }: Props) {
  const oscuro = fondo === "petroleo" || fondo === "petroleo-profundo";
  return (
    <section
      id={id}
      data-tono={oscuro ? "oscuro" : "claro"}
      className={cn(
        "group/seccion relative",
        fondos[fondo],
        espaciados[espaciado],
        textura && (oscuro ? "textura-calada-clara" : "textura-calada-oscura"),
        className,
      )}
    >
      {children}
    </section>
  );
}
