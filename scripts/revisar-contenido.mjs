// Revisión comercial automática del sitio compilado. Comprueba lo que la empresa pidió no hacer nunca:
//   · presentar una foto de banco como propia (cada foto de banco lleva su rótulo «Imagen referencial»);
//   · inventar precios, certificaciones, trayectoria, clientes, garantías o plazos de entrega;
//   · publicar un modelo sin avisar que sus datos son referenciales mientras la empresa no lo confirme;
// y que cada página comercial oriente a pedir una cotización.
//
// Si la empresa algún día PUEDE afirmar una de esas cosas (p. ej. una certificación real), se añade con su
// documento a la lista PERMITIDO de más abajo y se anota por qué. Hoy no hay ninguna.
//
// Uso:  npm run build && npm run revisar

import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUERTO = 4013;
const BASE = `http://localhost:${PUERTO}`;

const { productos } = await import(pathToFileURL(path.join(raiz, "data", "productos.ts")).href);
const publicados = productos.filter((p) => p.publicado);
const hayPreciosPublicados = publicados.some((p) => p.precio.tipo === "referencial");
const hayPendientes = publicados.some((p) => p.confirmacionEmpresa !== "confirmado");

let fallos = 0;
async function prueba(nombre, fn) {
  try {
    await fn();
    console.log(`  ✔ ${nombre}`);
  } catch (error) {
    fallos++;
    console.log(`  ✘ ${nombre}\n      ${error?.message ?? error}`);
  }
}
const afirmar = (c, m) => {
  if (!c) throw new Error(m);
};

if (!existsSync(path.join(raiz, ".next", "BUILD_ID"))) {
  console.error("No hay compilación de producción. Ejecuta primero: npm run build");
  process.exit(1);
}

const nextBin = path.join(raiz, "node_modules", "next", "dist", "bin", "next");
const hijo = spawn(process.execPath, [nextBin, "start", "-p", String(PUERTO)], { cwd: raiz, env: { ...process.env, NODE_ENV: "production" }, stdio: "ignore", windowsHide: true });
const detener = () => {
  if (!hijo.pid) return;
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(hijo.pid), "/T", "/F"], { stdio: "ignore" });
  else hijo.kill("SIGTERM");
};
process.on("exit", detener);
for (let i = 0; i < 90; i++) {
  try {
    if ((await fetch(`${BASE}/robots.txt`)).ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 500));
}

// Páginas comerciales: todo menos las legales (/privacidad y /creditos hablan de «garantías» de proveedores, etc.).
const rutas = ["/", "/catalogo", "/contacto", ...["caladas-multiuso", "cerradas", "agricolas", "alimentos", "panaderas", "industriales"].map((c) => `/catalogo/categoria/${c}`), ...publicados.map((p) => `/catalogo/${p.slug}`)];
const html = new Map();
for (const r of rutas) html.set(r, await (await fetch(BASE + r)).text());
// Texto visible: sin scripts, estilos ni etiquetas (los datos RSC y los JSON-LD no son lo que lee una persona).
const visible = (h) => h.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ");

console.log("\n1. Imágenes: ninguna foto de banco se presenta como propia");
await prueba("cada foto de banco tiene su rótulo «Imagen referencial» (en todas las páginas comerciales)", () => {
  const malas = [];
  for (const [ruta, h] of html) {
    const fotos = [...h.matchAll(/<img[^>]*src="[^"]*url=%2Ffotos%2F(?!.*-propia-)[^"]*"/g)].length;
    const rotulos = [...h.matchAll(/>Imagen referencial</g)].length;
    if (fotos > rotulos) malas.push(`${ruta}: ${fotos} fotos de banco y ${rotulos} rótulos`);
  }
  afirmar(malas.length === 0, malas.join(" | "));
});
await prueba("no hay una sola foto de banco sin rotular en el HTML de la portada (hero, mosaico, nosotros, fabricación y cierre)", () => {
  const h = html.get("/");
  const fotos = [...h.matchAll(/<img[^>]*src="[^"]*url=%2Ffotos%2F[^"]*"/g)].length;
  afirmar(fotos >= 7, `solo se encontraron ${fotos} fotos en la portada: ¿cambió su estructura?`);
});
await prueba("el mosaico de líneas lleva el pie «Fotografías referenciales» (las afirmaciones de fabricación y flota las declara la empresa; no se pegan a una foto de banco sin aclararlo)", () => {
  const h = visible(html.get("/"));
  afirmar(/Fotografías referenciales/.test(h), "falta el pie «Fotografías referenciales» del mosaico de líneas");
});

