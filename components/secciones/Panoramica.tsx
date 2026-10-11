import type { ReactNode } from "react";
import type { IdFoto } from "@/data/fotos";
import { cn } from "@/lib/cn";
import { Contenedor } from "@/components/ui/Contenedor";
import { Foto, RotuloReferencial } from "@/components/ui/Foto";

type Props = {
  /** Foto de banco registrada en data/fotos.ts. Sin ella aparece el marcador de foto pendiente. */
  foto?: IdFoto;
  alt?: string;
  pendiente?: string;
  /** object-position de la foto. */
  posicion?: string;
  /** Lado del que sale el degradado que sostiene el texto. */
  lado?: "izquierda" | "abajo";
  altura?: "media" | "alta";
  preload?: boolean;
  className?: string;
  children: ReactNode;
};

const alturas = {
  media: "min-h-[26rem] md:min-h-[30rem]",
  alta: "min-h-[34rem] md:min-h-[40rem] lg:min-h-[44rem]",
} as const;

// Imagen a todo el ancho de pantalla con el texto encima. El degradado petróleo garantiza
// contraste del texto sea cual sea la foto final.
export function Panoramica({ foto, alt, pendiente, posicion, lado = "izquierda", altura = "media", preload = false, className, children }: Props) {
  return (
    <section data-tono="oscuro" className={cn("group/seccion relative isolate overflow-hidden bg-petroleo-950 text-white", className)}>
      <Foto llenar id={foto} alt={alt} pendiente={pendiente} posicion={posicion} preload={preload} rotulo={false} className="-z-20" />
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 -z-10",
          lado === "izquierda"
            ? "bg-linear-to-r from-petroleo-950/92 via-petroleo-950/70 to-petroleo-950/10 max-md:bg-linear-to-t max-md:from-petroleo-950/95 max-md:via-petroleo-950/70 max-md:to-petroleo-950/30"
            : "bg-linear-to-t from-petroleo-950/95 via-petroleo-950/55 to-transparent",
        )}
      />
      {foto && <RotuloReferencial posicion="arriba-der" />}
      <Contenedor className={cn("flex flex-col justify-end py-14 md:justify-center md:py-20", alturas[altura])}>
        {children}
      </Contenedor>
    </section>
  );
}
