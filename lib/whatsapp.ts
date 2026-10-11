import "server-only";
import { LIMITES_DETALLE_PUBLICOS as LIMITES_DETALLE } from "@/lib/limites-cotizacion";
import { formatearMedidas, obtenerProducto } from "@/lib/productos";

// Este módulo solo puede importarse desde código de servidor (la línea de arriba rompe el build
// si alguien lo importa desde un componente de cliente). Así el número jamás viaja al navegador
// dentro del JavaScript: llega únicamente como destino de una redirección de /api/whatsapp.

export const VARIABLE_NUMERO = "ERIZOPLAST_WHATSAPP_NUMBER";

/** Datos opcionales que el visitante puede añadir. Todos son texto libre, ya limpio. */
export type DetallesCotizacion = {
  cantidad?: string;
  ciudad?: string;
  contacto?: string;
};

function numeroComercial(): string | null {
  const numero = process.env[VARIABLE_NUMERO]?.replace(/\D/g, "");
  return numero && numero.length >= 8 && numero.length <= 15 ? numero : null;
}

export { LIMITES_DETALLE };

/**
 * Limpia un campo que escribió el visitante. Va dentro de un mensaje que él mismo envía a la
 * empresa, así que no hay inyección que temer, pero igual quitamos caracteres de control y de
 * formato (saltos de línea, direccionales invisibles) y acotamos el largo para que nadie arme un
 * mensaje enorme o ilegible desde un enlace.
 */
export function limpiarCampo(valor: unknown, maximo: number): string | undefined {
  if (typeof valor !== "string") return undefined;
  const limpio = valor
    .replace(/[\p{Cc}\p{Cf}]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maximo)
    .trim();
  return limpio || undefined;
}

/** «Jaba cosechera…» → «la jaba cosechera…»; cualquier otro nombre → «el producto <nombre>». */
function sintagmaProducto(nombre: string): string {
  if (/^(jaba|caja)\b/i.test(nombre)) return `la ${nombre.charAt(0).toLowerCase()}${nombre.slice(1)}`;
  return `el producto ${nombre}`;
}

/** Texto del primer mensaje. Solo usa datos del catálogo y los detalles ya limpios, nunca el slug crudo de la URL. */
export function mensajeCotizacion(slug: string | null, detalles: DetallesCotizacion = {}): string {
  const producto = slug ? obtenerProducto(slug) : undefined;
  const partes: string[] = [];

  if (producto) {
    partes.push(
      `Hola, estoy interesado en cotizar ${sintagmaProducto(producto.nombre)}. Quisiera conocer los precios por volumen y las opciones de entrega.`,
    );
    // Los nombres ya llevan sus medidas; solo las líneas con varios tamaños piden elegir uno.
    if (producto.otrasMedidas?.length) {
      const opciones = [producto.medidas, ...producto.otrasMedidas].map(formatearMedidas).join(" / ");
      partes.push(`Tamaño que necesito: __ (${opciones}).`);
    }
  } else {
    partes.push(
      "Hola, estoy interesado en cotizar jabas plásticas. Quisiera conocer los precios por volumen y las opciones de entrega.",
    );
  }

  if (detalles.cantidad) partes.push(`Cantidad aproximada: ${detalles.cantidad}.`);
  if (detalles.ciudad) partes.push(`Ciudad de entrega: ${detalles.ciudad}.`);
  if (detalles.contacto) partes.push(`Nombre o empresa: ${detalles.contacto}.`);

  return partes.join(" ");
}

/** URL de WhatsApp, o null si el número no está configurado. */
export function construirEnlaceWhatsApp(slug: string | null, detalles: DetallesCotizacion = {}): string | null {
  const numero = numeroComercial();
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensajeCotizacion(slug, detalles))}`;
}
