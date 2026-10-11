import type { Metadata } from "next";
import Image from "next/image";
import { esFotoPropia, fotos } from "@/data/fotos";
import { Contenedor } from "@/components/ui/Contenedor";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { Seccion } from "@/components/ui/Seccion";

export const metadata: Metadata = {
  title: "Créditos de imágenes",
  robots: { index: false, follow: true },
};

// Generada desde data/fotos.ts: cada foto del sitio aparece aquí con su autor, su licencia y su fuente.
// Aunque ninguna licencia exige atribución, se da: es lo correcto con quien hizo la foto.
export default function Creditos() {
  // Las fotos propias de PLASTINORTE no necesitan crédito.
  const lista = Object.entries(fotos).filter(([, foto]) => !esFotoPropia(foto));

  return (
    <Seccion fondo="blanco">
      <Contenedor ancho="estrecho">
        <EncabezadoSeccion
          nivel="h1"
          tamano="lg"
          sobretitulo="Legal"
          titulo="Créditos de imágenes"
          descripcion={
            lista.length > 0
              ? "Las fotografías de banco de este sitio son imágenes referenciales con licencia de uso comercial. No muestran las instalaciones, los productos ni la flota de PLASTINORTE."
              : "Todas las fotografías de este sitio son propias de PLASTINORTE."
          }
        />

        <ul className="mt-12 divide-y divide-concreto-200 border-y border-concreto-200">
          {lista.map(([id, foto]) => (
            <li key={id} className="flex gap-5 py-5">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-pieza bg-concreto-200 sm:size-24">
                <Image src={foto.src} alt="" fill sizes="96px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-petroleo-900">{foto.alt}</p>
                <p className="mt-1 text-sm text-concreto-700">
                  Foto de <span className="font-medium">{foto.autor}</span> ·{" "}
                  <a href={foto.fuenteUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-petroleo-800">
                    ver en {foto.licencia}
                  </a>{" "}
                  ·{" "}
                  <a href={foto.licenciaUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-petroleo-800">
                    Licencia {foto.licencia}
                  </a>
                </p>
                <p className="cifras mt-1 break-all text-xs text-concreto-500">{foto.src}</p>
              </div>
            </li>
          ))}
        </ul>
      </Contenedor>
    </Seccion>
  );
}
