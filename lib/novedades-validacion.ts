// Validación del formulario de novedades. Sin `server-only` a propósito: la ejecutan los dos lados, el
// navegador (para avisar al instante) y el servidor (que es quien manda: el navegador se puede saltar).
// Que sea el mismo código evita que ambos discrepen sobre qué es un correo válido.

export const MAX_CORREO = 254;
export const MAX_EMPRESA = 120;

export type CamposNovedades = "correo" | "empresa" | "consentimiento";
export type ErroresNovedades = Partial<Record<CamposNovedades, string>>;

export type DatosNovedades = { correo: string; empresa: string | null };

export type ResultadoValidacion = { ok: true; datos: DatosNovedades } | { ok: false; errores: ErroresNovedades };

// Caracteres que el estándar admite en la parte local (RFC 5322 «atext»). Se restringe a propósito: el
// correo se usa luego como dirección de respuesta, y no queremos que entren comillas, ángulos ni comas.
const PARTE_LOCAL = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i;
const DOMINIO = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i;

export function correoValido(correo: string): boolean {
  if (correo.length > MAX_CORREO) return false;
  const arroba = correo.indexOf("@");
  if (arroba < 1 || arroba !== correo.lastIndexOf("@")) return false;
  const local = correo.slice(0, arroba);
  const dominio = correo.slice(arroba + 1);
  return (
    local.length <= 64 &&
    PARTE_LOCAL.test(local) &&
    !local.startsWith(".") &&
    !local.endsWith(".") &&
    !local.includes("..") &&
    DOMINIO.test(dominio) &&
    dominio.split(".").every((parte) => !parte.startsWith("-") && !parte.endsWith("-")) &&
    /[a-z]{2,}$/i.test(dominio)
  );
}

// Espacios internos colapsados y sin caracteres de control (saltos de línea incluidos): el nombre acabará
// en el asunto de un correo.
function limpiarEmpresa(valor: string): string {
  return valor.replace(/\p{Cc}/gu, " ").replace(/\s+/g, " ").trim();
}

export function validarNovedades(entrada: { correo: unknown; empresa: unknown; consentimiento: unknown }): ResultadoValidacion {
  const errores: ErroresNovedades = {};

  const correo = typeof entrada.correo === "string" ? entrada.correo.trim().toLowerCase() : "";
  if (!correo) errores.correo = "Escribe tu correo electrónico.";
  else if (!correoValido(correo)) errores.correo = "Revisa el correo: debe tener la forma nombre@empresa.com.";

  let empresa: string | null = null;
  if (entrada.empresa !== undefined && entrada.empresa !== null && entrada.empresa !== "") {
    if (typeof entrada.empresa !== "string") errores.empresa = "El nombre de la empresa no es válido.";
    else {
      const limpia = limpiarEmpresa(entrada.empresa);
      if (limpia.length > MAX_EMPRESA) errores.empresa = `Usa como máximo ${MAX_EMPRESA} caracteres.`;
      else empresa = limpia || null;
    }
  }

  // Solo `true` cuenta: ni "true", ni 1, ni la ausencia del campo.
  if (entrada.consentimiento !== true) {
    errores.consentimiento = "Marca la casilla para que podamos enviarte información comercial.";
  }

  return Object.keys(errores).length > 0 ? { ok: false, errores } : { ok: true, datos: { correo, empresa } };
}
