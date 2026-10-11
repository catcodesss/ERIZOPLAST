import type { IdCategoria } from "./categorias";
import type { IdFoto } from "./fotos";

// PRELIMINAR: líneas que la portada muestra como vista previa del catálogo; cada una lleva a una
// categoría del catálogo (Fase 4) y NO está confirmada por PLASTINORTE. Las fotos son referenciales (bancos
// de imágenes), no producto propio. Los textos describen el uso típico de la línea, nunca medidas
// ni especificaciones: esas llegan con el catálogo verificado.

export type LineaDestacada = {
  /** Categoría del catálogo a la que lleva la pieza (/catalogo/categoria/<id>). */
  categoria: IdCategoria;
  nombre: string;
  texto: string;
  foto: IdFoto;
  /** object-position de la foto: decide qué parte sobrevive al recorte de cada mosaico. */
  posicion: string;
};

export const lineasDestacadas: LineaDestacada[] = [
  {
    categoria: "industriales",
    nombre: "Industrial y logística",
    texto: "Apilables para almacenes, distribución y reparto.",
    foto: "industrial-cerrada-azul",
    // Pegada a la derecha: deja fuera la etiqueta con nombre propio y el texto grabado de otra empresa.
    posicion: "100% 40%",
  },
  {
    categoria: "alimentos",
    nombre: "Pesca y alimentos frescos",
    texto: "Para manipular y transportar productos frescos.",
    foto: "pesca-jabas-verdes",
    posicion: "20% 42%",
  },
  {
    categoria: "agricolas",
    nombre: "Agrícola y cosechera",
    texto: "Ventiladas, para recolectar y transportar frutas y hortalizas.",
    foto: "agricola-jabas-caladas",
    posicion: "50% 62%",
  },
];
