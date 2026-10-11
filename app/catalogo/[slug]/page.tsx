import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import {
  AVISO_MEDIDAS,
  etiquetaDisponibilidad,
  formatearMedidas,
  modeloPendiente,
  nombreCategoria,
  obtenerProducto,
  productosPublicados,
  textoPrecio,
} from "@/lib/productos";
import { AvisoModeloReferencial } from "@/components/catalogo/AvisoModeloReferencial";
import { FotoProducto } from "@/components/catalogo/FotoProducto";
import { PrecioProducto } from "@/components/catalogo/PrecioProducto";
import { TarjetaProducto } from "@/components/catalogo/TarjetaProducto";
import { BotonCotizar } from "@/components/ui/BotonCotizar";
import { CotizacionRapida } from "@/components/ui/CotizacionRapida";
import { Contenedor } from "@/components/ui/Contenedor";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Seccion } from "@/components/ui/Seccion";
import { DatosEstructurados } from "@/components/seo/DatosEstructurados";
import { urlSitio } from "@/lib/sitio";

type Props = { params: Promise<{ slug: string }> };

// Con cacheComponents, una ruta dinámica necesita al menos un parámetro conocido (si no hay productos
// publicados, el build falla a propósito: un catálogo vacío no debería publicar fichas).
export function generateStaticParams() {
  return productosPublicados().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const producto = obtenerProducto(slug);
  if (!producto) return {};
  return {
    title: producto.nombre,
    description: `${producto.resumen} Medidas ${formatearMedidas(producto.medidas)}. ${textoPrecio(producto.precio)}. Venta de jabas plásticas en Lima y todo el Perú.`,
  };
}

