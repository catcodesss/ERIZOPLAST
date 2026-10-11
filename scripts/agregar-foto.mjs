// Incorpora una fotografía propia al sitio: la convierte a JPG optimizado, mide sus dimensiones, genera el
// placeholder borroso y la registra en data/fotos.ts. Usa `sharp`, que ya trae Next.js (no añade dependencias).
//
//   Sustituir una foto de banco de la portada (queda sin rótulo «Imagen referencial» ni crédito):
//     node scripts/agregar-foto.mjs sustituir <id> <archivo> --alt "Descripción de lo que muestra la foto"
//
//   Añadir una foto nueva propia:
//     node scripts/agregar-foto.mjs nueva <id> <archivo> --alt "Descripción de lo que muestra la foto"
//
//   Foto de un producto del catálogo (se guarda en public/productos/<slug>/NN.webp y te dice qué línea poner):
//     node scripts/agregar-foto.mjs producto <slug> <archivo>
//
//   Ver los ids de foto disponibles:
//     node scripts/agregar-foto.mjs ids
//
// El texto alternativo (--alt) es obligatorio al sustituir: el anterior describía la foto de banco, no la tuya.
// Después ejecuta `npm run build` para comprobar que todo compila.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rutaFotos = path.join(raiz, "data", "fotos.ts");
const [, , modo, a, b, ...resto] = process.argv;

const falla = (mensaje) => {
  console.error(`\n✘ ${mensaje}\n`);
  process.exit(1);
};
const opcion = (nombre) => {
  const i = resto.indexOf(`--${nombre}`);
  return i >= 0 ? resto[i + 1] : undefined;
};

async function cargarFotos() {
  // Se importa con una marca de tiempo para no leer una copia en caché del módulo.
  return (await import(`${pathToFileURL(rutaFotos).href}?t=${Date.now()}`)).fotos;
}

async function guardarFotos(fotos) {
  const actual = readFileSync(rutaFotos, "utf8");
  const inicio = actual.indexOf("export const fotos =");
  if (inicio < 0) falla("No se encontró «export const fotos =» en data/fotos.ts.");
  const cuerpo = JSON.stringify(fotos, null, 2).replace(/\n/g, "\n");
  writeFileSync(rutaFotos, `${actual.slice(0, inicio)}export const fotos = ${cuerpo} satisfies Record<string, Foto>;\n\nexport type IdFoto = keyof typeof fotos;\n`, "utf8");
}

async function procesar(archivo, destino, { ancho = 2560, calidad = 82, formato = "jpeg" } = {}) {
  if (!existsSync(archivo)) falla(`No existe el archivo: ${archivo}`);
  mkdirSync(path.dirname(destino), { recursive: true });
  const base = sharp(archivo).rotate(); // respeta la orientación del móvil
  const meta = await base.metadata();
  if (!meta.width || meta.width < 1200) console.warn(`  ⚠ La foto mide ${meta.width ?? "?"} px de ancho; para la portada conviene 2400 px o más.`);
  const redimensionada = base.resize({ width: ancho, withoutEnlargement: true });
  const salida = formato === "webp" ? redimensionada.webp({ quality: calidad }) : redimensionada.jpeg({ quality: calidad, mozjpeg: true });
  const info = await salida.toFile(destino);
  const diminuta = await sharp(destino).resize(24).jpeg({ quality: 40 }).toBuffer();
  return { ancho: info.width, alto: info.height, bytes: info.size, blur: `data:image/jpeg;base64,${diminuta.toString("base64")}` };
}

if (modo === "ids") {
  const fotos = await cargarFotos();
  for (const [id, f] of Object.entries(fotos)) console.log(`${id.padEnd(30)} ${f.licencia.padEnd(9)} ${f.alt}`);
  process.exit(0);
}

if (modo === "producto") {
  const slug = a;
  const archivo = b;
  if (!slug || !/^[a-z0-9-]+$/.test(slug) || !archivo) falla("Uso: node scripts/agregar-foto.mjs producto <slug> <archivo>");
  const carpeta = path.join(raiz, "public", "productos", slug);
  const n = existsSync(carpeta) ? readdirSync(carpeta).filter((x) => /^\d+\.webp$/.test(x)).length + 1 : 1;
  const nombre = `${String(n).padStart(2, "0")}.webp`;
  const r = await procesar(path.resolve(archivo), path.join(carpeta, nombre), { ancho: 1600, calidad: 80, formato: "webp" });
  console.log(`\n✔ Guardada: public/productos/${slug}/${nombre} (${r.ancho}×${r.alto}, ${Math.round(r.bytes / 1024)} KB)`);
  console.log(`\nSiguiente paso, en data/productos.ts, en el producto «${slug}»:`);
  console.log(`  imagenes: [..., "/productos/${slug}/${nombre}"],   (si es la primera, la lista queda así)`);
  console.log(`  y borra su línea «fotoReferencial: ...» si la tiene. Después: npm run validar`);
  process.exit(0);
}

if (modo === "sustituir" || modo === "nueva") {
  const id = a;
  const archivo = b;
  const alt = opcion("alt");
  if (!id || !/^[a-z0-9-]+$/.test(id) || !archivo) falla(`Uso: node scripts/agregar-foto.mjs ${modo} <id> <archivo> --alt "descripción"`);
  if (!alt || alt.trim().length < 12) falla("Falta --alt con una descripción de la foto (mínimo 12 caracteres), p. ej. --alt \"Planta de PLASTINORTE con jabas apiladas\".");
  const fotos = await cargarFotos();
  if (modo === "sustituir" && !fotos[id]) falla(`No existe la foto «${id}». Ids disponibles: node scripts/agregar-foto.mjs ids`);
  if (modo === "nueva" && fotos[id]) falla(`Ya existe «${id}». Para cambiarla usa «sustituir».`);

  // Nombre de archivo nuevo en cada sustitución: Next guarda las fotos optimizadas hasta 31 días y un nombre igual
  // enseñaría la anterior hasta que caduque.
  const sello = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const nombre = `${id}-propia-${sello}.jpg`;
  const r = await procesar(path.resolve(archivo), path.join(raiz, "public", "fotos", nombre));
  const anterior = fotos[id]?.src;
  fotos[id] = { src: `/fotos/${nombre}`, ancho: r.ancho, alto: r.alto, alt: alt.trim(), blur: r.blur, autor: "PLASTINORTE", licencia: "Propia", licenciaUrl: "", fuenteUrl: "" };
  await guardarFotos(fotos);
  console.log(`\n✔ ${modo === "sustituir" ? "Sustituida" : "Añadida"} «${id}»: public/fotos/${nombre} (${r.ancho}×${r.alto}, ${Math.round(r.bytes / 1024)} KB)`);
  console.log("  · Es propia: ya no lleva el rótulo «Imagen referencial» ni aparece en /creditos.");
  if (anterior && anterior !== `/fotos/${nombre}`) console.log(`  · El archivo anterior (public${anterior}) ya no se usa; puedes borrarlo.`);
  console.log("  · Revisa en el navegador que el encuadre sea bueno (el sitio recorta cada foto según la sección).");
  console.log("  · Si el encuadre no te gusta, cambia «posicion» donde se usa la foto (p. ej. posicion=\"50% 30%\").");
  process.exit(0);
}

falla(`Modo desconocido. Usa: sustituir | nueva | producto | ids (ver la cabecera de scripts/agregar-foto.mjs)`);
