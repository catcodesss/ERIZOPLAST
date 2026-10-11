import type { IdCategoria } from "./categorias";
import type { IdFoto } from "./fotos";

/** Medidas exteriores en centímetros. */
export type Medidas = { largo: number; ancho: number; alto: number };

/**
 * Un precio solo se publica con `referencial`, y siempre sale rotulado como referencial y sujeto a
 * confirmación comercial. Cuando no hay un producto equivalente con precio publicado, es `consultar`.
 */
export type Precio =
  | { tipo: "referencial"; soles: number; unidad: "por unidad" }
  | { tipo: "consultar"; etiqueta: "Consultar precio" | "Cotizar por volumen" };

export type Disponibilidad = "en-stock" | "bajo-pedido" | "consultar" | "no-disponible";

export type Producto = {
  slug: string;
  nombre: string;
  /** La primera es la principal: la que se muestra en la tarjeta. */
  categorias: IdCategoria[];
  resumen: string;
  usos: string[];
  caracteristicas: string[];
  medidas: Medidas;
  /** Otras medidas de la misma línea (p. ej. una caja que existe en cuatro tamaños). */
  otrasMedidas?: Medidas[];
  capacidadLitros?: number;
  cargaKg?: number;
  material: "PEAD" | "PP";
  acabado: "calada" | "semicalada" | "cerrada";
  /** Vacío = «a consultar». Solo colores que PLASTINORTE confirme. */
  colores: string[];
  precio: Precio;
  disponibilidad: Disponibilidad;
  /** Fotos propias bajo /public, p. ej. "/productos/mi-jaba/01.webp". La primera es la principal. */
  imagenes: string[];
  /** Foto de banco mientras no haya foto propia; se rotula siempre como «Imagen referencial». */
  fotoReferencial?: IdFoto;
  /** `false` oculta el producto del sitio sin borrarlo del archivo. */
  publicado: boolean;
  /**
   * PLASTINORTE aún no ha confirmado que fabrica este modelo con estas medidas. Pasa a "confirmado" solo
   * cuando la empresa lo diga; mientras tanto, el sitio avisa que las medidas se confirman al cotizar.
   */
  confirmacionEmpresa: "pendiente" | "confirmado";
};
