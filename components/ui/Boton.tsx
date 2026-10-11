import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

export type VarianteBoton = "primario" | "secundario" | "contorno" | "contorno-claro" | "texto";
export type TamanoBoton = "md" | "lg";

type PropsComunes = {
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  /** Icono al inicio. Si se omite en variantes con flecha, se pone una flecha al final. */
  icono?: ReactNode;
  /** Muestra una flecha animada al final. */
  flecha?: boolean;
  bloque?: boolean;
  className?: string;
  children: ReactNode;
};

type PropsEnlace = PropsComunes & { href: string; nativo?: boolean } & Omit<
    ComponentProps<"a">,
    "href" | "className" | "children"
  >;
type PropsBoton = PropsComunes & { href?: undefined; nativo?: undefined } & Omit<
    ComponentProps<"button">,
    "className" | "children"
  >;

const base =
  // En pantallas muy estrechas el texto puede pasar a dos líneas en vez de empujar la página (sm: no se parte).
  "group/boton relative inline-flex items-center justify-center gap-2.5 py-2 text-center sm:whitespace-nowrap rounded-pieza " +
  "font-display ancho-normal font-bold uppercase tracking-[0.07em] select-none " +
  "transition-[background-color,color,border-color,transform,box-shadow] duration-300 ease-industrial " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-50";

const variantes: Record<VarianteBoton, string> = {
  primario:
    "bg-naranja-500 text-petroleo-950 shadow-[inset_0_-3px_0_rgb(9_29_38/0.22)] hover:bg-naranja-400 hover:-translate-y-0.5",
  secundario: "bg-petroleo-700 text-white shadow-[inset_0_-3px_0_rgb(9_29_38/0.35)] hover:bg-petroleo-600 hover:-translate-y-0.5",
  contorno:
    "border-2 border-petroleo-700 text-petroleo-800 hover:bg-petroleo-700 hover:text-white",
  "contorno-claro": "border-2 border-white/45 text-white hover:border-white hover:bg-white hover:text-petroleo-900",
  texto: "px-0 text-petroleo-800 hover:text-naranja-700 group-data-[tono=oscuro]/seccion:text-white group-data-[tono=oscuro]/seccion:hover:text-naranja-400",
};

const tamanos: Record<TamanoBoton, string> = {
  md: "min-h-11 px-5 text-[0.8125rem]",
  lg: "min-h-14 px-7 text-sm",
};

export function Boton(props: PropsEnlace | PropsBoton) {
  const { variante = "primario", tamano = "md", icono, flecha = false, bloque = false, className, children, ...resto } = props;

  const clases = cn(
    base,
    variantes[variante],
    variante === "texto" ? "min-h-11 text-[0.8125rem]" : tamanos[tamano],
    bloque && "w-full",
    className,
  );

  const contenido = (
    <>
      {icono}
      <span>{children}</span>
      {flecha && (
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform duration-300 ease-industrial group-hover/boton:translate-x-1"
        />
      )}
    </>
  );

  // Desestructurar una unión pierde el estrechamiento de tipos, así que se acota a mano.
  if (props.href !== undefined) {
    const { href, nativo, ...atributos } = resto as Omit<PropsEnlace, keyof PropsComunes>;
    // Enlaces externos, mailto: y rutas que no son páginas (como /api/whatsapp) van como <a> nativo:
    // un <Link> intentaría precargarlos como si fueran una página.
    const esInterno = href.startsWith("/") && !nativo;
    return esInterno ? (
      <Link href={href} className={clases} {...atributos}>
        {contenido}
      </Link>
    ) : (
      <a href={href} className={clases} {...atributos}>
        {contenido}
      </a>
    );
  }

  return (
    <button type="button" className={clases} {...(resto as Omit<PropsBoton, keyof PropsComunes>)}>
      {contenido}
    </button>
  );
}
