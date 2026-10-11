import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  /** "lisa": borde fino sobre blanco. "plana": fondo concreto sin borde. "oscura": para secciones petróleo. */
  variante?: "lisa" | "plana" | "oscura";
  /** Eleva la tarjeta al pasar el cursor; solo para tarjetas que son accionables. */
  interactiva?: boolean;
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

const variantes = {
  lisa: "border border-concreto-300 bg-white",
  plana: "bg-concreto-100",
  oscura: "border border-white/12 bg-petroleo-800",
} as const;

// Base visual compartida. Las tarjetas concretas (producto, ventaja…) la componen;
// no todo en la página debe ser una tarjeta.
export function Tarjeta({ variante = "lisa", interactiva = false, as: Etiqueta = "div", className, children }: Props) {
  return (
    <Etiqueta
      className={cn(
        "relative rounded-tarjeta",
        variantes[variante],
        interactiva &&
          "transition-[transform,box-shadow,border-color] duration-300 ease-industrial hover:-translate-y-1 hover:border-petroleo-400 hover:shadow-elevada",
        className,
      )}
    >
      {children}
    </Etiqueta>
  );
}
