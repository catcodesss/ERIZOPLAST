import { NextResponse, type NextRequest } from "next/server";
import { enviarAvisoNovedades } from "@/lib/novedades";
import { validarNovedades, type ErroresNovedades } from "@/lib/novedades-validacion";

// Formulario de novedades. Defensas, de la más barata a la más cara: tipo y tamaño del cuerpo, mismo origen,
// campo trampa, tiempo mínimo de relleno, validación (consentimiento incluido), límite por IP y global, y solo
// entonces el servicio externo. Ninguna es infalible: frenan bots simples y el abuso casual, no un ataque decidido.

const MAX_CUERPO = 2_000;
const TIEMPO_MINIMO_MS = 1_500; // un humano no rellena y envía en menos
const VENTANA_MS = 60 * 60 * 1000;
const MAX_POR_IP = 5;
const MAX_GLOBAL = 40; // protege la cuota diaria del plan gratuito de Resend frente a una ráfaga

// En memoria: en Vercel cada instancia tiene la suya. Para algo firme haría falta un almacén compartido (Upstash).
const porIp = new Map<string, { desde: number; cuenta: number }>();
const cupoGlobal = { desde: 0, cuenta: 0 };

function superaLimite(ip: string): boolean {
  const ahora = Date.now();
  for (const [clave, registro] of porIp) if (ahora - registro.desde > VENTANA_MS) porIp.delete(clave);
  if (ahora - cupoGlobal.desde > VENTANA_MS) Object.assign(cupoGlobal, { desde: ahora, cuenta: 0 });

  const registro = porIp.get(ip) ?? { desde: ahora, cuenta: 0 };
  registro.cuenta += 1;
  porIp.set(ip, registro);
  // Lo ya bloqueado por IP no gasta el cupo global: si no, una sola IP insistente dejaría sin formulario a todos.
  if (registro.cuenta > MAX_POR_IP) return true;

  cupoGlobal.cuenta += 1;
  return cupoGlobal.cuenta > MAX_GLOBAL;
}

// El navegador puede mandar «Origin: null» (p. ej. desde un iframe aislado): eso no es un host.
function hostDe(origen: string): string | null {
  try {
    return new URL(origen).host;
  } catch {
    return null;
  }
}

function responder(estado: number, mensaje: string, extra?: { errores?: ErroresNovedades; reintentarEn?: number }) {
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (extra?.reintentarEn) headers["Retry-After"] = String(extra.reintentarEn);
  return NextResponse.json({ ok: estado === 200, mensaje, errores: extra?.errores }, { status: estado, headers });
}

export async function POST(request: NextRequest) {
  // Un navegador siempre manda Origin en un POST; su ausencia es típica de scripts sueltos.
  const origen = request.headers.get("origin");
  if (!origen || hostDe(origen) !== request.headers.get("host")) return responder(403, "Solicitud no permitida.");
  if (!request.headers.get("content-type")?.includes("application/json")) return responder(415, "Solicitud no válida.");

  const texto = await request.text();
  if (texto.length > MAX_CUERPO) return responder(413, "Solicitud demasiado grande.");

  let datos: Record<string, unknown>;
  try {
    const analizado: unknown = JSON.parse(texto);
    if (typeof analizado !== "object" || analizado === null || Array.isArray(analizado)) throw new Error();
    datos = analizado as Record<string, unknown>;
  } catch {
    return responder(400, "Solicitud no válida.");
  }

  // Campo trampa: una persona no lo ve y no lo llena. Se responde «bien» sin hacer nada para no enseñarle
  // al bot qué falló. Es lo único que se finge, y solo ante algo que no es una persona.
  if (typeof datos.url_confirmacion === "string" && datos.url_confirmacion !== "") return responder(200, "Listo.");

  // Tiempo mínimo: esto sí devuelve error y no un falso éxito, para no perder a una persona real con autocompletado.
  if (typeof datos.tiempo !== "number" || datos.tiempo < TIEMPO_MINIMO_MS) {
    return responder(429, "Has enviado el formulario demasiado rápido. Espera un momento e inténtalo de nuevo.", { reintentarEn: 3 });
  }

  const validacion = validarNovedades({ correo: datos.correo, empresa: datos.empresa, consentimiento: datos.consentimiento });
  if (!validacion.ok) return responder(400, "Revisa los campos marcados.", { errores: validacion.errores });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "desconocida";
  if (superaLimite(ip)) return responder(429, "Demasiados intentos. Prueba de nuevo en un rato.", { reintentarEn: 600 });

  switch (await enviarAvisoNovedades(validacion.datos)) {
    case "ok":
      return responder(200, "Listo. Recibimos tu correo y te escribiremos con información sobre nuestros productos.");
    case "no-configurado":
      return responder(503, "Este formulario aún no está disponible. Mientras tanto, escríbenos por WhatsApp o al correo del pie de página.");
    case "reintentar":
      return responder(503, "No pudimos enviar tus datos ahora. Prueba de nuevo en unos minutos.", { reintentarEn: 60 });
    default:
      return responder(502, "No pudimos enviar tus datos. Escríbenos por WhatsApp o al correo del pie de página.");
  }
}
