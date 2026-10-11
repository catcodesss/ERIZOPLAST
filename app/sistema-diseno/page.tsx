import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  Boxes,
  Egg,
  Factory,
  Fish,
  Forklift,
  Layers,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  PackageCheck,
  Recycle,
  Ruler,
  ShieldCheck,
  Sprout,
  Truck,
  Warehouse,
  Weight,
} from "lucide-react";
import type { Producto } from "@/data/tipos";
import { contraste, nivelWcag } from "@/lib/color";
import { TarjetaProducto } from "@/components/catalogo/TarjetaProducto";
import { Logo } from "@/components/marca/Logo";
import { Simbolo } from "@/components/marca/Simbolo";
import { DosColumnas } from "@/components/secciones/DosColumnas";
import { Panoramica } from "@/components/secciones/Panoramica";
import { Boton } from "@/components/ui/Boton";
import { BotonCotizar } from "@/components/ui/BotonCotizar";
import { BloqueDato } from "@/components/ui/BloqueDato";
import { Contenedor } from "@/components/ui/Contenedor";
import { DivisorPuas } from "@/components/ui/DivisorPuas";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Foto } from "@/components/ui/Foto";
import { Reveal } from "@/components/ui/Reveal";
import { Seccion } from "@/components/ui/Seccion";
import { Tarjeta } from "@/components/ui/Tarjeta";
import { leerPaleta } from "./paleta";

export const metadata: Metadata = {
  title: "Sistema de diseño",
  robots: { index: false, follow: false },
};

// --- Datos de ejemplo --------------------------------------------------------------------------
// Productos ilustrativos solo para ver la tarjeta. NO son el catálogo de PLASTINORTE
// (ese vive en data/productos.ts).
const base: Omit<Producto, "slug" | "nombre" | "categorias" | "medidas" | "material" | "acabado"> = {
  resumen: "Texto de ejemplo para ver cómo se acomoda el resumen en la tarjeta.",
  usos: [],
  caracteristicas: [],
  colores: [],
  precio: { tipo: "consultar", etiqueta: "Consultar precio" },
  disponibilidad: "consultar",
  imagenes: [],
  publicado: false,
  confirmacionEmpresa: "pendiente",
};

const ejemplos: Producto[] = [
  {
    ...base,
    slug: "ejemplo-a",
    nombre: "Jaba calada de ejemplo",
    categorias: ["agricolas"],
    medidas: { largo: 60, ancho: 40, alto: 30 },
    capacidadLitros: 60,
    cargaKg: 30,
    material: "PEAD",
    acabado: "calada",
    precio: { tipo: "referencial", soles: 30, unidad: "por unidad" },
  },
  {
    ...base,
    slug: "ejemplo-b",
    nombre: "Jaba cerrada de ejemplo",
    categorias: ["industriales"],
    medidas: { largo: 50, ancho: 40, alto: 20 },
    capacidadLitros: 32,
    material: "PP",
    acabado: "cerrada",
  },
  {
    ...base,
    slug: "ejemplo-c",
    nombre: "Jaba semicalada de ejemplo",
    categorias: ["alimentos"],
    medidas: { largo: 70, ancho: 40, alto: 25 },
    cargaKg: 40,
    material: "PEAD",
    acabado: "semicalada",
    precio: { tipo: "consultar", etiqueta: "Cotizar por volumen" },
  },
];

const iconos = [
  { nombre: "Factory", Icono: Factory },
  { nombre: "Truck", Icono: Truck },
  { nombre: "Warehouse", Icono: Warehouse },
  { nombre: "Forklift", Icono: Forklift },
  { nombre: "Boxes", Icono: Boxes },
  { nombre: "Package", Icono: Package },
  { nombre: "PackageCheck", Icono: PackageCheck },
  { nombre: "Layers", Icono: Layers },
  { nombre: "Ruler", Icono: Ruler },
  { nombre: "Weight", Icono: Weight },
  { nombre: "Recycle", Icono: Recycle },
  { nombre: "ShieldCheck", Icono: ShieldCheck },
  { nombre: "Sprout", Icono: Sprout },
  { nombre: "Fish", Icono: Fish },
  { nombre: "Egg", Icono: Egg },
  { nombre: "MapPin", Icono: MapPin },
  { nombre: "Mail", Icono: Mail },
  { nombre: "MessageCircle", Icono: MessageCircle },
];

