// INTERNO — nunca importar desde app/ ni components/. Aquí viven las fuentes de cada producto y los
// precios de la competencia en los que se basan los precios referenciales. Si un componente lo
// importara, esos precios llegarían al navegador. Solo lo leen `npm run validar` y el equipo.
//
// Consultado el 09/10/2026. Los precios de tiendas en línea cambian: revisarlos antes de publicar.
// Resumen legible y explicación de qué es verificado y qué no: FUENTES-FASE-4.md.

export type FuenteMedidas = { proveedor: string; url: string; dato: string };

export type ReferenciaMercado = {
  /** Producto equivalente con precio publicado. */
  producto: string;
  proveedor: string;
  url: string;
  soles: number;
  /** Medidas del producto de referencia, para juzgar si es realmente equivalente. */
  medidas: string;
  consultado: string;
};

export type FuentesProducto = {
  medidas: FuenteMedidas[];
  referenciaMercado?: ReferenciaMercado;
};

export const fuentesProductos: Record<string, FuentesProducto> = {
  "jaba-cosechera-calada-52x36x31": {
    medidas: [
      { proveedor: "Grupo Logipack", url: "https://grupologipack.com/cajas-de-plastico", dato: "52 × 36 × 31 cm; PEAD; calada, semicalada o cerrada" },
      { proveedor: "Envases Industriales", url: "https://envasesindustriales.net/jabas", dato: "52,3 × 35,8 × 31,5 cm; 25 kg / 42 L; calada; asas ergonómicas" },
      { proveedor: "Mallplast (BASA 8954)", url: "https://www.mallplast.pe/cajas-cosecheras/caja-cosechera-blindada", dato: "52,2 × 36,2 × 31,8 cm; PEAD; usos mango, palta, cítricos" },
    ],
    referenciaMercado: {
      producto: "Caja cosechera blindada (PEAD) — BASA, cód. 8954",
      proveedor: "Mallplast (distribuidor en línea)",
      url: "https://www.mallplast.pe/cajas-cosecheras/caja-cosechera-blindada",
      soles: 35.52,
      medidas: "52,2 × 36,2 × 31,8 cm",
      consultado: "2026-10-09",
    },
  },
  "jaba-agricola-cana-baja-60x40x21": {
    medidas: [
      { proveedor: "Grupo Logipack", url: "https://grupologipack.com/cajas-de-plastico", dato: "60 × 40 × 21 cm; PEAD; calada, semicalada o cerrada" },
      { proveedor: "Envases Industriales", url: "https://envasesindustriales.net/jabas", dato: "60,2 × 40,2 × 21,2 cm; 34,3 L; fondo liso o calado; aro de refuerzo" },
      { proveedor: "ReyPlast", url: "https://www.reyplast.pe/producto/caja-cosechera-cana-baja-calada-robusta", dato: "60,2 × 40,2 × 21,2 cm; 34,3 L" },
    ],
    referenciaMercado: {
      producto: "Caja agrícola caña baja piso calado P21 100 % virgen — Polinplast, cód. T0068200T",
      proveedor: "Mallplast (distribuidor en línea)",
      url: "https://www.mallplast.pe/cajas-cosecheras/caja-agricola-cana-baja-piso-cal-p21-100-virgen",
      soles: 29.28,
      medidas: "60 × 40 × 21 cm (36 L)",
      consultado: "2026-10-09",
    },
  },
  "jaba-cosechera-cerrada-52x36x31": {
    medidas: [
      { proveedor: "Grupo Logipack", url: "https://grupologipack.com/cajas-de-plastico", dato: "52 × 36 × 31 cm, variante cerrada de la cosechera" },
      { proveedor: "Mallplast (Polinplast T0959000T)", url: "https://www.mallplast.pe/cajas-cosecheras/caja-cosechera-cerrada-industrial-100-virgen", dato: "51,4 × 34,8 × 30,4 cm; 25 kg — existe, pero NO es equivalente en medidas (hasta 1,2 cm menos): no se usa como precio" },
    ],
  },
  "jaba-para-pescado-70x40x24": {
    medidas: [
      { proveedor: "Grupo Logipack", url: "https://grupologipack.com/cajas-de-plastico", dato: "70 × 40 × 24 cm; PEAD; drenaje o fondo cerrado; con o sin tapa" },
      { proveedor: "Cilansac (mod. GB)", url: "https://cilansac.com.pe/product/jaba-para-pescado-mod-gb/", dato: "70 × 40 × 24 cm; 3 kg; 40 L; 28 kg" },
      { proveedor: "Mallplast (Polinplast T0679000T)", url: "https://www.mallplast.pe/jabas-pesqueras/caja-de-pescado-zeus-II-s-hueco", dato: "70 × 40,5 × 24 cm; 40 L" },
    ],
    referenciaMercado: {
      producto: "Caja de pescado Zeus II sin hueco — Polinplast, cód. T0679000T",
      proveedor: "Mallplast (distribuidor en línea)",
      url: "https://www.mallplast.pe/jabas-pesqueras/caja-de-pescado-zeus-II-s-hueco",
      soles: 45.91,
      medidas: "70 × 40,5 × 24 cm (40 L)",
      consultado: "2026-10-09",
    },
  },
  "caja-para-alimentos-con-tapa-62x41x22": {
    medidas: [
      { proveedor: "BASA (fabricante)", url: "https://www.basa.com.pe/jaba-para-alimentos-pead-8808/p", dato: "61,7 × 41,5 × 22 cm; 38 L; PEAD; tapa integrada; apilable" },
    ],
  },
  "caja-industrial-cerrada-pp": {
    medidas: [
      { proveedor: "Grupo Logipack", url: "https://grupologipack.com/cajas-de-plastico", dato: "50×40×20, 50×40×41, 77×47×28 y 80×50×32 cm; polipropileno; apilable, lavable, con asas" },
    ],
  },
  "caja-cerrada-con-tapa-54x39x31": {
    medidas: [
      { proveedor: "Grupo Logipack", url: "https://grupologipack.com/cajas-de-plastico", dato: "54,3 × 38,7 × 31,2 cm; PEAD; tapa doble con orificios para precintos" },
    ],
  },
};
