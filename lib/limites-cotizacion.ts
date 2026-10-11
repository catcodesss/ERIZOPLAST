// Largo máximo de los datos opcionales de cotización. Está en un módulo aparte, sin `server-only`,
// porque lo leen dos lados que deben coincidir: el atributo maxLength del formulario y la limpieza
// que hace el servidor (lib/whatsapp.ts). Aquí no hay nada sensible.
export const LIMITES_DETALLE_PUBLICOS = { cantidad: 40, ciudad: 60, contacto: 80 } as const;
