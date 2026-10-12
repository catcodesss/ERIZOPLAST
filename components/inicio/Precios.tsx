import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AVISO_PRECIOS, formatearMedidas, formatearSoles, nombreCategoria, productosPublicados } from "@/lib/productos";
import { BotonCotizar } from "@/components/ui/BotonCotizar";
import { Contenedor } from "@/components/ui/Contenedor";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { Reveal } from "@/components/ui/Reveal";
import { Seccion } from "@/components/ui/Seccion";

// Lista de precios, justo debajo de la portada: el usuario pidió que el precio sea de lo primero que se vea.
// Arriba los modelos con precio referencial (el importe manda: es lo más grande de cada pieza); debajo, en una
// fila discreta, los que aún se cotizan. Sin precios publicados, la sección no se pinta.
export function Precios() {
  const productos = productosPublicados();
  const conPrecio = productos
    .flatMap((p) => (p.precio.tipo === "referencial" ? [{ producto: p, soles: p.precio.soles }] : []))
    .sort((a, b) => a.soles - b.soles);
  const sinPrecio = productos.filter((p) => p.precio.tipo !== "referencial");
  if (!conPrecio.length) return null;

  return (
    <Seccion fondo="concreto" espaciado="compacto" id="precios">
      <Contenedor>
        <Reveal>
          <EncabezadoSeccion
            sobretitulo="Lista de precios"
            titulo="Precios directos de fábrica"
            tamano="md"
            descripcion="Precio por unidad en soles. Por volumen te cotizamos mejor."
          />
        </Reveal>

        <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {conPrecio.map(({ producto, soles }, i) => (
            <Reveal as="li" key={producto.slug} retraso={i * 90} className="h-full">
              <article className="relative flex h-full flex-col rounded-tarjeta border border-concreto-200 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-elevada">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 rounded-t-tarjeta bg-naranja-500" />
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-concreto-600">
                  {nombreCategoria(producto.categorias[0])}
                </p>
                <h3 className="mt-1.5 font-display ancho-normal text-lg font-extrabold leading-tight text-petroleo-800">
                  <Link href={`/catalogo/${producto.slug}`} className="hover:text-petroleo-600">
                    {producto.nombre}
                  </Link>
                </h3>
                <p className="cifras mt-1 text-sm text-concreto-600">{formatearMedidas(producto.medidas)}</p>

                <p className="mt-5 flex flex-wrap items-baseline gap-x-2">
                  <span className="cifras font-display ancho-normal text-display-md font-extrabold text-petroleo-800">
                    {formatearSoles(soles)}
                  </span>
                  <span className="text-sm text-concreto-600">por unidad · referencial</span>
                </p>

                <div className="mt-auto pt-5">
                  <BotonCotizar producto={producto.slug} tamano="md" bloque>
                    Cotizar por volumen
                  </BotonCotizar>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>

        {sinPrecio.length > 0 && (
          <div className="mt-6 rounded-tarjeta border border-dashed border-concreto-300 px-5 py-4 text-sm text-concreto-700">
            <span className="font-semibold text-petroleo-800">Precio a consultar: </span>
            {sinPrecio.map((p, i) => (
              <span key={p.slug}>
                {i > 0 && " · "}
                <Link href={`/catalogo/${p.slug}`} className="underline decoration-concreto-300 underline-offset-4 hover:text-petroleo-600">
                  {p.nombre}
                </Link>
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <p className="max-w-prose text-sm leading-relaxed text-concreto-600">{AVISO_PRECIOS}</p>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 font-display ancho-normal text-[0.8125rem] font-bold uppercase tracking-[0.07em] text-naranja-700 hover:text-petroleo-700"
          >
            Ver catálogo con precios
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </Contenedor>
    </Seccion>
  );
}
