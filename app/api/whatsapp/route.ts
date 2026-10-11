import { NextResponse, type NextRequest } from "next/server";
import { LIMITES_DETALLE, VARIABLE_NUMERO, construirEnlaceWhatsApp, limpiarCampo, type DetallesCotizacion } from "@/lib/whatsapp";

// Punto único de entrada a WhatsApp. Los botones del sitio apuntan a /api/whatsapp?producto=<slug>
// y aquí se resuelve el destino: el número no aparece en el HTML ni en el JS público, y cada inicio
// de cotización queda en los registros del servidor sin cookies ni analítica de terceros.
//
// GET  → botón directo (solo el producto en la URL).
// POST → formulario con datos opcionales. Va por POST para que el nombre o la ciudad que escribe el
//        visitante no queden en la URL, en el historial ni en los registros del hosting.
//        Los registros guardan solo el slug, nunca los detalles.

// Solo un slug con forma válida llega a la búsqueda; el resto se trata como cotización general.
const FORMA_SLUG = /^[a-z0-9-]{1,80}$/;

export function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("producto");
  return responder(request, slug, {}, 302);
}

export async function POST(request: NextRequest) {
  let slug: string | null = null;
  const detalles: DetallesCotizacion = {};
  try {
    const datos = await request.formData();
    const producto = datos.get("producto");
    slug = typeof producto === "string" ? producto : null;
    detalles.cantidad = limpiarCampo(datos.get("cantidad"), LIMITES_DETALLE.cantidad);
    detalles.ciudad = limpiarCampo(datos.get("ciudad"), LIMITES_DETALLE.ciudad);
    detalles.contacto = limpiarCampo(datos.get("contacto"), LIMITES_DETALLE.contacto);
  } catch {
    // Cuerpo ilegible: seguimos con una cotización general en vez de dejar al visitante en un error.
  }
  // 303: el navegador sigue la redirección con GET, que es lo que espera wa.me.
  return responder(request, slug, detalles, 303);
}

function responder(request: NextRequest, slug: string | null, detalles: DetallesCotizacion, estado: 302 | 303) {
  const slugValido = slug && FORMA_SLUG.test(slug) ? slug : null;
  const destino = construirEnlaceWhatsApp(slugValido, detalles);

  if (!destino) {
    // Configuración incompleta: no dejamos al visitante en un error, lo llevamos al correo del pie.
    console.error(`[whatsapp] ${VARIABLE_NUMERO} no está configurada o no es válida.`);
    return noIndexar(NextResponse.redirect(new URL("/#contacto", request.url), estado === 302 ? 307 : 303));
  }

  console.info(`[whatsapp] inicio de cotización producto=${slugValido ?? "general"}`);
  return noIndexar(NextResponse.redirect(destino, estado));
}

function noIndexar(respuesta: NextResponse): NextResponse {
  respuesta.headers.set("X-Robots-Tag", "noindex, nofollow");
  respuesta.headers.set("Cache-Control", "no-store");
  return respuesta;
}
