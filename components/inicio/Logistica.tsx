import { Factory, Truck, Warehouse } from "lucide-react";
import { Contenedor } from "@/components/ui/Contenedor";
import { DivisorPuas } from "@/components/ui/DivisorPuas";
import { Foto } from "@/components/ui/Foto";
import { Reveal } from "@/components/ui/Reveal";
import { Seccion } from "@/components/ui/Seccion";

// Sección 5. La más diferenciada de la página: fondo petróleo profundo, titular de tres golpes
// a gran escala, un mosaico asimétrico de fotos de transporte y almacén, y tres pasos numerados.
// Las fotos son referenciales y van rotuladas: no son la flota ni las instalaciones de PLASTINORTE.
const pasos = [
  { icono: Factory, titulo: "Fabricamos", texto: "Producimos nuestras propias jabas plásticas en Lima Norte." },
  {
    icono: Warehouse,
    titulo: "Abastecemos",
    texto: "Atendemos pedidos por volumen de empresas, almacenes, distribuidores y comerciantes.",
  },
  {
    icono: Truck,
    titulo: "Transportamos",
    texto: "Entregamos con nuestra propia flota en Lima Metropolitana y enviamos a todo el Perú.",
  },
] as const;

export function Logistica() {
  return (
    <Seccion fondo="petroleo-profundo" id="fabricacion" className="mt-4 sm:mt-5">
      <DivisorPuas className="absolute inset-x-0 top-0 -translate-y-[calc(100%-1px)] text-petroleo-950" />

      <Contenedor>
        <Reveal>
          <p className="flex items-center gap-3 font-display ancho-expandido text-eyebrow font-bold uppercase text-naranja-400">
            <span aria-hidden="true" className="size-2 rotate-45 bg-current" />
            Fabricación y transporte
          </p>
          {/* min(): en 320–400 px «TRANSPORTAMOS.» (mayúsculas expandidas) no cabe con el tamaño mínimo de display-lg */}
          <h2 className="mt-6 font-display ancho-expandido text-[length:min(var(--text-display-lg),7.4vw)] font-black uppercase leading-[0.98] lg:text-display-xl">
            <span className="block">Fabricamos.</span>
            <span className="block text-petroleo-300">Abastecemos.</span>
            <span className="block text-naranja-400">Transportamos.</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:mt-16 lg:grid-cols-12 lg:gap-5">
          {/* En escritorio la foto llena la altura que le marque la columna derecha; en móvil, su proporción */}
          <Reveal className="relative aspect-[16/10] lg:col-span-7 lg:aspect-auto">
            <Foto
              id="transporte-camion-ruta"
              llenar
              rotulo="abajo-izq"
              posicion="40% 60%"
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="rounded-tarjeta"
            />
          </Reveal>
          <div className="grid gap-4 lg:col-span-5 lg:gap-5">
            <Reveal retraso={120}>
              {/* Recorte horizontal de una foto vertical: solo la parte alta, sin el guardabarros con marcas ajenas */}
              <Foto
                id="transporte-camion-atardecer"
                relacion="4/3"
                posicion="50% 0%"
                rotulo="abajo-izq"
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="rounded-tarjeta"
              />
            </Reveal>
            <Reveal retraso={240}>
              <Foto
                id="distribucion-almacen"
                relacion="16/10"
                posicion="60% 55%"
                rotulo="abajo-izq"
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="rounded-tarjeta"
              />
            </Reveal>
          </div>
        </div>

        <ol className="mt-14 grid gap-10 border-t border-white/12 pt-10 md:grid-cols-3 md:gap-8 lg:mt-16 lg:pt-12">
          {pasos.map(({ icono: Icono, titulo, texto }, i) => (
            <Reveal as="li" key={titulo} retraso={i * 110} className="relative">
              <span aria-hidden="true" className="regla-reveal absolute -top-10 left-0 h-0.5 w-16 bg-naranja-500 max-md:hidden lg:-top-12" />
              <div className="flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-pieza bg-white/10 text-naranja-400">
                  <Icono aria-hidden="true" className="size-6" strokeWidth={1.5} />
                </span>
                <span aria-hidden="true" className="cifras text-sm text-petroleo-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-5 font-display ancho-normal text-display-sm font-extrabold">{titulo}</h3>
              <p className="mt-2 max-w-[28rem] text-[0.9375rem] leading-relaxed text-petroleo-100">{texto}</p>
            </Reveal>
          ))}
        </ol>
      </Contenedor>
    </Seccion>
  );
}
