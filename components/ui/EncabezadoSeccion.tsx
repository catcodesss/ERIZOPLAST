import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  /** Rótulo corto sobre el título, estilo etiqueta de planta. */
  sobretitulo?: string;
  titulo: ReactNode;
  descripcion?: ReactNode;
  alineacion?: "izquierda" | "centro";
  /** Etiqueta HTML del título; el estilo visual no cambia. */
  nivel?: "h1" | "h2" | "h3";
  tamano?: "2xl" | "xl" | "lg" | "md";
  /** Botones u otros elementos bajo la descripción. */
  acciones?: ReactNode;
  className?: string;
};

const tamanos = {
  "2xl": "text-display-2xl",
  xl: "text-display-xl",
  lg: "text-display-lg",
  md: "text-display-md",
} as const;

// Se adapta al fondo de su <Seccion> por `data-tono`, sin props de color.
export function EncabezadoSeccion({
  sobretitulo,
  titulo,
  descripcion,
  alineacion = "izquierda",
  nivel: Nivel = "h2",
  tamano = "lg",
  acciones,
  className,
}: Props) {
  const centrado = alineacion === "centro";
  return (
    <header className={cn("flex flex-col gap-5", centrado && "items-center text-center", className)}>
      {sobretitulo && (
        <p
          className={cn(
            "flex items-center gap-3 font-display ancho-expandido text-eyebrow font-bold uppercase",
            "text-naranja-700 group-data-[tono=oscuro]/seccion:text-naranja-400",
          )}
        >
          <span aria-hidden="true" className="size-2 rotate-45 bg-current" />
          {sobretitulo}
        </p>
      )}
      <Nivel
        className={cn(
          "font-display ancho-normal font-extrabold text-balance [overflow-wrap:break-word]",
          tamanos[tamano],
          "text-petroleo-800 group-data-[tono=oscuro]/seccion:text-white",
        )}
      >
        {titulo}
      </Nivel>
      {descripcion && (
        <p
          className={cn(
            "max-w-[40rem] text-lg leading-relaxed text-pretty text-concreto-700",
            "group-data-[tono=oscuro]/seccion:text-petroleo-100",
          )}
        >
          {descripcion}
        </p>
      )}
      {acciones && <div className={cn("mt-2 flex flex-wrap gap-3", centrado && "justify-center")}>{acciones}</div>}
    </header>
  );
}
