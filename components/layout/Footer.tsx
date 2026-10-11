import Link from "next/link";
import { cacheLife } from "next/cache";
import { Mail, MapPin, Truck } from "lucide-react";
import { empresa } from "@/data/empresa";
import { navegacion, navegacionLegal } from "@/data/navegacion";
import { Logo } from "@/components/marca/Logo";
import { BotonCotizar } from "@/components/ui/BotonCotizar";
import { Contenedor } from "@/components/ui/Contenedor";
import { DivisorPuas } from "@/components/ui/DivisorPuas";

// Con Cache Components, `new Date()` en un componente de servidor no se puede prerenderizar.
// Se aísla en una función cacheada: el año se calcula una vez al día, no en cada petición.
async function anioActual(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function Footer() {
  const anio = await anioActual();

  return (
    <footer id="contacto" className="group/seccion relative bg-petroleo-950 text-petroleo-100" data-tono="oscuro">
      <DivisorPuas className="absolute inset-x-0 top-0 -translate-y-[calc(100%-1px)] text-petroleo-950" />

      <Contenedor className="grid gap-12 pb-28 pt-16 md:pb-14 lg:grid-cols-12 lg:gap-10 lg:pt-20">
        <div className="lg:col-span-5">
          <Logo variante="claro" />
          <p className="mt-6 max-w-md text-[0.9375rem] leading-relaxed text-petroleo-200">{empresa.descripcion}</p>
          <div className="mt-8">
            <BotonCotizar tamano="lg">Cotizar por WhatsApp</BotonCotizar>
          </div>
        </div>

        <nav aria-label="Pie de página" className="lg:col-span-2">
          <h2 className="font-display ancho-expandido text-eyebrow font-bold uppercase text-naranja-400">Sitio</h2>
          <ul className="mt-5 flex flex-col gap-3 text-[0.9375rem]">
            {navegacion.map((e) => (
              <li key={e.href}>
                <Link href={e.href} className="inline-block py-1 transition-colors hover:text-white">
                  {e.etiqueta}
                </Link>
              </li>
            ))}
            {/* El formulario de novedades vive en la portada; el pie solo lleva hasta él. */}
            <li>
              <Link href="/#novedades" className="inline-block py-1 transition-colors hover:text-white">
                Novedades
              </Link>
            </li>
          </ul>
        </nav>

        <div className="lg:col-span-5">
          <h2 className="font-display ancho-expandido text-eyebrow font-bold uppercase text-naranja-400">Contacto y cobertura</h2>
          <ul className="mt-5 flex flex-col gap-4 text-[0.9375rem]">
            <li className="flex gap-3">
              <Mail aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-petroleo-300" />
              <a href={`mailto:${empresa.correo}`} className="break-all transition-colors hover:text-white">
                {empresa.correo}
              </a>
            </li>
            <li className="flex gap-3">
              <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-petroleo-300" />
              <span>
                {empresa.zona}
                {empresa.direccion && <span className="block text-petroleo-300">{empresa.direccion}</span>}
              </span>
            </li>
            <li className="flex gap-3">
              <Truck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-petroleo-300" />
              <span>
                Cobertura: todo el Perú
                <span className="block text-petroleo-300">{empresa.cobertura.local} y envíos a provincias, con flota propia</span>
              </span>
            </li>
          </ul>
        </div>
      </Contenedor>

      <div className="border-t border-white/12">
        <Contenedor className="flex flex-col gap-3 py-6 text-xs text-petroleo-300 md:flex-row md:items-center md:justify-between">
          <p>
            © {anio} {empresa.razonSocial ?? empresa.nombre}
            {empresa.ruc && <span> · RUC {empresa.ruc}</span>}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {navegacionLegal.map((e) => (
              <li key={e.href}>
                <Link href={e.href} className="inline-block py-1 transition-colors hover:text-white">
                  {e.etiqueta}
                </Link>
              </li>
            ))}
          </ul>
        </Contenedor>
      </div>
    </footer>
  );
}
