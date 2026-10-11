"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

// Acceso permanente a la cotización en móvil, donde está la mayoría de compradores de mercado.
// En escritorio queda como botón discreto en la esquina. Entra con retraso para no competir con la portada.
// Dentro de la ficha de un producto el mensaje ya sale con ese modelo; en el resto, es una cotización general.
// El número no pasa por aquí: el enlace va a /api/whatsapp y el servidor resuelve el destino.
export function BotonFlotante() {
  const pathname = usePathname();
  const slug = /^\/catalogo\/([a-z0-9-]{1,80})\/?$/.exec(pathname)?.[1];
  const href = slug ? `/api/whatsapp?producto=${encodeURIComponent(slug)}` : "/api/whatsapp";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Cotizar por WhatsApp (se abre en una pestaña nueva)"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 flex h-14 animate-flotante-in items-center gap-2.5 rounded-full bg-naranja-500 px-5 font-display ancho-normal text-[0.8125rem] font-bold uppercase tracking-[0.07em] text-petroleo-950 shadow-elevada transition-[background-color,transform] duration-300 ease-industrial hover:-translate-y-0.5 hover:bg-naranja-400 md:bottom-6 md:right-6"
    >
      <MessageCircle aria-hidden="true" className="size-5" />
      <span>Cotizar</span>
    </a>
  );
}
