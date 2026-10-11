// Texto exacto que ve quien marca la casilla de novedades. Vive aquí, y no dentro del formulario, porque
// lo leen dos lados que deben coincidir: el formulario (lo muestra) y el servidor (lo anota en el aviso
// como constancia de qué aceptó la persona). Si cambia el texto, hay que subir la versión: así cada
// aviso conserva la versión que de verdad se mostró.
//
// Esto es contenido legal sin revisar por un abogado (ver REVISION-LEGAL-FASE-7.md).

export const VERSION_CONSENTIMIENTO = "2026-10-v1";

// La finalidad comercial va en la propia frase de la casilla, no escondida en la política.
export const TEXTO_CONSENTIMIENTO =
  "Acepto que PLASTINORTE use mi correo electrónico y, si lo indico, el nombre de mi empresa para enviarme " +
  "información comercial sobre su catálogo, nuevos productos y novedades. Puedo retirar este consentimiento " +
  "cuando quiera.";
