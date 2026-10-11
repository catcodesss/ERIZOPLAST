import { Check, Mail } from "lucide-react";
import { empresa } from "@/data/empresa";
import { BotonCotizar } from "@/components/ui/BotonCotizar";
import { CotizacionRapida } from "@/components/ui/CotizacionRapida";
import { Contenedor } from "@/components/ui/Contenedor";
import { DivisorPuas } from "@/components/ui/DivisorPuas";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { Foto, RotuloReferencial } from "@/components/ui/Foto";
import { Reveal } from "@/components/ui/Reveal";

// Sección 6. Un solo mensaje y una sola acción. La pared de jabas naranjas hace de fondo (es del
// color del acento de la marca) y el degradado petróleo deja el texto a la izquierda, legible.
const garantias = ["Venta directa de fábrica", "Precios competitivos por volumen", "Envíos a todo el Perú"] as const;

export function Cierre() {
  return (
    <section
      id="cotizar"
      aria-labelledby="cierre-titulo"
      data-tono="oscuro"
      className="group/seccion relative isolate overflow-hidden bg-petroleo-950 py-seccion pb-[calc(var(--spacing-seccion)+1.5rem)] text-white"
    >
      <Foto id="cta-jabas-naranjas" llenar rotulo={false} posicion="50% 35%" sizes="100vw" className="-z-20" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-r from-petroleo-950/92 via-petroleo-950/68 to-petroleo-950/10 max-md:bg-petroleo-950/82"
      />
      {/* Púas hacia abajo: el bloque oscuro anterior se corta en sierra sobre la foto */}
      <DivisorPuas sentido="abajo" className="absolute inset-x-0 top-0 text-petroleo-950" />
      <RotuloReferencial posicion="arriba-der-baja" />

      <Contenedor>
        <Reveal className="max-w-[42rem]">
          <EncabezadoSeccion
            sobretitulo="Cotiza hoy"
            titulo={<span id="cierre-titulo">¿Necesitas jabas para tu negocio?</span>}
            tamano="xl"
            descripcion="Cuéntanos qué necesitas: el tipo de jaba, la cantidad aproximada y tu ciudad de entrega. Te respondemos por WhatsApp con una cotización."
            acciones={<BotonCotizar tamano="lg">Cotizar por WhatsApp</BotonCotizar>}
          />

          <CotizacionRapida tono="oscuro" className="mt-6" />

          <ul className="mt-10 flex flex-col gap-3 text-[0.9375rem] sm:flex-row sm:flex-wrap sm:gap-x-7">
            {garantias.map((g) => (
              <li key={g} className="flex items-center gap-2.5 text-petroleo-50">
                <Check aria-hidden="true" className="size-4 shrink-0 text-naranja-400" strokeWidth={2.5} />
                {g}
              </li>
            ))}
          </ul>

          <p className="mt-6 flex items-center gap-2.5 text-sm text-petroleo-200">
            <Mail aria-hidden="true" className="size-4 shrink-0" />
            ¿Prefieres el correo? Escríbenos a{" "}
            <a href={`mailto:${empresa.correo}`} className="underline underline-offset-4 transition-colors hover:text-white">
              {empresa.correo}
            </a>
          </p>
        </Reveal>
      </Contenedor>
    </section>
  );
}
