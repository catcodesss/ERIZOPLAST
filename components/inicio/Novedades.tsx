import { Check } from "lucide-react";
import { empresa } from "@/data/empresa";
import { FormularioNovedades } from "@/components/novedades/FormularioNovedades";
import { Contenedor } from "@/components/ui/Contenedor";
import { DivisorPuas } from "@/components/ui/DivisorPuas";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { Reveal } from "@/components/ui/Reveal";
import { Seccion } from "@/components/ui/Seccion";
import { Tarjeta } from "@/components/ui/Tarjeta";

// Sección 7. Capta contactos empresariales que quieren información comercial. Lo que se promete aquí es
// exactamente la finalidad que declara la casilla de consentimiento (data/consentimiento.ts) y la política de
// privacidad: catálogo, nuevos productos y novedades. Nada de frecuencias, descuentos ni ofertas, porque
// PLASTINORTE no los ha definido.
const recibiras = ["Novedades del catálogo", "Nuevos productos", "Información comercial sobre nuestras soluciones industriales"] as const;

export function Novedades() {
  return (
    // Padding inferior extra: las púas del pie se montan sobre el borde de esta sección.
    <Seccion
      id="novedades"
      fondo="concreto"
      espaciado="ninguno"
      textura
      className="pb-[calc(var(--spacing-seccion)+1.5rem)] pt-[calc(var(--spacing-seccion)+1rem)]"
    >
      {/* Púas hacia arriba, del color de esta sección, que se clavan en el cierre fotográfico anterior */}
      <DivisorPuas className="absolute inset-x-0 top-0 -translate-y-[calc(100%-1px)] text-concreto-100" />

      <Contenedor>
        {/* grid-cols-1 explícito: sin él la pista automática crece hasta el contenido más ancho y desborda en móvil */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-5">
            <EncabezadoSeccion
              sobretitulo="Novedades"
              titulo="Conoce nuestras novedades y productos"
              descripcion="Déjanos tu correo y recibe información sobre nuestras soluciones industriales."
            />
            <ul className="mt-8 flex flex-col gap-3 text-[0.9375rem] text-petroleo-900">
              {recibiras.map((texto) => (
                <li key={texto} className="flex items-start gap-3">
                  <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-naranja-700" strokeWidth={2.5} />
                  {texto}
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-md text-sm text-concreto-700">
              Sin compromiso: puedes darte de baja cuando quieras escribiendo a
              {/* En su propia línea: partido a mitad de dirección no se lee ni se copia bien */}
              <a href={`mailto:${empresa.correo}`} className="mt-1 block w-fit py-1 [overflow-wrap:anywhere] underline underline-offset-4 hover:text-petroleo-800">
                {empresa.correo}
              </a>
            </p>
          </Reveal>

          <Reveal retraso={120} className="lg:col-span-7">
            <Tarjeta variante="lisa" className="p-6 shadow-pieza sm:p-9">
              <FormularioNovedades />
            </Tarjeta>
          </Reveal>
        </div>
      </Contenedor>
    </Seccion>
  );
}
