// Valida data/productos.ts sin compilar el proyecto. Se ejecuta antes de cada build (`prebuild`).
// Node 24 lee TypeScript directamente, por eso los ficheros de data/ no importan nada en tiempo
// de ejecución. Los productos con `publicado: false` solo se revisan en lo básico: no se publican.
//
// Lo que se comprueba además del formato: que todo precio publicado se apoye en un producto
// equivalente de data/fuentes-productos.ts y quede entre un 5 % y un 8 % por debajo de él.

import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cargar = (nombre) => import(pathToFileURL(path.join(raiz, "data", nombre)).href);

const { productos } = await cargar("productos.ts");
const { CATEGORIAS } = await cargar("categorias.ts");
const { fuentesProductos } = await cargar("fuentes-productos.ts");
const { fotos } = await cargar("fotos.ts");

const DESCUENTO_MIN = 5;
const DESCUENTO_MAX = 8;
const DISPONIBILIDADES = new Set(["en-stock", "bajo-pedido", "consultar", "no-disponible"]);

const categorias = new Set(CATEGORIAS.map((c) => c.id));
const errores = [];
const avisos = [];
const vistos = new Set();

const medidasValidas = (m) => ["largo", "ancho", "alto"].every((lado) => m?.[lado] > 0);

for (const p of productos) {
  const id = p.slug ?? "(sin slug)";
  const falla = (msg) => errores.push(`${id}: ${msg}`);
  const avisa = (msg) => avisos.push(`${id}: ${msg}`);

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug ?? "")) falla("slug inválido (minúsculas, números y guiones)");
  if (vistos.has(p.slug)) falla("slug duplicado");
  vistos.add(p.slug);

  if (!p.publicado) continue;

  if (!p.nombre?.trim()) falla("falta el nombre");
  if (!p.resumen?.trim()) falla("falta el resumen");
  if (!p.categorias?.length) falla("necesita al menos una categoría");
  for (const c of p.categorias ?? []) if (!categorias.has(c)) falla(`categoría desconocida «${c}»`);
  if (!medidasValidas(p.medidas)) falla("las medidas deben tener largo, ancho y alto en cm, mayores que 0");
  for (const m of p.otrasMedidas ?? []) if (!medidasValidas(m)) falla("hay una medida adicional incompleta");
  if (!p.caracteristicas?.length) falla("faltan características");
  if (!p.usos?.length) falla("faltan usos");
  if (!DISPONIBILIDADES.has(p.disponibilidad)) falla(`disponibilidad desconocida «${p.disponibilidad}»`);

  for (const img of p.imagenes ?? []) {
    if (!existsSync(path.join(raiz, "public", img))) falla(`no existe la imagen public${img}`);
  }
  if (p.fotoReferencial && !fotos[p.fotoReferencial]) falla(`fotoReferencial «${p.fotoReferencial}» no está en data/fotos.ts`);
  if (!p.imagenes?.length) avisa("sin foto propia: se muestra " + (p.fotoReferencial ? "foto referencial rotulada" : "el marcador «Foto pendiente»"));

  const fuentes = fuentesProductos[p.slug];
  if (!fuentes?.medidas?.length) falla("las medidas no tienen fuente en data/fuentes-productos.ts");
  else if (fuentes.medidas.length < 2) avisa("las medidas salen de una sola fuente");

  if (p.precio?.tipo === "referencial") {
    const ref = fuentes?.referenciaMercado;
    if (!(p.precio.soles > 0)) falla("precio referencial sin importe en soles");
    if (!ref) falla("precio referencial sin producto equivalente en data/fuentes-productos.ts");
    else {
      const descuento = (1 - p.precio.soles / ref.soles) * 100;
      if (descuento < DESCUENTO_MIN || descuento > DESCUENTO_MAX) {
        falla(`el precio S/ ${p.precio.soles} queda ${descuento.toFixed(2)} % bajo la referencia (S/ ${ref.soles}); debe estar entre ${DESCUENTO_MIN} % y ${DESCUENTO_MAX} %`);
      }
    }
  } else if (p.precio?.tipo === "consultar") {
    if (!p.precio.etiqueta) falla("precio «consultar» sin etiqueta");
  } else {
    falla("precio sin tipo («referencial» o «consultar»)");
  }

  if (p.confirmacionEmpresa !== "confirmado") avisa("PLASTINORTE aún no confirma este modelo");
}

for (const slug of Object.keys(fuentesProductos)) {
  if (!vistos.has(slug)) errores.push(`${slug}: tiene fuentes pero no existe en data/productos.ts`);
}

const publicados = productos.filter((p) => p.publicado);
if (errores.length) {
  console.error(`Catálogo inválido (${errores.length}):\n - ${errores.join("\n - ")}`);
  process.exit(1);
}
const conPrecio = publicados.filter((p) => p.precio.tipo === "referencial").length;
const sinConfirmar = publicados.filter((p) => p.confirmacionEmpresa !== "confirmado").length;
console.log(
  `Catálogo válido: ${productos.length} producto(s), ${publicados.length} publicado(s), ${conPrecio} con precio referencial, ${sinConfirmar} pendiente(s) de confirmación de la empresa.`,
);
if (process.argv.includes("--avisos") && avisos.length) console.log(`Avisos:\n - ${avisos.join("\n - ")}`);
