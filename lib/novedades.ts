import "server-only";
import { TEXTO_CONSENTIMIENTO, VERSION_CONSENTIMIENTO } from "@/data/consentimiento";
import { empresa } from "@/data/empresa";
import { correoValido, type DatosNovedades } from "@/lib/novedades-validacion";

// Aviso por correo, vía la API de Resend, cada vez que alguien deja sus datos en el formulario de novedades.
// Solo servidor: la clave nunca llega al navegador. El buzón de destino hace de registro de contactos; no
// hay base de datos. Sin clave el formulario responde «no disponible» y no recoge nada: no se finge ningún envío.
//
// No se escribe el correo ni la empresa en ningún registro (ni log ni mensaje de error): son datos personales.

export type ResultadoEnvio = "ok" | "no-configurado" | "reintentar" | "error";

export const VARIABLE_CLAVE = "ERIZOPLAST_RESEND_API_KEY";
export const VARIABLE_DESTINO = "ERIZOPLAST_CONTACTO_DESTINO";
export const VARIABLE_REMITENTE = "ERIZOPLAST_CONTACTO_REMITENTE";

// Remitente de pruebas de Resend: solo entrega al correo con el que se creó la cuenta de Resend. Para
// escribir a otras direcciones (o salir de las pruebas) hay que verificar un dominio propio en Resend.
const REMITENTE_PRUEBAS = "PLASTINORTE <onboarding@resend.dev>";
const URL_RESEND = "https://api.resend.com/emails";

type Configuracion = { clave: string; destino: string; remitente: string; url: string };

function configuracion(): Configuracion | null {
  const clave = process.env[VARIABLE_CLAVE]?.trim();
  if (!clave) return null;

  const destino = process.env[VARIABLE_DESTINO]?.trim() || empresa.correo;
  if (!correoValido(destino.toLowerCase())) {
    console.error(`[novedades] ${VARIABLE_DESTINO} no es una dirección válida.`);
    return null;
  }

  const remitente = process.env[VARIABLE_REMITENTE]?.trim() || REMITENTE_PRUEBAS;
  // La URL solo se puede cambiar fuera de producción: permite probar contra un servidor simulado sin que
  // una variable mal puesta en producción desvíe los datos de los visitantes a otro destino.
  const url = process.env.NODE_ENV !== "production" && process.env.ERIZOPLAST_RESEND_URL ? process.env.ERIZOPLAST_RESEND_URL : URL_RESEND;
  return { clave, destino, remitente, url };
}

export function novedadesConfiguradas(): boolean {
  return configuracion() !== null;
}

function fechaLima(): string {
  return new Intl.DateTimeFormat("es-PE", { dateStyle: "full", timeStyle: "long", timeZone: "America/Lima" }).format(new Date());
}

function redactarAviso(datos: DatosNovedades): { asunto: string; texto: string } {
  const asunto = datos.empresa ? `Nuevo contacto comercial: ${datos.empresa}` : "Nuevo contacto comercial desde la web";
  const texto = [
    "Una persona pidió recibir información comercial desde el formulario de novedades del sitio web.",
    "",
    `Correo: ${datos.correo}`,
    `Empresa: ${datos.empresa ?? "(no indicada)"}`,
    `Fecha y hora (Lima): ${fechaLima()}`,
    "",
    "CONSTANCIA DEL CONSENTIMIENTO",
    "La persona marcó por sí misma la casilla (aparece sin marcar). Texto que aceptó:",
    `«${TEXTO_CONSENTIMIENTO}»`,
    `Versión del texto: ${VERSION_CONSENTIMIENTO}`,
    "",
    "Conserva este mensaje: es la prueba del consentimiento. Puedes responderlo para escribirle directamente.",
    "Si esta persona pide darse de baja, deja de enviarle comunicaciones comerciales y elimina sus datos si lo solicita.",
  ].join("\n");
  return { asunto, texto };
}

export async function enviarAvisoNovedades(datos: DatosNovedades): Promise<ResultadoEnvio> {
  const config = configuracion();
  if (!config) return "no-configurado";

  const { asunto, texto } = redactarAviso(datos);

  let respuesta: Response;
  try {
    respuesta = await fetch(config.url, {
      method: "POST",
      headers: { authorization: `Bearer ${config.clave}`, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ from: config.remitente, to: [config.destino], reply_to: datos.correo, subject: asunto, text: texto }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
  } catch {
    // Red caída o tiempo agotado. Si Resend llegó a enviarlo, un reintento duplicaría el aviso: es el mal menor.
    console.error("[novedades] No se pudo contactar con Resend (red o tiempo agotado).");
    return "reintentar";
  }

  const cuerpo = (await respuesta.json().catch(() => null)) as { id?: unknown; name?: unknown } | null;

  // «Aceptado» solo si Resend devuelve el identificador del correo: un 200 sin él no prueba nada.
  if (respuesta.ok && typeof cuerpo?.id === "string") return "ok";

  if (respuesta.status === 429 || respuesta.status >= 500) {
    console.error(`[novedades] Resend respondió ${respuesta.status} (se puede reintentar).`);
    return "reintentar";
  }

  // 401/403: clave inválida, o remitente de pruebas hacia una dirección que no es la de la cuenta.
  // 422: datos rechazados. Se anota solo el código y el nombre del error, nunca el cuerpo ni los datos.
  const nombre = typeof cuerpo?.name === "string" ? cuerpo.name.slice(0, 60) : "sin_nombre";
  console.error(`[novedades] Resend respondió ${respuesta.status} (${nombre}). Revisa la clave y el remitente en CONFIGURACION-FASE-7.md.`);
  return "error";
}
