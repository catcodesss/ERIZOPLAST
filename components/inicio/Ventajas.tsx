import { BadgePercent, Factory, Truck } from "lucide-react";
import { Contenedor } from "@/components/ui/Contenedor";
import { Reveal } from "@/components/ui/Reveal";

// Sección 2. Composición horizontal: un panel petróleo que sube a solapar el borde inferior de la
// portada (rompe la separación "hero / resto") con una columna de introducción y tres ventajas.
// Cada ventaja lleva un numeral de contorno que se rellena de naranja al pasar el cursor.
const ventajas = [
  {
    icono: Factory,
    titulo: "Fabricantes directos",
    texto: "Producimos nosotros mismos lo que vendemos, sin intermediarios entre la fábrica y tu negocio.",
  },
  {
    icono: BadgePercent,
    titulo: "Precios competitivos por volumen",
    texto: "Vender directo nos permite ofrecer precios pensados para compras por volumen. Pídenos una cotización.",
  },
  {
    icono: Truck,
    titulo: "Transporte propio y cobertura nacional",
    texto: "Entregamos con nuestra propia flota en Lima Metropolitana y enviamos a todo el Perú.",
  },
] as const;

export function Ventajas() {
  return (
    <section aria-labelledby="ventajas-titulo" data-tono="oscuro" className="group/seccion relative z-10 -mt-20 sm:-mt-24 lg:-mt-32">
      <Contenedor>
        <Reveal className="relative overflow-hidden rounded-tarjeta bg-petroleo-700 text-white shadow-elevada textura-calada-clara">
          <span aria-hidden="true" className="regla-reveal absolute inset-x-0 top-0 z-10 h-1 bg-naranja-500" />
          <div className="grid lg:grid-cols-12">
            <div className="p-7 pt-9 lg:col-span-3 lg:p-10 lg:pt-12">
              <p className="flex items-center gap-3 font-display ancho-expandido text-eyebrow leading-snug font-bold uppercase text-naranja-400">
                <span aria-hidden="true" className="size-2 shrink-0 rotate-45 bg-current" />
                Por qué PLASTINORTE
              </p>
              <h2 id="ventajas-titulo" className="mt-5 font-display ancho-normal text-display-md font-extrabold text-balance">
                Comprar directo, sin vueltas
              </h2>
            </div>

            {ventajas.map(({ icono: Icono, titulo, texto }, i) => (
              <div
                key={titulo}
                className="group/ventaja border-t border-white/12 p-7 transition-colors duration-500 hover:bg-petroleo-800/60 lg:col-span-3 lg:border-l lg:border-t-0 lg:p-10 lg:pt-12"
              >
                {/* Numeral e icono en una fila: en móvil ahorra una franja entera por ventaja */}
                <div className="flex items-start justify-between lg:block">
                  <span
                    aria-hidden="true"
                    className="texto-contorno block font-display ancho-expandido text-[3.5rem] font-black leading-none transition-colors duration-500 group-hover/ventaja:text-naranja-500 group-hover/ventaja:[--trazo:var(--color-naranja-500)] lg:text-[5rem]"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="grid size-12 place-items-center rounded-pieza bg-white/10 text-naranja-400 transition-colors duration-500 group-hover/ventaja:bg-naranja-500 group-hover/ventaja:text-petroleo-950 lg:mt-6">
                    <Icono aria-hidden="true" className="size-6" strokeWidth={1.5} />
                  </span>
                </div>
                <h3 className="mt-5 font-display ancho-normal text-display-sm font-extrabold text-balance">{titulo}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-petroleo-100">{texto}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Contenedor>
    </section>
  );
}
