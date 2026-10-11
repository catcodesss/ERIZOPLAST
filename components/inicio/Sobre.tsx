import { Handshake, MapPin, Truck } from "lucide-react";
import { DosColumnas } from "@/components/secciones/DosColumnas";
import { BotonCotizar } from "@/components/ui/BotonCotizar";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { Foto } from "@/components/ui/Foto";
import { Reveal } from "@/components/ui/Reveal";
import { Seccion } from "@/components/ui/Seccion";

// Sección 4. Imagen grande a la izquierda con un panel que se sale de ella (en escritorio) y
// el texto a la derecha. La idea fuerte es la relación directa: "hablas con quien fabrica".
const datos = [
  { icono: MapPin, rotulo: "Sede", valor: "Lima Norte, Lima" },
  { icono: Handshake, rotulo: "Trato", valor: "Directo con fábrica" },
  { icono: Truck, rotulo: "Entrega", valor: "Flota propia" },
] as const;

export function Sobre() {
  return (
    <Seccion fondo="concreto" id="nosotros">
      <DosColumnas
        proporcion="medio-grande"
        medio={
          <Reveal className="relative">
            <Foto id="sobre-almacen-soleado" relacion="4/3" rotulo="arriba-izq" sizes="(min-width: 1024px) 55vw, 100vw" />
            <div className="relative mt-4 border-l-4 border-naranja-500 bg-petroleo-950 p-6 text-white lg:absolute lg:-bottom-9 lg:-right-8 lg:mt-0 lg:max-w-[21rem] lg:shadow-elevada">
              <p className="font-display ancho-normal text-display-sm font-extrabold">Hablas con quien fabrica.</p>
              <p className="mt-2 text-[0.9375rem] leading-snug text-petroleo-100">
                Cotizas, ajustas tu pedido y coordinas la entrega directamente con nosotros.
              </p>
            </div>
          </Reveal>
        }
        contenido={
          <Reveal retraso={120} className="lg:pl-4">
            <EncabezadoSeccion
              sobretitulo="Sobre PLASTINORTE"
              titulo="Fabricamos en Lima Norte y vendemos directo"
              descripcion="Somos una empresa de Lima Norte dedicada a fabricar y distribuir jabas plásticas industriales para empresas, almacenes, distribuidores y comerciantes."
            />
            <p className="mt-5 max-w-[40rem] leading-relaxed text-concreto-700">
              Al ser fabricantes no hay intermediarios entre tú y la producción: la relación comercial es directa, desde la primera
              consulta hasta la entrega.
            </p>

            <dl className="mt-8 grid gap-5 border-t border-concreto-300 pt-6 sm:grid-cols-3">
              {datos.map(({ icono: Icono, rotulo, valor }) => (
                <div key={rotulo} className="flex items-start gap-3">
                  <Icono aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-petroleo-600" strokeWidth={1.5} />
                  <div>
                    <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-concreto-600">{rotulo}</dt>
                    <dd className="mt-1 font-display ancho-normal text-base font-extrabold leading-tight text-petroleo-800">{valor}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <div className="mt-8">
              <BotonCotizar variante="secundario" tamano="lg">
                Hablar con un asesor
              </BotonCotizar>
            </div>
          </Reveal>
        }
      />
    </Seccion>
  );
}
