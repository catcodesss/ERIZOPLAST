import Image from "next/image";
import { Camera } from "lucide-react";
import { esFotoPropia, fotos, type IdFoto } from "@/data/fotos";
import { cn } from "@/lib/cn";

const relaciones = {
  "16/9": "aspect-[16/9]",
  "16/10": "aspect-[16/10]",
  "21/9": "aspect-[21/9]",
  "4/3": "aspect-[4/3]",
  "4/5": "aspect-[4/5]",
  "3/4": "aspect-[3/4]",
  "1/1": "aspect-square",
  libre: "",
} as const;

const posicionesRotulo = {
  "abajo-izq": "bottom-2.5 left-2.5",
  "abajo-der": "bottom-2.5 right-2.5",
  "arriba-izq": "left-2.5 top-2.5",
  "arriba-der": "right-2.5 top-2.5",
  // Para secciones que abren con el borde de púas (18 px de alto) y no deben pisarlo
  "arriba-der-baja": "right-2.5 top-7",
} as const;

export type PosicionRotulo = keyof typeof posicionesRotulo;

/** Rótulo fijo para toda foto de banco: deja claro que no es una instalación ni un producto de PLASTINORTE. */
export function RotuloReferencial({ posicion = "abajo-izq", className }: { posicion?: PosicionRotulo; className?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute z-10 rounded-pieza bg-petroleo-950/75 px-2 py-1 font-mono text-[0.6875rem] uppercase leading-none tracking-[0.12em] text-white backdrop-blur-sm",
        posicionesRotulo[posicion],
        className,
      )}
    >
      Imagen referencial
    </span>
  );
}

type Props = {
  /** Foto de banco registrada en data/fotos.ts: lleva su texto alternativo, placeholder y rótulo. */
  id?: IdFoto;
  /** Foto propia (p. ej. de un producto). Sin `id` ni `src` se muestra el marcador de foto pendiente. */
  src?: string;
  alt?: string;
  /** Texto del marcador: qué foto real hace falta aquí. */
  pendiente?: string;
  relacion?: keyof typeof relaciones;
  /** Llena el contenedor padre (posición absoluta). Para fondos a pantalla completa. */
  llenar?: boolean;
  /** Precarga la imagen: solo para la foto principal de la página (LCP). */
  preload?: boolean;
  sizes?: string;
  /** Valor CSS de object-position, para decidir qué parte de la foto sobrevive al recorte. */
  posicion?: string;
  /** Posición del rótulo «Imagen referencial» (solo con `id`); `false` si el llamador lo pone aparte. */
  rotulo?: PosicionRotulo | false;
  calidad?: 75 | 85;
  className?: string;
};

// Todas las fotos del sitio pasan por aquí. Las de banco son siempre REFERENCIALES y se rotulan;
// mientras no existan fotos propias, nunca se presentan como la planta, los productos o la flota.
export function Foto({
  id,
  src,
  alt,
  pendiente,
  relacion = "4/3",
  llenar = false,
  preload = false,
  sizes,
  posicion,
  rotulo = "abajo-izq",
  calidad,
  className,
}: Props) {
  const foto = id ? fotos[id] : undefined;
  const origen = foto?.src ?? src;
  const textoAlt = alt ?? foto?.alt ?? "";

  // `relative` y `absolute` no pueden convivir: en el CSS generado gana `relative` y el contenedor colapsa.
  const caja = cn("overflow-hidden bg-petroleo-800", llenar ? "absolute inset-0" : `relative ${relaciones[relacion]}`, className);

  if (origen) {
    return (
      <div className={caja}>
        <Image
          src={origen}
          alt={textoAlt}
          fill
          preload={preload}
          quality={calidad}
          placeholder={foto?.blur ? "blur" : "empty"}
          blurDataURL={foto?.blur || undefined}
          sizes={sizes ?? (llenar ? "100vw" : "(min-width: 1024px) 50vw, 100vw")}
          style={posicion ? { objectPosition: posicion } : undefined}
          className="object-cover"
        />
        {/* Solo las fotos de banco llevan el rótulo: una foto propia no es «referencial» */}
        {foto && !esFotoPropia(foto) && rotulo && <RotuloReferencial posicion={rotulo} />}
      </div>
    );
  }

  return (
    <div role="img" aria-label={`Foto pendiente: ${textoAlt}`} className={cn(caja, "textura-calada-clara")}>
      <div className="absolute inset-0 bg-linear-to-br from-petroleo-600/70 via-petroleo-800/40 to-petroleo-950/80" />
      {/* En fondos a pantalla completa el rótulo se retira a una esquina para no pisar el titular */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col gap-3 p-6",
          llenar ? "items-end justify-end text-right max-md:hidden" : "items-center justify-center text-center",
        )}
      >
        <Camera aria-hidden="true" className="size-7 text-petroleo-200" strokeWidth={1.5} />
        <p className="max-w-[18rem] font-mono text-[0.6875rem] uppercase leading-relaxed tracking-[0.12em] text-petroleo-200">
          Foto pendiente
          <span className="mt-1 block text-petroleo-100/90">{pendiente ?? textoAlt}</span>
        </p>
      </div>
    </div>
  );
}
