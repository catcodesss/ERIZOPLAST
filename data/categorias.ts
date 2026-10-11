// Las seis categorías del catálogo (Fase 4). Son las que pidió PLASTINORTE; un producto puede estar
// en varias (la primera es la principal). Una categoría sin productos sigue apareciendo en los filtros
// con su aviso: es preferible a esconder que esa línea aún no tiene un modelo verificado.
// Sin imports de runtime: lo lee también scripts/validar-catalogo.mjs directamente con Node.

export const CATEGORIAS = [
  {
    id: "caladas-multiuso",
    /** Título de su página (/catalogo/categoria/<id>): es el H1 y lo que lee el buscador. */
    titulo: "Jabas plásticas caladas multiuso",
    nombre: "Caladas multiuso",
    descripcion: "Paredes y fondo ventilados para productos que necesitan aire.",
  },
  {
    id: "cerradas",
    /** Título de su página (/catalogo/categoria/<id>): es el H1 y lo que lee el buscador. */
    titulo: "Jabas plásticas cerradas",
    nombre: "Cerradas",
    descripcion: "Paredes cerradas, con o sin tapa, para mercadería que no debe filtrarse ni verse.",
  },
  {
    id: "agricolas",
    /** Título de su página (/catalogo/categoria/<id>): es el H1 y lo que lee el buscador. */
    titulo: "Jabas plásticas agrícolas y fruteras",
    nombre: "Agrícolas y fruteras",
    descripcion: "Para cosechar, clasificar y transportar frutas y hortalizas.",
  },
  {
    id: "alimentos",
    /** Título de su página (/catalogo/categoria/<id>): es el H1 y lo que lee el buscador. */
    titulo: "Jabas plásticas para alimentos",
    nombre: "Para alimentos",
    descripcion: "Para pescado, carnes y otros alimentos frescos.",
  },
  {
    id: "panaderas",
    /** Título de su página (/catalogo/categoria/<id>): es el H1 y lo que lee el buscador. */
    titulo: "Jabas plásticas panaderas",
    nombre: "Panaderas",
    descripcion: "Para panificación y distribución de pan.",
  },
  {
    id: "industriales",
    /** Título de su página (/catalogo/categoria/<id>): es el H1 y lo que lee el buscador. */
    titulo: "Jabas plásticas industriales y de almacenamiento",
    nombre: "Industriales y almacenamiento",
    descripcion: "Para almacenes, producción y distribución.",
  },
] as const;

export type IdCategoria = (typeof CATEGORIAS)[number]["id"];
