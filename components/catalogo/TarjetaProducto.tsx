import Link from "next/link";
import { Layers, Ruler, Weight } from "lucide-react";
import type { Producto } from "@/data/tipos";
import { formatearMedidas, nombreCategoria } from "@/lib/productos";
import { BotonCotizar } from "@/components/ui/BotonCotizar";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { FotoProducto } from "./FotoProducto";
import { PrecioProducto } from "./PrecioProducto";

type Props = {
  producto: Producto;
  /** Marca la tarjeta como dato ilustrativo (solo para el sistema de diseño). */
  ejemplo?: boolean;
  /** Precarga la foto: solo para la primera tarjeta a la vista (candidata a LCP). */
  preloadFoto?: boolean;
};

// Tarjeta de producto: la foto manda, y las medidas — el dato que más busca el comprador —
// van en tipografía de ficha técnica, no escondidas en una descripción. La tarjeta entera lleva a la
// ficha (enlace extendido sobre el nombre); el botón de cotizar queda por encima para seguir siendo clicable.
export function TarjetaProducto({ producto, ejemplo = false, preloadFoto = false }: Props) {
  const nombreFamilia = nombreCategoria(producto.categorias[0]);
  const otrasMedidas = producto.otrasMedidas?.length ?? 0;

  return (
    <Tarjeta interactiva className="group/producto flex h-full flex-col overflow-hidden">
      <div className="relative overflow-hidden">
        <div className="transition-transform duration-700 ease-industrial group-hover/producto:scale-[1.04]">
          <FotoProducto producto={producto} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" preload={preloadFoto} />
        </div>
        <div className="absolute right-3 top-3 flex gap-2">
          <Etiqueta tono="oscuro">{producto.material}</Etiqueta>
          {ejemplo && <Etiqueta tono="naranja">Ejemplo</Etiqueta>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-concreto-600">{nombreFamilia}</p>
          <h3 className="mt-1.5 font-display ancho-normal text-xl font-extrabold leading-tight text-petroleo-800">
            {ejemplo ? (
              producto.nombre
            ) : (
              <Link
                href={`/catalogo/${producto.slug}`}
                className="after:absolute after:inset-0 after:content-[''] hover:text-petroleo-600 focus-visible:outline-offset-4"
              >
                {producto.nombre}
              </Link>
            )}
          </h3>
          {producto.resumen && <p className="mt-2 text-[0.9375rem] leading-snug text-concreto-700">{producto.resumen}</p>}
        </div>

        <dl className="grid grid-cols-1 gap-y-2 border-y border-concreto-200 py-3.5 text-sm">
          <div className="flex items-center gap-2.5">
            <Ruler aria-hidden="true" className="size-4 shrink-0 text-petroleo-500" />
            <dt className="sr-only">Medidas</dt>
            <dd className="cifras font-medium text-petroleo-900">
              {formatearMedidas(producto.medidas)}
              {otrasMedidas > 0 && <span className="ml-2 font-normal text-concreto-600">+ {otrasMedidas} tamaños</span>}
            </dd>
          </div>
          {producto.capacidadLitros !== undefined && (
            <div className="flex items-center gap-2.5">
              <Layers aria-hidden="true" className="size-4 shrink-0 text-petroleo-500" />
              <dt className="sr-only">Capacidad</dt>
              <dd className="cifras text-concreto-700">{producto.capacidadLitros} L</dd>
            </div>
          )}
          {producto.cargaKg !== undefined && (
            <div className="flex items-center gap-2.5">
              <Weight aria-hidden="true" className="size-4 shrink-0 text-petroleo-500" />
              <dt className="sr-only">Carga</dt>
              <dd className="cifras text-concreto-700">hasta {producto.cargaKg} kg</dd>
            </div>
          )}
        </dl>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-3 pt-1">
          <PrecioProducto precio={producto.precio} />
          <BotonCotizar producto={ejemplo ? undefined : producto.slug} tamano="md" className="relative z-10">
            Solicitar cotización
          </BotonCotizar>
        </div>
      </div>
    </Tarjeta>
  );
}
