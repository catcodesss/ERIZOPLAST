import { CATEGORIAS, type IdCategoria } from "@/data/categorias";
import { productos } from "@/data/productos";
import type { Disponibilidad, Medidas, Precio, Producto } from "@/data/tipos";

export function productosPublicados(): Producto[] {
  return productos.filter((p) => p.publicado);
}

export function obtenerProducto(slug: string): Producto | undefined {
  return productosPublicados().find((p) => p.slug === slug);
}

export function nombreCategoria(id: IdCategoria): string {
  return CATEGORIAS.find((c) => c.id === id)?.nombre ?? id;
}

export function esCategoria(valor: string | null | undefined): valor is IdCategoria {
  return CATEGORIAS.some((c) => c.id === valor);
}

const numero = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 1 });
const soles = new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatearMedidas({ largo, ancho, alto }: Medidas): string {
  return `${numero.format(largo)} × ${numero.format(ancho)} × ${numero.format(alto)} cm`;
}

export function formatearSoles(valor: number): string {
  return `S/ ${soles.format(valor)}`;
}

export function textoPrecio(precio: Precio): string {
  return precio.tipo === "referencial" ? formatearSoles(precio.soles) : precio.etiqueta;
}

const etiquetasDisponibilidad: Record<Disponibilidad, string> = {
  "en-stock": "En stock",
  "bajo-pedido": "Fabricación bajo pedido",
  consultar: "A consultar",
  "no-disponible": "No disponible por ahora",
};

export function etiquetaDisponibilidad(d: Disponibilidad): string {
  return etiquetasDisponibilidad[d];
}

/** Aviso legal de precios: va junto a todo precio publicado. */
export const AVISO_PRECIOS =
  "Precio referencial por unidad, en soles. Sujeto a confirmación comercial: el IGV, la cantidad, el color y el flete se confirman en la cotización.";

/** Aviso de medidas mientras PLASTINORTE no confirme cada modelo. */
export const AVISO_MEDIDAS =
  "Medidas, capacidad y carga nominales: pueden variar algo según el molde. Las confirmamos al cotizar.";

/** Aviso visible en las fichas de modelos que PLASTINORTE aún no ha confirmado uno por uno. */
export const AVISO_MODELO_FICHA =
  "Confirmaremos las medidas, el material, los colores y las versiones disponibles al cotizar, antes de cualquier pedido.";

/** El mismo aviso, en general, para la parte alta del catálogo. */
export const AVISO_MODELO_CATALOGO =
  "Los modelos y sus datos son referenciales: confirmamos medidas, material, colores y versiones al cotizar, antes de cualquier pedido.";

/** Un modelo está pendiente mientras la empresa no confirme que lo fabrica con esos datos. */
export function modeloPendiente(p: Producto): boolean {
  return p.confirmacionEmpresa !== "confirmado";
}

/** ¿Hay algún precio publicado? Si no, el catálogo no menciona precios. */
export function hayPreciosPublicados(lista: Producto[]): boolean {
  return lista.some((p) => p.precio.tipo === "referencial");
}

/** Minúsculas y sin tildes, para que «cosechera» encuentre «Cosechéra» y «52x36» encuentre «52 × 36». */
export function normalizarBusqueda(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[×*]/g, "x")
    .replace(/(\d)\s*x\s*(?=\d)/g, "$1x")
    .replace(/,/g, ".")
    .replace(/\s+/g, " ")
    .trim();
}

/** Texto por el que se busca de un producto: nombre, categorías, medidas y usos. */
export function textoBuscable(p: Producto): string {
  const medidas = [p.medidas, ...(p.otrasMedidas ?? [])].map((m) => `${m.largo}x${m.ancho}x${m.alto}`).join(" ");
  return normalizarBusqueda(
    [p.nombre, ...p.categorias.map(nombreCategoria), medidas, p.material, p.acabado, ...p.usos].join(" "),
  );
}