const secciones = [
  ["marca", "Marca"],
  ["color", "Color"],
  ["tipografia", "Tipografía"],
  ["botones", "Botones"],
  ["iconos", "Iconos"],
  ["composicion", "Composición"],
  ["tarjetas", "Tarjetas"],
  ["movimiento", "Movimiento"],
  ["rutas", "Rutas"],
] as const;

// --- Piezas locales de la guía ---------------------------------------------------------------

function Bloque({ id, fondo = "blanco", numero, titulo, descripcion, children }: {
  id: string;
  fondo?: "blanco" | "concreto";
  numero: string;
  titulo: string;
  descripcion: string;
  children: ReactNode;
}) {
  return (
    <Seccion id={id} fondo={fondo} espaciado="compacto">
      <Contenedor>
        <EncabezadoSeccion sobretitulo={`${numero} · ${titulo}`} titulo={titulo} descripcion={descripcion} tamano="md" />
        <div className="mt-10 lg:mt-12">{children}</div>
      </Contenedor>
    </Seccion>
  );
}

function Rotulo({ children }: { children: ReactNode }) {
  return <p className="mb-3 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-concreto-600">{children}</p>;
}

const pares: Array<{ uso: string; fgNombre: string; bgNombre: string }> = [
  { uso: "Texto principal", fgNombre: "petroleo-950", bgNombre: "white" },
  { uso: "Titulares", fgNombre: "petroleo-800", bgNombre: "white" },
  { uso: "Texto secundario", fgNombre: "concreto-700", bgNombre: "white" },
  { uso: "Texto tenue sobre gris claro", fgNombre: "concreto-600", bgNombre: "concreto-100" },
  { uso: "Texto sobre petróleo", fgNombre: "white", bgNombre: "petroleo-700" },
  { uso: "Texto secundario sobre oscuro", fgNombre: "petroleo-100", bgNombre: "petroleo-950" },
  { uso: "Botón primario", fgNombre: "petroleo-950", bgNombre: "naranja-500" },
  { uso: "Acento sobre oscuro", fgNombre: "naranja-400", bgNombre: "petroleo-950" },
  { uso: "Naranja como texto sobre blanco", fgNombre: "naranja-700", bgNombre: "white" },
  { uso: "✕ Naranja 500 sobre blanco (no usar)", fgNombre: "naranja-500", bgNombre: "white" },
  { uso: "✕ Blanco sobre naranja 500 (no usar)", fgNombre: "white", bgNombre: "naranja-500" },
];

