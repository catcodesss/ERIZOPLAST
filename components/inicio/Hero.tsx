import { Boton } from "@/components/ui/Boton";
import { BotonCotizar } from "@/components/ui/BotonCotizar";
import { Contenedor } from "@/components/ui/Contenedor";
import { Foto, RotuloReferencial } from "@/components/ui/Foto";
import { formatearSoles, productosPublicados } from "@/lib/productos";

// Sección 1. La foto es la protagonista: ocupa toda la portada y el degradado solo sostiene el texto.
// El bloque inferior se deja libre (pb grande) porque el panel de ventajas sube a solaparlo.
export function Hero() {
  // Precio «desde»: el más bajo de los publicados, para que el precio se vea sin bajar de la portada.
  const importes = productosPublicados().flatMap((p) => (p.precio.tipo === "referencial" ? [p.precio.soles] : []));
  const desde = importes.length ? Math.min(...importes) : null;

  return (
    <section data-tono="oscuro" className="group/seccion relative isolate overflow-hidden bg-petroleo-950 text-white">
      {/* Zoom lento de entrada: da vida a la foto sin ser un parallax */}
      <div className="absolute inset-0 -z-20 animate-hero-zoom">
        <Foto id="hero-pasillo-jabas" llenar preload rotulo={false} calidad={85} posicion="50% 60%" sizes="100vw" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-r from-petroleo-950/90 via-petroleo-950/55 to-petroleo-950/5 max-md:bg-linear-to-t max-md:from-petroleo-950/95 max-md:via-petroleo-950/70 max-md:to-petroleo-950/25"
      />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-2/5 bg-linear-to-t from-petroleo-950/85 to-transparent" />
      <RotuloReferencial posicion="arriba-der" />

      <Contenedor className="flex min-h-[38rem] items-end pb-32 pt-20 sm:pb-36 lg:min-h-[clamp(42rem,calc(100svh-8rem),56rem)] lg:items-center lg:pb-44 lg:pt-16">
        <div className="max-w-[52rem]">
          <p
            className="flex animate-entrada items-center gap-3 font-display ancho-expandido text-eyebrow font-bold uppercase text-naranja-400"
          >
            <span aria-hidden="true" className="size-2 rotate-45 bg-current" />
            Fabricantes en Lima Norte
          </p>
          <h1
            className="mt-6 animate-entrada font-display ancho-normal text-display-xl font-extrabold text-balance"
            style={{ animationDelay: "120ms" }}
          >
            Jabas plásticas industriales, <span className="text-naranja-400">directamente de fábrica</span>
          </h1>
          <p
            className="mt-6 max-w-[36rem] animate-entrada text-lg leading-relaxed text-pretty text-petroleo-50 sm:text-xl"
            style={{ animationDelay: "240ms" }}
          >
            Fabricamos y vendemos jabas plásticas al por mayor para almacenar y transportar tu mercadería. Entregas en Lima y
            envíos a todo el Perú.
          </p>
          {desde !== null && (
            <a
              href="#precios"
              className="mt-7 inline-flex animate-entrada flex-wrap items-baseline gap-x-2.5 gap-y-1 rounded-pieza border border-naranja-400/50 bg-petroleo-950/60 px-4 py-2.5 backdrop-blur-sm transition-colors hover:border-naranja-400"
              style={{ animationDelay: "300ms" }}
            >
              <span className="text-sm font-semibold uppercase tracking-[0.08em] text-petroleo-100">Desde</span>
              <span className="cifras font-display ancho-normal text-3xl font-extrabold text-naranja-400">{formatearSoles(desde)}</span>
              <span className="text-sm text-petroleo-100">por unidad · referencial, sujeto a confirmación · ver precios ↓</span>
            </a>
          )}
          <div className="mt-9 flex animate-entrada flex-wrap gap-3" style={{ animationDelay: "360ms" }}>
            <BotonCotizar tamano="lg" />
            <Boton href="/catalogo" variante="contorno-claro" tamano="lg" flecha>
              Explorar catálogo
            </Boton>
          </div>
        </div>
      </Contenedor>
    </section>
  );
}