export default async function FichaProducto({ params }: Props) {
  const { slug } = await params;
  const producto = obtenerProducto(slug);
  if (!producto) notFound();

  const relacionados = productosPublicados()
    .filter((p) => p.slug !== producto.slug && p.categorias.some((c) => producto.categorias.includes(c)))
    .slice(0, 3);

  const todasLasMedidas = [producto.medidas, ...(producto.otrasMedidas ?? [])];
  const pendiente = modeloPendiente(producto);

  const datos: { etiqueta: string; valor: string }[] = [
    { etiqueta: todasLasMedidas.length > 1 ? "Medida principal (L × A × H)" : "Medidas exteriores (L × A × H)", valor: formatearMedidas(producto.medidas) },
    ...(producto.capacidadLitros !== undefined ? [{ etiqueta: "Capacidad", valor: `${producto.capacidadLitros} L` }] : []),
    ...(producto.cargaKg !== undefined ? [{ etiqueta: "Carga", valor: `hasta ${producto.cargaKg} kg` }] : []),
    {
      etiqueta: "Material",
      // Mientras la empresa no confirme el modelo, el material es el de referencia: se dice en la propia fila.
      valor: `${producto.material === "PEAD" ? "PEAD (polietileno de alta densidad)" : "PP (polipropileno)"}${pendiente ? " · a confirmar" : ""}`,
    },
    { etiqueta: "Acabado", valor: producto.acabado.charAt(0).toUpperCase() + producto.acabado.slice(1) },
    { etiqueta: "Colores", valor: producto.colores.length ? producto.colores.join(", ") : "A consultar" },
    { etiqueta: "Disponibilidad", valor: etiquetaDisponibilidad(producto.disponibilidad) },
  ];

  return (
    <>
      <DatosEstructurados
        datos={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: `${urlSitio()}/` },
            { "@type": "ListItem", position: 2, name: "Catálogo", item: `${urlSitio()}/catalogo` },
            { "@type": "ListItem", position: 3, name: producto.nombre, item: `${urlSitio()}/catalogo/${producto.slug}` },
          ],
        }}
      />
      <Seccion fondo="blanco" espaciado="compacto">
        <Contenedor>
          <nav aria-label="Ruta" className="mb-8">
            <Link
              href={`/catalogo/categoria/${producto.categorias[0]}`}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-petroleo-700 hover:text-naranja-700"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Catálogo · {nombreCategoria(producto.categorias[0])}
            </Link>
          </nav>

          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            {/* La foto acompaña al lector mientras baja por la tabla de datos (la columna derecha es más larga) */}
            <div className="lg:sticky lg:top-28 lg:col-span-6 lg:self-start">
              <div className="overflow-hidden rounded-tarjeta border border-concreto-300">
                <FotoProducto producto={producto} sizes="(min-width: 1024px) 45vw, 100vw" preload />
              </div>
              {!producto.imagenes.length && (
                <p className="mt-3 text-sm text-concreto-600">
                  {producto.fotoReferencial
                    ? "Fotografía referencial. Estamos preparando fotos propias de este modelo."
                    : "Esquema con las medidas del modelo, no una fotografía. Estamos preparando fotos propias."}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-7 lg:col-span-6">
              <header>
                <div className="flex flex-wrap gap-2">
                  {producto.categorias.map((c) => (
                    <Etiqueta key={c} tono="petroleo">
                      {nombreCategoria(c)}
                    </Etiqueta>
                  ))}
                </div>
                <h1 className="mt-4 font-display ancho-normal text-display-lg font-extrabold text-balance text-petroleo-800">
                  {producto.nombre}
                </h1>
                <p className="mt-4 max-w-prose text-lg leading-relaxed text-concreto-700">{producto.resumen}</p>
              </header>

              {pendiente && <AvisoModeloReferencial alcance="ficha" />}

              <div className="rounded-tarjeta bg-concreto-100 p-5 sm:p-6">
                <PrecioProducto precio={producto.precio} completo />
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <BotonCotizar producto={producto.slug} tamano="lg">
                    Solicitar cotización
                  </BotonCotizar>
                  <p className="text-sm text-concreto-600">Se abre WhatsApp con este modelo ya indicado.</p>
                </div>
                <CotizacionRapida producto={producto.slug} className="mt-4 border-t border-concreto-300 pt-3" />
              </div>

              <dl className="divide-y divide-concreto-200 border-y border-concreto-200">
                {datos.map(({ etiqueta, valor }) => (
                  <div key={etiqueta} className="grid grid-cols-5 gap-3 py-3 text-[0.9375rem]">
                    <dt className="col-span-2 text-concreto-600">{etiqueta}</dt>
                    <dd className="cifras col-span-3 font-medium text-petroleo-900">{valor}</dd>
                  </div>
                ))}
              </dl>

              {todasLasMedidas.length > 1 && (
                <div>
                  <h2 className="font-display ancho-normal text-lg font-extrabold text-petroleo-800">Tamaños disponibles</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {todasLasMedidas.map((m) => (
                      <li key={formatearMedidas(m)} className="cifras rounded-pieza border border-concreto-300 px-3 py-1.5 text-sm text-petroleo-900">
                        {formatearMedidas(m)}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm text-concreto-600">Indícanos el tamaño que necesitas al cotizar.</p>
                </div>
              )}

              <p className="text-sm leading-relaxed text-concreto-600">{AVISO_MEDIDAS}</p>
            </div>
          </div>

          <div className="mt-14 grid gap-10 border-t border-concreto-200 pt-10 md:grid-cols-2">
            <section>
              <h2 className="font-display ancho-normal text-display-sm font-extrabold text-petroleo-800">Características</h2>
              <ul className="mt-4 space-y-2.5">
                {producto.caracteristicas.map((c) => (
                  <li key={c} className="flex gap-3 text-concreto-700">
                    <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-naranja-600" />
                    {c}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="font-display ancho-normal text-display-sm font-extrabold text-petroleo-800">Usos frecuentes</h2>
              <ul className="mt-4 space-y-2.5">
                {producto.usos.map((u) => (
                  <li key={u} className="flex gap-3 text-concreto-700">
                    <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-naranja-600" />
                    {u}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </Contenedor>
      </Seccion>

      {relacionados.length > 0 && (
        <Seccion fondo="concreto" espaciado="compacto">
          <Contenedor>
            <h2 className="font-display ancho-normal text-display-md font-extrabold text-petroleo-800">Otros modelos que te pueden servir</h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relacionados.map((p) => (
                <li key={p.slug}>
                  <TarjetaProducto producto={p} />
                </li>
              ))}
            </ul>
          </Contenedor>
        </Seccion>
      )}
    </>
  );
}