// Guía interna de diseño: en el sitio publicado no existe (404). Lee archivos del proyecto y no es para clientes.
export default async function SistemaDiseno() {
  if (process.env.NODE_ENV === "production") notFound();
  const paleta = await leerPaleta();
  const hex = (nombre: string): string => {
    if (nombre === "white") return "#ffffff";
    const [escala, tono] = [nombre.slice(0, nombre.lastIndexOf("-")), nombre.slice(nombre.lastIndexOf("-") + 1)];
    return paleta.find((e) => e.nombre === escala)?.tonos.find((t) => t.tono === tono)?.hex ?? "#000000";
  };

  return (
    <>
      {/* ---- Portada de la guía ---- */}
      <Seccion fondo="petroleo-profundo" textura>
        <Contenedor>
          <EncabezadoSeccion
            nivel="h1"
            tamano="xl"
            sobretitulo="Fase 2 · Para aprobación"
            titulo="Sistema de diseño PLASTINORTE"
            descripcion="Marca, color, tipografía, componentes y composiciones. Todo lo que ves aquí es lo que usará el sitio: si algo cambia aquí, cambia en todas partes."
          />
          <nav aria-label="Índice de la guía" className="mt-10">
            <ul className="flex flex-wrap gap-2">
              {secciones.map(([id, nombre], i) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="inline-flex min-h-10 items-center gap-2 rounded-pieza border border-white/20 px-4 text-sm transition-colors hover:border-naranja-400 hover:text-naranja-400"
                  >
                    <span className="cifras text-petroleo-300">{String(i + 1).padStart(2, "0")}</span>
                    {nombre}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Contenedor>
      </Seccion>

      {/* ---- 01 Marca ---- */}
      <Bloque
        id="marca"
        numero="01"
        titulo="Marca"
        descripcion="Logotipo tipográfico con un símbolo propio: una jaba calada coronada por púas de erizo. Texto real, no imagen: nítido a cualquier tamaño."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid min-h-44 place-items-center rounded-tarjeta border border-concreto-300 bg-white p-8">
            <Logo />
          </div>
          <div className="grid min-h-44 place-items-center rounded-tarjeta bg-petroleo-950 p-8">
            <Logo variante="claro" />
          </div>
          <div className="grid min-h-44 place-items-center rounded-tarjeta bg-concreto-100 p-8">
            <Logo className="scale-125" />
          </div>
          <div className="flex min-h-44 flex-wrap items-end justify-center gap-8 rounded-tarjeta bg-petroleo-700 p-8">
            <Simbolo variante="claro" className="size-20" />
            <Simbolo variante="claro" className="size-12" />
            <Simbolo variante="claro" className="size-8" />
            <Simbolo variante="claro" className="size-5" />
          </div>
        </div>
        <p className="mt-6 max-w-2xl text-sm text-concreto-700">
          El símbolo tiene dos piezas: el cuerpo (ranuras de asa recortadas, color de texto) y las púas (siempre naranja). Las
          ranuras son huecos reales, así que se ve el fondo a través de ellas. Favicon: <code className="cifras">app/icon.svg</code>.
        </p>
      </Bloque>

      {/* ---- 02 Color ---- */}
      <Bloque
        id="color"
        fondo="concreto"
        numero="02"
        titulo="Color"
        descripcion="Petróleo para identidad, naranja industrial como acento escaso, concretos cálidos de apoyo. Las escalas se leen directamente de globals.css."
      >
        <div className="flex flex-col gap-8">
          {paleta.map((escala) => (
            <div key={escala.nombre}>
              <Rotulo>{escala.nombre}</Rotulo>
              <ul className="grid grid-cols-6 gap-2 sm:grid-cols-11">
                {escala.tonos.map((t) => (
                  <li key={t.tono}>
                    <div className="h-16 rounded-pieza border border-black/10" style={{ background: t.hex }} />
                    <p className="cifras mt-1.5 text-xs font-medium">{t.tono}</p>
                    <p className="cifras hidden text-[0.625rem] uppercase text-concreto-600 sm:block">{t.hex}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Rotulo>Pares de texto y fondo · contraste calculado (WCAG 2.x)</Rotulo>
          <div className="overflow-x-auto rounded-tarjeta border border-concreto-300 bg-white">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="bg-concreto-100 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-concreto-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Uso</th>
                  <th className="px-4 py-3 font-medium">Muestra</th>
                  <th className="px-4 py-3 font-medium">Ratio</th>
                  <th className="px-4 py-3 font-medium">Texto normal</th>
                  <th className="px-4 py-3 font-medium">Texto grande</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concreto-200">
                {pares.map((p) => {
                  const fg = hex(p.fgNombre);
                  const bg = hex(p.bgNombre);
                  const ratio = contraste(fg, bg);
                  const normal = nivelWcag(ratio);
                  const grande = nivelWcag(ratio, true);
                  return (
                    <tr key={p.uso}>
                      <td className="px-4 py-3">{p.uso}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-pieza px-3 py-1 font-bold" style={{ color: fg, background: bg, border: "1px solid rgb(0 0 0 / .1)" }}>
                          Aa jabas
                        </span>
                      </td>
                      <td className="cifras px-4 py-3">{ratio.toFixed(2)}:1</td>
                      <td className="px-4 py-3">
                        <Etiqueta tono={normal === "falla" ? "naranja" : "petroleo"}>{normal === "falla" ? "No cumple" : normal}</Etiqueta>
                      </td>
                      <td className="px-4 py-3">
                        <Etiqueta tono={grande === "falla" ? "naranja" : "petroleo"}>{grande === "falla" ? "No cumple" : grande}</Etiqueta>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-2xl text-sm text-concreto-700">
            Regla práctica: el naranja es acento y fondo de botón (con texto oscuro), nunca color de texto sobre blanco.
          </p>
        </div>
      </Bloque>

      {/* ---- 03 Tipografía ---- */}
      <Bloque
        id="tipografia"
        numero="03"
        titulo="Tipografía"
        descripcion="Archivo para titulares y marca (robusta, con eje de ancho), IBM Plex Sans para texto corrido (técnica y legible) y Plex Mono para medidas y cifras de ficha."
      >
        <div className="grid gap-px overflow-hidden rounded-tarjeta border border-concreto-300 bg-concreto-300 md:grid-cols-3">
          <div className="bg-white p-6">
            <Rotulo>Archivo · titulares</Rotulo>
            <p className="font-display ancho-normal text-5xl font-black leading-none text-petroleo-800">Aa</p>
            <p className="mt-3 font-display ancho-normal text-lg font-extrabold">Jabas industriales</p>
            <p className="font-display ancho-expandido text-lg font-extrabold">Jabas industriales</p>
            <p className="mt-2 text-xs text-concreto-600">Ancho normal (arriba) y expandido (abajo). Pesos 600–900.</p>
          </div>
          <div className="bg-white p-6">
            <Rotulo>IBM Plex Sans · texto</Rotulo>
            <p className="text-5xl font-medium leading-none text-petroleo-800">Aa</p>
            <p className="mt-3 text-base leading-relaxed">
              Fabricamos y distribuimos jabas plásticas para empresas, almacenes y comerciantes de todo el Perú.
            </p>
            <p className="mt-2 text-xs text-concreto-600">Pesos 400–700.</p>
          </div>
          <div className="bg-white p-6">
            <Rotulo>IBM Plex Mono · cifras</Rotulo>
            <p className="cifras text-5xl font-medium leading-none text-petroleo-800">12</p>
            <p className="cifras mt-3 text-lg">60 × 40 × 30 cm</p>
            <p className="cifras text-lg">1 200 und. / camión</p>
            <p className="mt-2 text-xs text-concreto-600">Cifras tabulares para alinear medidas.</p>
          </div>
        </div>

        <div className="mt-10 divide-y divide-concreto-200 border-y border-concreto-200">
          {[
            ["text-display-2xl", "Portada", "text-display-2xl"],
            ["text-display-xl", "Páginas", "text-display-xl"],
            ["text-display-lg", "Secciones", "text-display-lg"],
            ["text-display-md", "Subsecciones", "text-display-md"],
            ["text-display-sm", "Tarjetas", "text-display-sm"],
          ].map(([clase, ejemplo]) => (
            <div key={clase} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-8">
              <code className="cifras w-44 shrink-0 text-xs text-concreto-600">{clase}</code>
              <p className={`font-display ancho-normal font-extrabold text-petroleo-800 ${clase} truncate`}>{ejemplo}</p>
            </div>
          ))}
          <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-8">
            <code className="cifras w-44 shrink-0 text-xs text-concreto-600">text-eyebrow</code>
            <p className="font-display ancho-expandido text-eyebrow font-bold uppercase text-naranja-700">Sobretítulo de sección</p>
          </div>
        </div>
      </Bloque>

      {/* ---- 04 Botones ---- */}
      <Bloque
        id="botones"
        fondo="concreto"
        numero="04"
        titulo="Botones"
        descripcion="Mayúsculas en Archivo, esquinas casi rectas y un filo inferior que da sensación de pieza. El primario es siempre la cotización."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-tarjeta border border-concreto-300 bg-white p-6">
            <Rotulo>Sobre fondo claro</Rotulo>
            <div className="flex flex-wrap items-center gap-3">
              <BotonCotizar />
              <Boton variante="secundario">Ver catálogo</Boton>
              <Boton variante="contorno">Contorno</Boton>
              <Boton variante="texto" flecha>
                Texto
              </Boton>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <BotonCotizar tamano="lg" />
              <Boton tamano="lg" variante="secundario" flecha>
                Grande con flecha
              </Boton>
              <Boton disabled>Desactivado</Boton>
            </div>
          </div>
          <Seccion fondo="petroleo-profundo" espaciado="ninguno" className="rounded-tarjeta p-6">
            <Rotulo>Sobre fondo oscuro</Rotulo>
            <div className="flex flex-wrap items-center gap-3">
              <BotonCotizar />
              <Boton variante="contorno-claro" flecha>
                Contorno claro
              </Boton>
              <Boton variante="texto" flecha>
                Texto
              </Boton>
            </div>
          </Seccion>
        </div>
        <p className="mt-6 max-w-2xl text-sm text-concreto-700">
          Los botones de cotización usan <code className="cifras">/api/whatsapp</code>: el número de WhatsApp nunca aparece en el
          HTML, en el JavaScript ni en ningún texto del sitio.
        </p>
      </Bloque>

      {/* ---- 05 Iconos ---- */}
      <Bloque
        id="iconos"
        numero="05"
        titulo="Iconos"
        descripcion="Lucide, trazo fino de 1,5 px, siempre decorativos (aria-hidden) y acompañados de texto. Dos tratamientos: suelto y en ficha."
      >
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {iconos.map(({ nombre, Icono }) => (
            <li key={nombre} className="flex flex-col items-center gap-3 rounded-tarjeta border border-concreto-200 px-2 py-5">
              <span className="grid size-14 place-items-center rounded-pieza bg-petroleo-50 text-petroleo-700">
                <Icono aria-hidden="true" className="size-7" strokeWidth={1.5} />
              </span>
              <span className="cifras text-[0.6875rem] text-concreto-600">{nombre}</span>
            </li>
          ))}
        </ul>
      </Bloque>

      {/* ---- 06 Composición ---- */}
      <Seccion id="composicion" fondo="concreto" espaciado="compacto">
        <Contenedor>
          <EncabezadoSeccion
            sobretitulo="06 · Composición"
            titulo="Composición"
            descripcion="La página combina cinco recursos para que no se lea como una pila de tarjetas iguales. Cada uno está abajo a escala real."
            tamano="md"
          />
        </Contenedor>
      </Seccion>

      <div>
        <p className="bg-concreto-100 pb-4 text-center font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-concreto-600">
          A · Panorámica a todo el ancho
        </p>
        <Panoramica alt="Ejemplo de panorámica" pendiente="Panorámica 16:9 · mínimo 2400 px">
          <div className="max-w-2xl">
            <EncabezadoSeccion
              sobretitulo="Panorámica"
              titulo="La foto manda; el texto se apoya en ella"
              descripcion="Degradado petróleo para garantizar la lectura con cualquier fotografía."
              tamano="lg"
            />
          </div>
        </Panoramica>
      </div>

      <Seccion fondo="blanco">
        <p className="mb-10 text-center font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-concreto-600">
          B · Dos columnas asimétricas (7/5, y su inversa 5/7)
        </p>
        <div className="flex flex-col gap-20">
          <DosColumnas
            medio={<Foto alt="Ejemplo" pendiente="Foto 4:3" relacion="4/3" />}
            contenido={
              <EncabezadoSeccion
                sobretitulo="Medio grande"
                titulo="Imagen protagonista"
                descripcion="La columna de la foto es más ancha que la del texto."
                tamano="md"
                acciones={
                  <Boton variante="texto" flecha>
                    Enlace de texto
                  </Boton>
                }
              />
            }
          />
          <DosColumnas
            invertir
            proporcion="contenido-grande"
            medio={<Foto alt="Ejemplo" pendiente="Foto 4:3" relacion="4/3" />}
            contenido={
              <EncabezadoSeccion
                sobretitulo="Invertida"
                titulo="El texto gana espacio"
                descripcion="En móvil, la imagen siempre va primero; en escritorio cambia de lado."
                tamano="md"
              />
            }
          />
        </div>
      </Seccion>

      <Seccion fondo="petroleo" textura>
        <Contenedor>
          <p className="mb-10 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-petroleo-200">
            C · Asimétrica: titular gigante y bloque desplazado
          </p>
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-y-0">
            <div className="lg:col-span-12">
              <p className="font-display ancho-expandido text-display-xl font-black uppercase text-white">
                Fabricamos. <span className="block text-naranja-400">Entregamos.</span>
              </p>
            </div>
            {/* Sube sobre la zona vacía a la derecha de la segunda línea: se solapa con el titular sin taparlo */}
            <div className="lg:col-span-4 lg:col-start-9 lg:-mt-24">
              <Tarjeta variante="oscura" className="bg-petroleo-950 p-7 shadow-elevada">
                <p className="font-display ancho-normal text-display-sm font-extrabold">Bloque desplazado</p>
                <p className="mt-3 text-petroleo-100">
                  Invade el espacio del titular y rompe la retícula, para dar ritmo y evitar la simetría de plantilla.
                </p>
              </Tarjeta>
            </div>
          </div>
        </Contenedor>
      </Seccion>

      <Seccion fondo="petroleo-profundo">
        <Contenedor>
          <p className="mb-10 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-petroleo-200">
            D · Bloques industriales de información
          </p>
          <div className="reticula -mx-5 grid gap-x-8 gap-y-10 px-5 py-10 sm:-mx-8 sm:grid-cols-2 sm:px-8 lg:-mx-12 lg:grid-cols-4 lg:px-12">
            <BloqueDato icono={<Factory />} valor="00" etiqueta="Dato uno" texto="Texto breve que explica el dato." />
            <BloqueDato icono={<Truck />} valor="00" etiqueta="Dato dos" texto="Cifra grande, rótulo y apoyo." />
            <BloqueDato icono={<Ruler />} valor="00 × 00" etiqueta="Medidas" texto="Fuente mono, cifras tabulares." />
            <BloqueDato icono={<MapPin />} valor="24/7" etiqueta="Ejemplo" texto="Regla naranja a la izquierda." />
          </div>
        </Contenedor>
      </Seccion>

      <Seccion fondo="blanco" espaciado="compacto">
        <Contenedor>
          <p className="mb-6 text-center font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-concreto-600">
            E · Fondos alternados con divisor de púas
          </p>
          <div className="overflow-hidden rounded-tarjeta border border-concreto-300">
            {/* El divisor se pinta del color de la sección que empieza (text-*) sobre el color de la que termina (bg-*) */}
            {(
              [
                ["blanco", "Blanco", ""],
                ["concreto", "Concreto", "bg-white text-concreto-100"],
                ["petroleo", "Petróleo", "bg-concreto-100 text-petroleo-700"],
                ["petroleo-profundo", "Petróleo profundo", "bg-petroleo-700 text-petroleo-950"],
                ["naranja", "Naranja (uso mínimo)", "bg-petroleo-950 text-naranja-500"],
              ] as const
            ).map(([fondo, nombre, divisor], i) => (
              <div key={fondo}>
                {i > 0 && <DivisorPuas className={divisor} />}
                <Seccion fondo={fondo} espaciado="ninguno" className="px-6 py-8">
                  <p className="font-display ancho-normal text-lg font-extrabold">{nombre}</p>
                </Seccion>
              </div>
            ))}
          </div>
        </Contenedor>
      </Seccion>

      {/* ---- 07 Tarjetas ---- */}
      <Bloque
        id="tarjetas"
        fondo="concreto"
        numero="07"
        titulo="Tarjetas"
        descripcion="La tarjeta de producto es la única que se repite en cuadrícula. El resto de la página usa bloques, columnas y paneles."
      >
        <Rotulo>Tarjeta de producto · datos de ejemplo, no son el catálogo</Rotulo>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ejemplos.map((p) => (
            <li key={p.slug}>
              <TarjetaProducto producto={p} ejemplo />
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <Rotulo>Base de tarjeta · variantes (sobre un panel blanco para que se distingan)</Rotulo>
          <div className="grid gap-4 rounded-tarjeta bg-white p-4 md:grid-cols-3">
            <Tarjeta className="p-6">
              <ShieldCheck aria-hidden="true" className="size-8 text-petroleo-600" strokeWidth={1.5} />
              <p className="mt-4 font-display ancho-normal text-display-sm font-extrabold text-petroleo-800">Lisa</p>
              <p className="mt-2 text-sm text-concreto-700">Borde fino sobre blanco.</p>
            </Tarjeta>
            <Tarjeta variante="plana" className="p-6">
              <Recycle aria-hidden="true" className="size-8 text-petroleo-600" strokeWidth={1.5} />
              <p className="mt-4 font-display ancho-normal text-display-sm font-extrabold text-petroleo-800">Plana</p>
              <p className="mt-2 text-sm text-concreto-700">Fondo concreto, sin borde.</p>
            </Tarjeta>
            <Seccion fondo="petroleo-profundo" espaciado="ninguno" className="rounded-tarjeta">
              <Tarjeta variante="oscura" interactiva className="p-6">
                <Warehouse aria-hidden="true" className="size-8 text-naranja-400" strokeWidth={1.5} />
                <p className="mt-4 font-display ancho-normal text-display-sm font-extrabold">Oscura</p>
                <p className="mt-2 text-sm text-petroleo-100">Interactiva: se eleva al pasar el cursor.</p>
              </Tarjeta>
            </Seccion>
          </div>
        </div>
      </Bloque>

      {/* ---- 08 Movimiento ---- */}
      <Bloque
        id="movimiento"
        numero="08"
        titulo="Movimiento"
        descripcion="Discreto y con propósito: aparición suave al hacer scroll, elevación en hover y un menú que se despliega. Todo se desactiva con «reducir movimiento» del sistema."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {["Primero", "Segundo", "Tercero"].map((t, i) => (
            <Reveal key={t} retraso={i * 120}>
              <Tarjeta variante="plana" className="p-6">
                <p className="cifras text-sm text-concreto-600">Reveal · retraso {i * 120} ms</p>
                <p className="mt-2 font-display ancho-normal text-display-sm font-extrabold text-petroleo-800">{t}</p>
              </Tarjeta>
            </Reveal>
          ))}
        </div>
        <ul className="mt-8 grid gap-3 text-sm text-concreto-700 sm:grid-cols-2">
          <li>• Curva única: <code className="cifras">cubic-bezier(0.2, 0.7, 0.2, 1)</code></li>
          <li>• Duración: 300 ms en interacciones, 800 ms en apariciones</li>
          <li>• Lo que ya está visible al cargar no se anima</li>
          <li>• Sin animaciones infinitas ni parallax</li>
        </ul>
      </Bloque>

      {/* ---- 09 Rutas ---- */}
      <Bloque
        id="rutas"
        fondo="concreto"
        numero="09"
        titulo="Rutas"
        descripcion="Estado de las rutas configuradas en esta fase."
      >
        <div className="overflow-x-auto rounded-tarjeta border border-concreto-300 bg-white">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-concreto-100 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-concreto-600">
              <tr>
                <th className="px-4 py-3 font-medium">Ruta</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-concreto-200">
              {[
                ["/", "Esqueleto", "Portada de prueba; el contenido completo es la Fase 3."],
                ["/catalogo", "Estructura", "Vacío a propósito hasta confirmar los productos reales."],
                ["/privacidad", "Borrador", "Solo apartados; texto legal en la Fase 5, con revisión."],
                ["/api/whatsapp", "Funcional", "Redirige a WhatsApp desde el servidor. Sin número en el HTML ni en el JS."],
                ["/sistema-diseno", "Interna", "Esta guía. Fuera de buscadores; se retira antes de publicar."],
                ["/sitemap.xml · /robots.txt", "Funcional", "Solo páginas públicas."],
              ].map(([ruta, estado, nota]) => (
                <tr key={ruta}>
                  <td className="cifras px-4 py-3">{ruta}</td>
                  <td className="px-4 py-3">
                    <Etiqueta tono={estado === "Funcional" ? "petroleo" : "neutro"}>{estado}</Etiqueta>
                  </td>
                  <td className="px-4 py-3 text-concreto-700">{nota}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Bloque>
    </>
  );
}
