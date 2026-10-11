import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Truck } from "lucide-react";
import { empresa } from "@/data/empresa";
import { BotonCotizar } from "@/components/ui/BotonCotizar";
import { Boton } from "@/components/ui/Boton";
import { CotizacionRapida } from "@/components/ui/CotizacionRapida";
import { Contenedor } from "@/components/ui/Contenedor";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { Seccion } from "@/components/ui/Seccion";

export const metadata: Metadata = {
  title: "Cotizar jabas plásticas en Lima y todo el Perú",
  description:
    "Cotiza jabas plásticas al por mayor con PLASTINORTE por WhatsApp o correo. Fábrica en Lima Norte, entregas en Lima Metropolitana y envíos a todo el Perú.",
};

// Sin formulario de contacto a propósito: WhatsApp y correo son los dos canales, y la web no guarda datos
// de quien escribe. El panel de cantidad y ciudad solo arma el mensaje de WhatsApp (ver CotizacionRapida). Los pasos describen el recorrido real (catálogo → WhatsApp → cotización); no prometen plazos,
// porque PLASTINORTE aún no los ha confirmado.
const pasos = [
  { titulo: "Elige tu jaba", texto: "Revisa el catálogo o, si no ves lo que buscas, descríbenos las medidas que necesitas." },
  { titulo: "Escríbenos", texto: "Dinos la cantidad aproximada y tu ciudad de entrega. El botón ya lleva el modelo que elegiste." },
  { titulo: "Recibe tu cotización", texto: "Te respondemos con el precio según cantidad y destino, y confirmamos medidas, material y colores." },
] as const;

export default function Contacto() {
  return (
    <>
      <Seccion fondo="petroleo" espaciado="compacto" textura>
        <Contenedor>
          <EncabezadoSeccion
            nivel="h1"
            tamano="xl"
            sobretitulo="Contacto"
            titulo="Hablemos de tu pedido"
            descripcion="La forma más rápida es WhatsApp. Si prefieres el correo, también respondemos ahí."
            acciones={<BotonCotizar tamano="lg">Cotizar por WhatsApp</BotonCotizar>}
          />
        </Contenedor>
      </Seccion>

      <Seccion fondo="blanco" espaciado="compacto">
        <Contenedor>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              {/* Panel oscuro que acompaña al scroll en escritorio: la columna derecha es más larga y, sin él, la izquierda quedaba vacía */}
              <div className="relative overflow-hidden rounded-tarjeta bg-petroleo-900 p-7 text-white textura-calada-clara sm:p-9 lg:sticky lg:top-28">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-naranja-500" />
                <h2 className="font-display ancho-normal text-display-md font-extrabold">Datos de contacto</h2>
                <ul className="mt-6 flex flex-col gap-6 text-[0.9375rem]">
                  <li className="flex gap-4">
                    <Mail aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-naranja-400" />
                    <div>
                      <p className="font-medium text-white">Correo</p>
                      <a href={`mailto:${empresa.correo}`} className="break-all text-white underline underline-offset-4 hover:text-naranja-300">
                        {empresa.correo}
                      </a>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-naranja-400" />
                    <div>
                      <p className="font-medium text-white">Ubicación</p>
                      <p className="text-petroleo-100">
                        {empresa.zona}
                        {empresa.direccion && <span className="block">{empresa.direccion}</span>}
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <Truck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-naranja-400" />
                    <div>
                      <p className="font-medium text-white">Cobertura</p>
                      <p className="text-petroleo-100">
                        {empresa.cobertura.local}. {empresa.cobertura.nacional}.
                      </p>
                    </div>
                  </li>
                  {(empresa.razonSocial || empresa.ruc) && (
                    <li className="border-t border-white/12 pt-5 text-petroleo-100">
                      {empresa.razonSocial}
                      {empresa.ruc && <span className="block">RUC {empresa.ruc}</span>}
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-7">
              <h2 className="font-display ancho-normal text-display-md font-extrabold text-petroleo-800">Cómo cotizar</h2>
              <ol className="mt-6 divide-y divide-concreto-200 border-y border-concreto-200">
                {pasos.map((paso, i) => (
                  <li key={paso.titulo} className="flex gap-5 py-5">
                    <span className="cifras w-8 shrink-0 font-display text-2xl font-bold text-naranja-600">{i + 1}</span>
                    <div>
                      <h3 className="font-display ancho-normal text-lg font-extrabold text-petroleo-800">{paso.titulo}</h3>
                      <p className="mt-1 text-concreto-700">{paso.texto}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <CotizacionRapida abierto className="mt-6" />
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Boton href="/catalogo" variante="contorno" flecha>
                  Ver catálogo
                </Boton>
                <p className="text-sm text-concreto-600">
                  Tratamos tus datos según nuestra{" "}
                  <Link href="/privacidad" className="underline underline-offset-4 hover:text-petroleo-800">
                    política de privacidad
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </Contenedor>
      </Seccion>
    </>
  );
}