console.log("\n2. Contenido: nada inventado");
const PROHIBIDO = [
  [/\bISO\s?\d{3,5}\b|\bHACCP\b|\bSENASA\b|\bDIGESA\b|\bcertificad[oa]s?\b|\bcertificaci[oó]n(es)?\b|\bacreditad[oa]\b/i, "certificaciones"],
  [/\b(m[aá]s de|\+)\s?\d+\s+a[nñ]os\b|\ba[nñ]os de experiencia\b|\bdesde (19|20)\d\d\b|\bfundad[oa] en\b|\bcon m[aá]s de\b/i, "trayectoria"],
  [/\bclientes satisfechos\b|\b\+?\s?\d{2,}\s+clientes\b|\bl[ií]deres?\b|\bn[uú]mero (1|uno)\b|\bel mejor\b|\bla mejor\b/i, "clientes o superlativos"],
  [/\bgarant[ií]a\b|\bgarantizamos\b/i, "garantías"],
  [/\ben \d+\s?(horas|h)\b|\b\d+\s?d[ií]as h[aá]biles\b|\bentrega (inmediata|en 24|en 48)\b|\bmismo d[ií]a\b/i, "plazos de entrega"],
  [/\bgratis\b|\bdescuento\b|\bofertas?\b|\bpromoci[oó]n\b|\b2x1\b/i, "promociones"],
];
await prueba("ninguna página comercial afirma certificaciones, trayectoria, clientes, garantías, plazos ni promociones", () => {
  const hallazgos = [];
  for (const [ruta, h] of html) {
    const t = visible(h);
    for (const [patron, tema] of PROHIBIDO) {
      const m = t.match(patron);
      if (m) hallazgos.push(`${ruta}: ${tema} → «${m[0]}»`);
    }
  }
  afirmar(hallazgos.length === 0, hallazgos.join(" | "));
});
await prueba(hayPreciosPublicados ? "los precios publicados dicen «referencial» y «sujeto a confirmación»" : "no hay precios publicados: ninguna página muestra importes en soles (S/ 12,50…)", () => {
  for (const [ruta, h] of html) {
    const t = visible(h);
    if (!hayPreciosPublicados) afirmar(!/S\/\s?\d/.test(t), `${ruta} muestra un importe en soles y no hay precios publicados`);
    else if (/S\/\s?\d/.test(t)) afirmar(/referencial/i.test(t) && /sujet[oa]s? a confirmaci[oó]n/i.test(t), `${ruta}: precio sin «referencial / sujeto a confirmación»`);
  }
});
await prueba("la disponibilidad no promete stock: nadie dice «en stock» mientras no esté confirmado", () => {
  const conStock = publicados.filter((p) => p.disponibilidad === "en-stock");
  for (const [ruta, h] of html) if (!conStock.length) afirmar(!/en stock|stock disponible|disponible de inmediato/i.test(visible(h)), `${ruta} habla de stock`);
});
await prueba("no se publica ningún dato de la competencia (precios, marcas ni fuentes internas)", () => {
  for (const [ruta, h] of html) afirmar(!/fuentes-productos|FUENTES-FASE-4|competencia/i.test(h), `${ruta} filtra información interna`);
});

console.log("\n3. Modelos referenciales: se avisa mientras la empresa no confirme");
await prueba(hayPendientes ? "el catálogo y cada ficha avisan «modelo/catálogo referencial» mientras haya modelos sin confirmar" : "todos los modelos están confirmados", () => {
  if (!hayPendientes) return;
  afirmar(/Catálogo referencial\./.test(visible(html.get("/catalogo"))), "/catalogo sin aviso de catálogo referencial");
  for (const p of publicados.filter((x) => x.confirmacionEmpresa !== "confirmado")) afirmar(/Modelo referencial\./.test(visible(html.get(`/catalogo/${p.slug}`))), `/catalogo/${p.slug} sin aviso de modelo referencial`);
});
await prueba("un modelo sin foto propia ni de banco se muestra como esquema, no como foto (y así se dice)", () => {
  for (const p of publicados.filter((x) => !x.imagenes.length && !x.fotoReferencial)) {
    const t = visible(html.get(`/catalogo/${p.slug}`));
    afirmar(/Esquema (referencial|con las medidas)/.test(t), `/catalogo/${p.slug} no rotula su esquema`);
    afirmar(!/Foto pendiente/i.test(t), `/catalogo/${p.slug} muestra un marcador interno «Foto pendiente»`);
  }
});

console.log("\n4. Orientación a la cotización");
await prueba("la portada, el catálogo, las categorías, las fichas y /contacto llevan a cotizar por WhatsApp (botón visible, no solo el flotante)", () => {
  for (const [ruta, h] of html) {
    const botones = [...h.matchAll(/<a[^>]*href="\/api\/whatsapp[^"]*"[^>]*>([\s\S]*?)<\/a>/g)].filter((m) => /Cotizar|cotizaci[oó]n|asesor/i.test(m[1].replace(/<[^>]+>/g, " ")));
    afirmar(botones.length >= 1, `${ruta} no tiene un botón de cotización`);
  }
});
await prueba("cada ficha tiene un botón «Solicitar cotización» que ya lleva el modelo, y cada página enlaza al correo como alternativa", () => {
  for (const p of publicados) afirmar(html.get(`/catalogo/${p.slug}`).includes(`/api/whatsapp?producto=${p.slug}`), `la ficha de ${p.slug} no lleva el modelo en su botón`);
  for (const r of ["/", "/contacto"]) afirmar(/href="mailto:[^"]+"/.test(html.get(r)), `${r} sin enlace de correo`);
});

console.log("\n5. Fabricación y logística: claridad");
await prueba("la portada deja claro que fabrican, que venden directo, que tienen transporte y a dónde llegan", () => {
  const t = visible(html.get("/")).toLowerCase();
  for (const frase of ["fabricamos", "directamente de fábrica", "flota", "lima metropolitana", "todo el perú"]) afirmar(t.includes(frase), `falta «${frase}» en la portada`);
});

detener();
console.log(fallos ? `\n${fallos} comprobación(es) fallaron.` : "\nTodo en orden.");
process.exitCode = fallos ? 1 : 0;
