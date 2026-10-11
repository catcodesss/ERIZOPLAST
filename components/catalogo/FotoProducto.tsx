import type { Producto } from "@/data/tipos";
import { Foto } from "@/components/ui/Foto";
import { PlanoModelo } from "@/components/ui/PlanoModelo";
import { cn } from "@/lib/cn";

type Props = {
  producto: Producto;
  relacion?: "4/3" | "1/1" | "3/4";
  sizes?: string;
  preload?: boolean;
};

const relaciones = { "4/3": "aspect-[4/3]", "1/1": "aspect-square", "3/4": "aspect-[3/4]" } as const;

// Tres casos, en este orden: foto propia → foto de banco rotulada «Imagen referencial» → esquema con las medidas
// del modelo. Nunca se muestra una foto de banco sin su rótulo ni se hace pasar por el producto; y el esquema es un
// dibujo, rotulado como tal, que se retira cuando exista la foto propia.
export function FotoProducto({ producto, relacion = "4/3", sizes, preload }: Props) {
  const propia = producto.imagenes[0];
  if (propia) return <Foto src={propia} alt={producto.nombre} relacion={relacion} sizes={sizes} preload={preload} />;
  if (producto.fotoReferencial) return <Foto id={producto.fotoReferencial} relacion={relacion} sizes={sizes} preload={preload} />;

  return (
    <div className={cn("relative flex flex-col items-center justify-center gap-3 overflow-hidden bg-petroleo-800 px-6 py-5 textura-calada-clara", relaciones[relacion])}>
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-br from-petroleo-600/70 via-petroleo-800/40 to-petroleo-950/80" />
      <PlanoModelo medidas={producto.medidas} className="relative max-w-[17rem]" />
      <p className="relative text-center font-mono text-[0.6875rem] uppercase leading-snug tracking-[0.12em] text-petroleo-200">
        Esquema referencial · cotas en cm
        <span className="block text-petroleo-300">Foto propia próximamente</span>
      </p>
    </div>
  );
}
