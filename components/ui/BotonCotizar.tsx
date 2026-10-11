import { MessageCircle } from "lucide-react";
import { Boton, type TamanoBoton, type VarianteBoton } from "./Boton";

type Props = {
  /** Slug del producto del catálogo; sin él, la cotización es general. */
  producto?: string;
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  bloque?: boolean;
  className?: string;
  children?: string;
};

// Único componente que lleva a WhatsApp. Apunta a /api/whatsapp, nunca a wa.me: el número se
// resuelve en el servidor (app/api/whatsapp/route.ts) y no aparece en el HTML ni en el JS público.
export function BotonCotizar({ producto, variante = "primario", tamano = "md", bloque, className, children = "Cotizar por WhatsApp" }: Props) {
  const href = producto ? `/api/whatsapp?producto=${encodeURIComponent(producto)}` : "/api/whatsapp";
  return (
    <Boton
      href={href}
      nativo
      target="_blank"
      rel="noopener noreferrer"
      variante={variante}
      tamano={tamano}
      bloque={bloque}
      className={className}
      icono={<MessageCircle aria-hidden="true" className="size-[1.15em]" />}
    >
      {children}
    </Boton>
  );
}
