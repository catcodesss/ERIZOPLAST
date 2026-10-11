import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { lineasDestacadas, type LineaDestacada } from "@/data/lineas";
import { Boton } from "@/components/ui/Boton";
import { Contenedor } from "@/components/ui/Contenedor";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { Foto, RotuloReferencial } from "@/components/ui/Foto";
import { Reveal } from "@/components/ui/Reveal";
import { Seccion } from "@/components/ui/Seccion";

// Sección 3. Vista previa del catálogo, no su copia: tres líneas y un acceso al catálogo completo,
// en un mosaico con tamaños distintos (una pieza alta, una ancha, dos pequeñas).
// Cada pieza es un enlace entero; la foto se acerca despacio y la flecha avanza al pasar el cursor.

// Medidas por pieza: en móvil cada una es una caja con su proporción; en tablet (2 columnas) la pieza alta
// ocupa dos filas; en escritorio manda la rejilla de 12 columnas. La pieza alta nunca se recorta a
// horizontal: su foto solo es segura en formato vertical (ver data/lineas.ts).
const disposicion = [
  "aspect-[4/5] md:row-span-2 md:aspect-auto lg:col-span-5",
  "aspect-[4/3] lg:col-span-7 lg:aspect-auto",
  "aspect-[4/3] lg:col-span-4 lg:aspect-auto",
] as const;

const tamanosFoto = "(min-width: 1024px) 45vw, 100vw";

function PiezaLinea({ linea, className }: { linea: LineaDestacada; className: string }) {
  return (
    <Link
      href={`/catalogo/categoria/${linea.categoria}`}
      className={`group/pieza relative block overflow-hidden rounded-tarjeta bg-petroleo-900 ${className}`}
    >
      <div className="absolute inset-0 transition-transform duration-700 ease-industrial group-hover/pieza:scale-[1.05]">
        <Foto id={linea.foto} llenar rotulo={false} posicion={linea.posicion} sizes={tamanosFoto} />
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-petroleo-950/95 via-petroleo-950/50 to-petroleo-950/5" />
      <RotuloReferencial posicion="arriba-izq" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-white lg:p-7">
        <h3 className="max-w-[16ch] font-display ancho-normal text-display-md font-extrabold text-balance">{linea.nombre}</h3>
        <p className="mt-2 max-w-[30ch] text-[0.9375rem] leading-snug text-petroleo-100">{linea.texto}</p>
        <span className="mt-4 inline-flex items-center gap-2 font-display ancho-normal text-[0.8125rem] font-bold uppercase tracking-[0.07em] text-naranja-400">
          Ver línea
          <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 ease-industrial group-hover/pieza:translate-x-1.5" />
        </span>
      </div>
    </Link>
  );
}

export function LineasDestacadas() {
  return (
    <Seccion fondo="blanco" id="lineas">
      <Contenedor>
        <div className="grid items-end gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-8">
            <EncabezadoSeccion
              sobretitulo="Catálogo"
              titulo="Jabas para cada operación"
              descripcion="Una muestra de nuestras líneas. El catálogo completo reúne las medidas, la capacidad y el material de cada jaba."
            />
          </Reveal>
          <Reveal retraso={120} className="lg:col-span-4 lg:justify-self-end">
            <Boton href="/catalogo" variante="texto" flecha>
              Ver catálogo completo
            </Boton>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:mt-14 lg:grid-cols-12 lg:grid-rows-[22rem_22rem] lg:gap-5">
          {lineasDestacadas.map((linea, i) => (
            <Reveal key={linea.categoria} retraso={i * 110} className={disposicion[i]}>
              <PiezaLinea linea={linea} className="h-full w-full" />
            </Reveal>
          ))}

          <Reveal retraso={330} className="aspect-[4/3] md:col-span-2 md:aspect-[21/9] lg:col-span-3 lg:aspect-auto">
            <Link
              href="/catalogo"
              className="group/pieza relative block h-full w-full overflow-hidden rounded-tarjeta bg-petroleo-900 text-white"
            >
              <div className="absolute inset-0 transition-transform duration-700 ease-industrial group-hover/pieza:scale-[1.05]">
                <Foto id="catalogo-jabas-encajables" llenar rotulo={false} posicion="50% 55%" sizes="(min-width: 1024px) 25vw, 100vw" />
              </div>
              <div aria-hidden="true" className="absolute inset-0 bg-petroleo-950/75 transition-colors duration-500 group-hover/pieza:bg-petroleo-950/65" />
              <RotuloReferencial posicion="arriba-izq" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6">
                <p className="font-display ancho-expandido text-eyebrow font-bold uppercase text-naranja-400">Catálogo completo</p>
                <p className="font-display ancho-normal text-display-sm font-extrabold text-balance">Más líneas, medidas y colores</p>
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-naranja-500 text-petroleo-950 transition-transform duration-300 ease-industrial group-hover/pieza:translate-x-1.5">
                  <ArrowRight aria-hidden="true" className="size-5" />
                </span>
              </div>
            </Link>
          </Reveal>
        </div>

        <p className="mt-6 max-w-2xl text-sm text-concreto-600">
          Fotografías referenciales. Las medidas, los colores y la disponibilidad de cada jaba se confirman al cotizar.
        </p>
      </Contenedor>
    </Seccion>
  );
}
