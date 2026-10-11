// Datos de la empresa. Lo que está en `null` no se muestra en ninguna parte hasta que se complete.
// El número de WhatsApp NO está aquí a propósito: vive en la variable de entorno
// ERIZOPLAST_WHATSAPP_NUMBER y solo lo lee el servidor (ver app/api/whatsapp/route.ts).

export const empresa = {
  nombre: "PLASTINORTE",
  lema: "Fabricantes de jabas plásticas industriales",
  descripcion:
    "Fabricamos, comercializamos y distribuimos jabas plásticas industriales para empresas, almacenes, distribuidores y comerciantes.",
  zona: "Lima Norte, Lima, Perú",
  correo: "dylan_cal@outlook.com",
  // Pendientes de confirmar con la empresa (ver PLAN-FASE-1.md, §12):
  razonSocial: null as string | null,
  ruc: null as string | null,
  direccion: null as string | null,
  cobertura: {
    local: "Lima Metropolitana",
    nacional: "Envíos a todo el Perú",
  },
  ventajas: [
    { id: "fabricacion", titulo: "Fabricación propia", texto: "Producimos nosotros mismos lo que vendemos." },
    { id: "directo", titulo: "Venta directa", texto: "Sin intermediarios entre la planta y tu almacén." },
    { id: "flota", titulo: "Flota propia", texto: "Entregamos con nuestros camiones." },
    { id: "nacional", titulo: "Todo el Perú", texto: "Despachos a Lima y a provincias." },
  ],
} as const;
