import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Contenedor } from "@/components/ui/Contenedor";

type Props = {
  medio: ReactNode;
  contenido: ReactNode;
  /** Qué lado ocupa más: la composición es asimétrica por defecto (7/5). */
  proporcion?: "medio-grande" | "contenido-grande" | "igual";
  /** Coloca el medio a la derecha en escritorio. En móvil siempre va primero. */
  invertir?: boolean;
  /** Alineación vertical del contenido respecto al medio. */
  alinear?: "centro" | "inicio";
  className?: string;
};

const columnas = {
  "medio-grande": { medio: "lg:col-span-7", contenido: "lg:col-span-5" },
  "contenido-grande": { medio: "lg:col-span-5", contenido: "lg:col-span-7" },
  igual: { medio: "lg:col-span-6", contenido: "lg:col-span-6" },
} as const;

// Composición de dos columnas sobre retícula de 12. El medio (foto, ficha, dibujo) y el texto
// no comparten ancho: esa diferencia es lo que evita el ritmo "mitad y mitad" de plantilla.
export function DosColumnas({ medio, contenido, proporcion = "medio-grande", invertir = false, alinear = "centro", className }: Props) {
  const c = columnas[proporcion];
  return (
    <Contenedor className={className}>
      <div className={cn("grid gap-10 lg:grid-cols-12 lg:gap-16", alinear === "centro" ? "items-center" : "items-start")}>
        <div className={cn(c.medio, invertir && "lg:order-2")}>{medio}</div>
        <div className={cn(c.contenido, invertir && "lg:order-1")}>{contenido}</div>
      </div>
    </Contenedor>
  );
}
