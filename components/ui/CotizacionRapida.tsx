import { ChevronRight, MessageCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { LIMITES_DETALLE_PUBLICOS } from "@/lib/limites-cotizacion";
import { Boton } from "./Boton";

type Props = {
  /** Slug del producto; sin él, la cotización es general. */
  producto?: string;
  /** «oscuro» para secciones sobre fondo petróleo o foto. */
  tono?: "claro" | "oscuro";
  /** Abre el panel desde el inicio (la página de contacto no lo esconde). */
  abierto?: boolean;
  className?: string;
};

// Datos opcionales para quien quiere llegar a WhatsApp con la conversación ya encaminada. No es un
// formulario de contacto: el botón de «Cotizar» de cada sitio funciona sin tocar nada de esto.
// Es un <form> nativo (method POST, sin JavaScript) para que el nombre o la ciudad viajen en el
// cuerpo de la petición y no en la URL. El servidor los limpia y los pone en el mensaje; no los guarda.
export function CotizacionRapida({ producto, tono = "claro", abierto = false, className }: Props) {
  const oscuro = tono === "oscuro";
  const idBase = `cotizacion-${producto ?? "general"}`;

  const campo = cn(
    "min-h-12 w-full rounded-pieza border px-4 text-[0.9375rem]",
    oscuro
      ? "border-white/25 bg-petroleo-900 text-white placeholder:text-petroleo-300 focus-visible:border-naranja-400"
      : "border-concreto-300 bg-white text-petroleo-900 placeholder:text-concreto-500 focus-visible:border-petroleo-600",
  );
  const etiqueta = cn("mb-1.5 block text-sm font-medium", oscuro ? "text-petroleo-50" : "text-petroleo-900");

  return (
    <details open={abierto || undefined} className={cn("group/detalles", className)}>
      <summary
        className={cn(
          "inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-medium underline underline-offset-4 [&::-webkit-details-marker]:hidden",
          oscuro ? "text-petroleo-50 hover:text-white" : "text-petroleo-700 hover:text-naranja-700",
        )}
      >
        <ChevronRight aria-hidden="true" className="size-4 shrink-0 transition-transform duration-200 group-open/detalles:rotate-90" />
        Añadir cantidad, ciudad o tu nombre (opcional)
      </summary>

      <form method="post" action="/api/whatsapp" target="_blank" className="mt-4 grid gap-4 sm:grid-cols-2">
        {producto && <input type="hidden" name="producto" value={producto} />}

        <div>
          <label htmlFor={`${idBase}-cantidad`} className={etiqueta}>
            Cantidad aproximada
          </label>
          <input
            id={`${idBase}-cantidad`}
            name="cantidad"
            type="text"
            inputMode="text"
            maxLength={LIMITES_DETALLE_PUBLICOS.cantidad}
            autoComplete="off"
            placeholder="Ej.: 500 unidades"
            className={campo}
          />
        </div>
        <div>
          <label htmlFor={`${idBase}-ciudad`} className={etiqueta}>
            Ciudad de entrega
          </label>
          <input
            id={`${idBase}-ciudad`}
            name="ciudad"
            type="text"
            maxLength={LIMITES_DETALLE_PUBLICOS.ciudad}
            autoComplete="address-level2"
            placeholder="Ej.: Lima, Piura, Arequipa"
            className={campo}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${idBase}-contacto`} className={etiqueta}>
            Tu nombre o empresa
          </label>
          <input
            id={`${idBase}-contacto`}
            name="contacto"
            type="text"
            maxLength={LIMITES_DETALLE_PUBLICOS.contacto}
            autoComplete="organization"
            placeholder="Ej.: Distribuidora San Martín"
            className={campo}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 sm:col-span-2">
          <Boton type="submit" variante="primario" icono={<MessageCircle aria-hidden="true" className="size-[1.15em]" />}>
            Abrir WhatsApp con estos datos
          </Boton>
          <p className={cn("text-sm", oscuro ? "text-petroleo-200" : "text-concreto-600")}>
            Todo es opcional. Solo arma tu mensaje: no guardamos estos datos.
          </p>
        </div>
      </form>
    </details>
  );
}
