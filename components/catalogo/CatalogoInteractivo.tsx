"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PackageSearch, Search, X } from "lucide-react";
import { CATEGORIAS, type IdCategoria } from "@/data/categorias";
import type { Producto } from "@/data/tipos";
import { normalizarBusqueda, textoBuscable } from "@/lib/productos";
import { cn } from "@/lib/cn";
import { BotonCotizar } from "@/components/ui/BotonCotizar";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { TarjetaProducto } from "./TarjetaProducto";

type Props = {
  /** Productos de la página actual: toda la lista en /catalogo, solo los de la categoría en /catalogo/categoria/<id>. */
  productos: Producto[];
  /** Todos los publicados: de aquí salen los contadores de la barra de categorías. */
  todos: Producto[];
  categoria?: IdCategoria;
};

const rutaCategoria = (id: IdCategoria | "todas") => (id === "todas" ? "/catalogo" : `/catalogo/categoria/${id}`);

// Categorías = enlaces a su propia página (HTML estático, rastreable, sin saltos de diseño al cambiar). Aquí solo
// queda en el navegador la búsqueda por nombre sobre la lista que llega del servidor: sin API ni base de datos.
// El servidor pinta la barra y la lista completas, y el navegador las hidrata en el sitio.
export function CatalogoInteractivo({ productos, todos, categoria }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const filaFiltros = useRef<HTMLDivElement>(null);
  const enlaceActivo = useRef<HTMLAnchorElement>(null);

  // En móvil las categorías van en una fila con scroll horizontal: la activa se deja a la vista en vez de
  // esconderla fuera de la pantalla (cada categoría es otra página, así que esto corre en cada una).
  useEffect(() => {
    const fila = filaFiltros.current;
    const enlace = enlaceActivo.current;
    if (fila && enlace && fila.scrollWidth > fila.clientWidth) fila.scrollLeft = Math.max(0, enlace.offsetLeft - 28);
  }, []);

  const cuentas = useMemo(() => {
    const porCategoria = new Map<IdCategoria | "todas", number>([["todas", todos.length]]);
    for (const c of CATEGORIAS) porCategoria.set(c.id, todos.filter((p) => p.categorias.includes(c.id)).length);
    return porCategoria;
  }, [todos]);

  const indice = useMemo(() => productos.map((p) => ({ producto: p, texto: textoBuscable(p) })), [productos]);

  const consulta = normalizarBusqueda(busqueda);
  const visibles = indice.filter(({ texto }) => !consulta || texto.includes(consulta)).map(({ producto }) => producto);

  const activa: IdCategoria | "todas" = categoria ?? "todas";

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Móvil: una fila que se desliza y sale a sangre de pantalla, con los bordes desvanecidos como pista.
            Escritorio: las categorías se reparten en varias líneas. */}
        <nav
          ref={filaFiltros}
          aria-label="Categorías del catálogo"
          className="relative -mx-5 -my-1 flex gap-2 overflow-x-auto px-5 py-1 [scrollbar-width:none] sm:-mx-8 sm:px-8 max-lg:[mask-image:linear-gradient(to_right,transparent,black_1.25rem,black_calc(100%-2.5rem),transparent)] lg:mx-0 lg:my-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:py-0 [&::-webkit-scrollbar]:hidden"
        >
          {([{ id: "todas", nombre: "Todas" }, ...CATEGORIAS] as { id: IdCategoria | "todas"; nombre: string }[]).map(({ id, nombre }) => {
            const esActiva = activa === id;
            return (
              <Link
                key={id}
                ref={esActiva ? enlaceActivo : undefined}
                href={rutaCategoria(id)}
                // scroll={false}: al cambiar de categoría la persona se queda donde estaba, no vuelve arriba.
                scroll={false}
                aria-current={esActiva ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-pieza border px-3.5 text-sm font-medium transition-colors duration-200",
                  esActiva
                    ? "border-petroleo-700 bg-petroleo-700 text-white"
                    : "border-concreto-300 bg-white text-petroleo-800 hover:border-petroleo-500 hover:bg-petroleo-50",
                )}
              >
                {nombre}
                <span className={cn("cifras text-xs", esActiva ? "text-petroleo-200" : "text-concreto-600")}>{cuentas.get(id)}</span>
              </Link>
            );
          })}
        </nav>

        <form role="search" onSubmit={(e) => e.preventDefault()} className="relative w-full lg:max-w-xs">
          <label htmlFor="buscar-producto" className="sr-only">
            Buscar por nombre
          </label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-concreto-500" />
          <input
            id="buscar-producto"
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar: cosechera, pescado, 60x40…"
            autoComplete="off"
            className="min-h-11 w-full rounded-pieza border border-concreto-300 bg-white pl-10 pr-10 text-[0.9375rem] text-petroleo-900 placeholder:text-concreto-500 focus-visible:border-petroleo-500"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda("")}
              aria-label="Borrar búsqueda"
              className="absolute right-1 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-pieza text-concreto-600 hover:text-petroleo-800"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          )}
        </form>
      </div>

      <p role="status" aria-live="polite" className="mt-5 font-mono text-xs uppercase tracking-[0.12em] text-concreto-600">
        {visibles.length === 1 ? "1 modelo" : `${visibles.length} modelos`}
      </p>

      {visibles.length > 0 ? (
        <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((p, i) => (
            <li key={p.slug}>
              <TarjetaProducto producto={p} preloadFoto={i === 0} />
            </li>
          ))}
        </ul>
      ) : (
        <Tarjeta variante="plana" className="mx-auto mt-6 flex max-w-2xl flex-col items-center gap-5 px-6 py-12 text-center sm:px-12">
          <PackageSearch aria-hidden="true" className="size-12 text-petroleo-500" strokeWidth={1.25} />
          {productos.length === 0 && !consulta ? (
            <>
              <h2 className="font-display ancho-normal text-display-sm font-extrabold text-petroleo-800">
                Aún no publicamos un modelo en esta categoría
              </h2>
              <p className="text-pretty text-concreto-700">
                Cuéntanos qué medidas necesitas y te decimos si lo fabricamos o qué alternativa te conviene.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <BotonCotizar tamano="lg">Consultar por WhatsApp</BotonCotizar>
                <Link
                  href="/catalogo"
                  className="inline-flex min-h-14 items-center px-4 font-display ancho-normal text-sm font-bold uppercase tracking-[0.07em] text-petroleo-800 hover:text-naranja-700"
                >
                  Ver todo el catálogo
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-display ancho-normal text-display-sm font-extrabold text-petroleo-800">Sin resultados</h2>
              <p className="text-pretty text-concreto-700">
                No encontramos modelos con esa búsqueda{categoria ? " en esta categoría" : ""}. Prueba otra palabra o quita el
                filtro.
              </p>
              <button
                type="button"
                onClick={() => setBusqueda("")}
                className="min-h-11 font-display ancho-normal text-sm font-bold uppercase tracking-[0.07em] text-petroleo-800 hover:text-naranja-700"
              >
                Limpiar búsqueda
              </button>
            </>
          )}
        </Tarjeta>
      )}
    </div>
  );
}
