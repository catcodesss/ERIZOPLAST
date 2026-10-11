// Pruebas funcionales del flujo de contacto y cotización. No usan servicios externos: levantan el sitio
// ya compilado (`npm run build` antes) en dos puertos —con el número y sin él— y lo recorren como lo haría
// un visitante o un rastreador. Salida: ✔ / ✘ por comprobación; código de salida 1 si algo falla.
//
// El número real se lee de .env.local solo para saber qué buscar. Nunca se imprime: toda salida pasa por
// `ocultar`, que lo sustituye por <NUMERO>.
//
// Uso:  npm run build && npm run probar

import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUERTO_CON = 4010;
const PUERTO_SIN = 4011;
const CORREO = "dylan_cal@outlook.com";

// ---------- Número (solo para buscarlo) ----------
const envLocal = existsSync(path.join(raiz, ".env.local")) ? readFileSync(path.join(raiz, ".env.local"), "utf8") : "";
const numero = /^ERIZOPLAST_WHATSAPP_NUMBER=(\d{8,15})\s*$/m.exec(envLocal)?.[1];
if (!numero) {
  console.error("Falta ERIZOPLAST_WHATSAPP_NUMBER en .env.local: no hay número que comprobar. Copia .env.example a .env.local.");
  process.exit(1);
}
if (!existsSync(path.join(raiz, ".next", "BUILD_ID"))) {
  console.error("No hay una compilación de producción. Ejecuta primero: npm run build");
  process.exit(1);
}
const nacional = numero.length > 9 ? numero.slice(-9) : numero;
const grupos = [nacional.slice(0, 3), nacional.slice(3, 6), nacional.slice(6)];
const patronNumero = new RegExp(`${numero}|${grupos[0]}[\\s.\\-]{0,3}${grupos[1]}[\\s.\\-]{0,3}${grupos[2]}`);
const ocultar = (texto) => String(texto).replaceAll(numero, "<NUMERO>").replaceAll(nacional, "<NUMERO>");

// ---------- Mini arnés ----------
const resultados = [];
async function prueba(nombre, fn) {
  try {
    await fn();
    resultados.push({ nombre, ok: true });
    console.log(`  ✔ ${nombre}`);
  } catch (error) {
    resultados.push({ nombre, ok: false });
    console.log(`  ✘ ${nombre}\n      ${ocultar(error?.message ?? error)}`);
  }
}
function afirmar(condicion, mensaje) {
  if (!condicion) throw new Error(mensaje);
}
function igual(real, esperado, mensaje) {
  if (real !== esperado) throw new Error(`${mensaje}\n      esperado: ${JSON.stringify(esperado)}\n      recibido: ${JSON.stringify(real)}`);
}
const grupo = (titulo) => console.log(`\n${titulo}`);

// ---------- Catálogo ----------
const { productos } = await import(pathToFileURL(path.join(raiz, "data", "productos.ts")).href);
const publicados = productos.filter((p) => p.publicado);

/** Frase esperada, escrita aquí a propósito de forma independiente a lib/whatsapp.ts. */
function mensajeEsperado(producto) {
  const nombre = producto.nombre;
  const sintagma = /^(jaba|caja)\b/i.test(nombre) ? `la ${nombre[0].toLowerCase()}${nombre.slice(1)}` : `el producto ${nombre}`;
  return `Hola, estoy interesado en cotizar ${sintagma}. Quisiera conocer los precios por volumen y las opciones de entrega.`;
}
const MENSAJE_GENERAL =
  "Hola, estoy interesado en cotizar jabas plásticas. Quisiera conocer los precios por volumen y las opciones de entrega.";

// ---------- Servidores ----------
const hijos = [];
function levantar(puerto, numeroDelEntorno) {
  const nextBin = path.join(raiz, "node_modules", "next", "dist", "bin", "next");
  const hijo = spawn(process.execPath, [nextBin, "start", "-p", String(puerto)], {
    cwd: raiz,
    env: { ...process.env, NODE_ENV: "production", ERIZOPLAST_WHATSAPP_NUMBER: numeroDelEntorno },
    stdio: "ignore",
    windowsHide: true,
  });
  hijos.push(hijo);
  return hijo;
}
function detenerTodo() {
  for (const hijo of hijos) {
    if (!hijo.pid) continue;
    if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(hijo.pid), "/T", "/F"], { stdio: "ignore" });
    else hijo.kill("SIGTERM");
  }
}
process.on("exit", detenerTodo);
process.on("SIGINT", () => process.exit(130));

async function esperar(base) {
  for (let i = 0; i < 90; i++) {
    try {
      if ((await fetch(`${base}/robots.txt`)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`El servidor de ${base} no arrancó en 45 s`);
}

// ---------- Utilidades de red ----------
const obtener = (base, ruta, opciones = {}) => fetch(base + ruta, { redirect: "manual", ...opciones });
function decodificarEntidades(texto) {
  return texto.replaceAll("&amp;", "&").replaceAll("&#x27;", "'").replaceAll("&quot;", '"');
}
function enlacesDe(html) {
  return [...html.matchAll(/<a\b[^>]*?\shref="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => ({
    href: decodificarEntidades(m[1]),
    contenido: m[2],
    etiqueta: m[0],
  }));
}
function textoDelMensaje(location) {
  const url = new URL(location);
  return { url, texto: url.searchParams.get("text") ?? "" };
}
function recorrer(directorio, ignorar, acumulado = []) {
  for (const nombre of readdirSync(directorio)) {
    const completa = path.join(directorio, nombre);
    if (ignorar(completa, nombre)) continue;
    if (statSync(completa).isDirectory()) recorrer(completa, ignorar, acumulado);
    else acumulado.push(completa);
  }
  return acumulado;
}
/** Quita comentarios: importa el código, no que un comentario explique la regla nombrando a wa.me o a la variable. */
const sinComentarios = (codigo) => codigo.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const EXTENSIONES_TEXTO = /\.(tsx?|mjs|cjs|js|json|md|css|svg|html|txt|ya?ml|rsc|example|bat|ps1|map)$/i;

// =====================================================================
grupo("1. Código y archivos: el número no está en ningún sitio público");

await prueba("el número real solo existe en .env.local (ni en código, ni en docs, ni en .env.example)", () => {
  const archivos = recorrer(raiz, (_, n) => ["node_modules", ".next", ".git", ".env.local", "tsconfig.tsbuildinfo"].includes(n));
  const dondeAparece = archivos
    .filter((f) => EXTENSIONES_TEXTO.test(f) || path.basename(f).startsWith(".env"))
    .filter((f) => patronNumero.test(readFileSync(f, "utf8")))
    .map((f) => path.relative(raiz, f));
  afirmar(dondeAparece.length === 0, `aparece en: ${dondeAparece.join(", ")}`);
});

await prueba("ningún componente, página ni dato menciona wa.me, api.whatsapp.com ni whatsapp://", () => {
  const archivos = recorrer(raiz, (c, n) => ["node_modules", ".next", ".git"].includes(n) || c.endsWith("lib" + path.sep + "whatsapp.ts"))
    .filter((f) => /[\\/](app|components|data)[\\/]/.test(f) && /\.(tsx?|css)$/.test(f));
  const culpables = archivos
    .filter((f) => /https?:\/\/(wa\.me|api\.whatsapp\.com)|whatsapp:\/\//i.test(sinComentarios(readFileSync(f, "utf8"))))
    .map((f) => path.relative(raiz, f));
  afirmar(culpables.length === 0, `enlaces directos en: ${culpables.join(", ")}`);
});

await prueba("lib/whatsapp.ts es solo de servidor y es el único que lee el número", () => {
  const modulo = readFileSync(path.join(raiz, "lib", "whatsapp.ts"), "utf8");
  afirmar(/^import "server-only";/m.test(modulo), "falta `import \"server-only\"`");
  const lectores = recorrer(raiz, (_, n) => ["node_modules", ".next", ".git", "scripts"].includes(n))
    .filter((f) => /\.(tsx?|mjs)$/.test(f))
    .filter((f) => sinComentarios(readFileSync(f, "utf8")).includes("ERIZOPLAST_WHATSAPP_NUMBER"))
    .map((f) => path.relative(raiz, f).replaceAll("\\", "/"));
  const permitidos = new Set(["lib/whatsapp.ts", "app/api/whatsapp/route.ts"]);
  const intrusos = lectores.filter((f) => !permitidos.has(f));
  afirmar(intrusos.length === 0, `otro archivo nombra la variable: ${intrusos.join(", ")}`);
});

await prueba("no existe ninguna variable NEXT_PUBLIC_ relacionada con WhatsApp", () => {
  const archivos = recorrer(raiz, (_, n) => ["node_modules", ".next", ".git", "scripts"].includes(n))
    .filter((f) => /\.(tsx?|mjs|md)$|\.env/.test(f));
  const culpables = archivos.filter((f) => /NEXT_PUBLIC_\w*(WHATSAPP|WA_|TELEFONO|CELULAR)/i.test(readFileSync(f, "utf8")));
  afirmar(culpables.length === 0, `en: ${culpables.map((f) => path.relative(raiz, f)).join(", ")}`);
});

await prueba(".gitignore protege .env.local y deja versionar .env.example", () => {
  const lineas = readFileSync(path.join(raiz, ".gitignore"), "utf8").split(/\r?\n/).map((l) => l.trim());
  const ignora = lineas.includes(".env*") || lineas.includes(".env.local");
  afirmar(ignora, ".env.local no está ignorado");
  afirmar(lineas.includes("!.env.example"), "falta la excepción !.env.example");
  afirmar(lineas.lastIndexOf("!.env.example") > lineas.lastIndexOf(".env*"), "la excepción va antes de la regla general y no surte efecto");
});

await prueba(".env.example declara la variable con un valor ficticio, no el real", () => {
  const ejemplo = readFileSync(path.join(raiz, ".env.example"), "utf8");
  const valor = /^ERIZOPLAST_WHATSAPP_NUMBER=(\d*)\s*$/m.exec(ejemplo);
  afirmar(valor, "falta ERIZOPLAST_WHATSAPP_NUMBER=");
  afirmar(valor[1] !== numero, "contiene el número real");
});

await prueba("ningún botón del código es decorativo (todo <Boton> tiene href, onClick o type)", () => {
  const archivos = recorrer(raiz, (_, n) => ["node_modules", ".next", ".git", "sistema-diseno"].includes(n)).filter((f) => /\.tsx$/.test(f));
  const huerfanos = [];
  for (const archivo of archivos) {
    for (const m of readFileSync(archivo, "utf8").matchAll(/<(Boton|BotonCotizar|button)\b([\s\S]*?)>/g)) {
      if (m[1] === "BotonCotizar") continue; // siempre lleva href
      if (!/\b(href|onClick|type)=/.test(m[2])) huerfanos.push(path.relative(raiz, archivo));
    }
  }
  afirmar(huerfanos.length === 0, `sin acción en: ${huerfanos.join(", ")}`);
});

// =====================================================================
grupo(`2. Sitio con número configurado (puerto ${PUERTO_CON})`);
levantar(PUERTO_CON, numero);
const BASE = `http://localhost:${PUERTO_CON}`;
await esperar(BASE);

const paginas = [
  "/",
  "/catalogo",
  "/contacto",
  "/privacidad",
  "/creditos",
  ...publicados.map((p) => `/catalogo/${p.slug}`),
];
const htmlDe = new Map();

await prueba(`las ${paginas.length} páginas públicas responden 200`, async () => {
  for (const ruta of paginas) {
    const r = await obtener(BASE, ruta);
    igual(r.status, 200, `${ruta} respondió ${r.status}`);
    htmlDe.set(ruta, await r.text());
  }
});

await prueba("el número no aparece en el HTML de ninguna página (ni como texto, ni en enlaces, ni en datos incrustados)", () => {
  for (const [ruta, html] of htmlDe) {
    afirmar(!patronNumero.test(html), `${ruta} contiene el número`);
    afirmar(!/wa\.me|api\.whatsapp\.com|whatsapp:\/\//i.test(html), `${ruta} enlaza directo a WhatsApp`);
  }
});

await prueba("el número no está en los archivos que descarga el navegador (JS, CSS, public/) ni en lo prerenderizado", () => {
  const sitios = [path.join(raiz, ".next", "static"), path.join(raiz, "public"), path.join(raiz, ".next", "server", "app")].filter(existsSync);
  const archivos = sitios.flatMap((s) => recorrer(s, () => false)).filter((f) => EXTENSIONES_TEXTO.test(f));
  const culpables = archivos.filter((f) => patronNumero.test(readFileSync(f, "utf8"))).map((f) => path.relative(raiz, f));
  afirmar(archivos.length > 20, `solo se revisaron ${archivos.length} archivos: ¿falta la compilación?`);
  afirmar(culpables.length === 0, `aparece en: ${culpables.join(", ")}`);
});

await prueba("ningún enlace está vacío ni es «#» o javascript:, y todos tienen texto o nombre accesible", () => {
  for (const [ruta, html] of htmlDe) {
    for (const { href, contenido, etiqueta } of enlacesDe(html)) {
      afirmar(href.trim() !== "" && href !== "#" && !/^javascript:/i.test(href), `${ruta}: enlace sin destino (${etiqueta.slice(0, 80)})`);
      const nombre = contenido.replace(/<[^>]*>/g, "").trim() || /aria-label="[^"]+"/.test(etiqueta);
      afirmar(nombre, `${ruta}: enlace sin nombre accesible hacia ${href}`);
    }
  }
});

await prueba("todos los enlaces internos llevan a una página que existe (y los anclajes, a un id real)", async () => {
  const destinos = new Set();
  for (const html of htmlDe.values()) {
    for (const { href } of enlacesDe(html)) {
      if (href.startsWith("/") && !href.startsWith("/api/")) destinos.add(href.split("#")[0] || "/");
    }
  }
  for (const destino of destinos) {
    const r = await obtener(BASE, destino);
    afirmar(r.status === 200, `${destino} respondió ${r.status}`);
  }
  for (const html of htmlDe.values()) {
    for (const { href } of enlacesDe(html)) {
      const ancla = href.startsWith("/") && href.includes("#") ? href.split("#") : null;
      if (!ancla) continue;
      const pagina = htmlDe.get(ancla[0] || "/");
      afirmar(pagina === undefined || pagina.includes(`id="${ancla[1]}"`), `el anclaje ${href} no apunta a ningún id`);
    }
  }
});

await prueba("sitemap: todas sus URLs responden 200 y robots.txt oculta /api/", async () => {
  const robots = await (await obtener(BASE, "/robots.txt")).text();
  afirmar(/Disallow:\s*\/api\//.test(robots), "robots.txt no deshabilita /api/");
  const xml = await (await obtener(BASE, "/sitemap.xml")).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  afirmar(urls.length >= 3, "el sitemap está vacío");
  for (const ruta of urls) igual((await obtener(BASE, ruta)).status, 200, `sitemap lista ${ruta}`);
});

grupo("3. Contacto comercial visible");

await prueba(`el correo ${CORREO} aparece en la portada, el pie y /contacto, siempre como enlace mailto`, () => {
  for (const ruta of ["/", "/catalogo", "/contacto"]) {
    const html = htmlDe.get(ruta);
    const mailtos = enlacesDe(html).filter((e) => e.href.startsWith("mailto:"));
    afirmar(mailtos.length >= 1, `${ruta} no tiene enlace mailto`);
    for (const m of mailtos) igual(m.href, `mailto:${CORREO}`, `${ruta}: mailto distinto`);
  }
  // Y no hay otros correos sueltos en el HTML visible.
  const correos = new Set([...htmlDe.get("/contacto").replace(/placeholder="[^"]*"/g, "").matchAll(/[\w.+-]+@[\w-]+\.[\w.]+/g)].map((m) => m[0]));
  afirmar([...correos].every((c) => c === CORREO), `correos inesperados: ${[...correos].join(", ")}`);
});

await prueba("se muestran la ubicación «Lima Norte, Lima, Perú» y la cobertura «todo el Perú»", () => {
  const texto = htmlDe.get("/contacto").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
  afirmar(texto.includes("Lima Norte, Lima, Perú"), "falta la ubicación en /contacto");
  afirmar(/todo el Perú/i.test(texto), "falta la cobertura en /contacto");
  const pie = htmlDe.get("/").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
  afirmar(pie.includes("Lima Norte, Lima, Perú") && /Cobertura: todo el Perú/.test(pie), "falta ubicación o cobertura en el pie");
});

await prueba("los botones de la interfaz usan los textos pedidos (Cotizar por WhatsApp / Solicitar cotización / Hablar con un asesor)", () => {
  const todo = [...htmlDe.values()].join(" ").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
  for (const texto of ["Cotizar por WhatsApp", "Solicitar cotización", "Hablar con un asesor"]) afirmar(todo.includes(texto), `falta «${texto}»`);
});

// ---------------------------------------------------------------------
grupo("4. Botones: hero, catálogo, fichas, contacto, flotante");

const destinoWhatsApp = (href) => href.startsWith("/api/whatsapp");

await prueba("el botón del hero (portada) lleva a /api/whatsapp", () => {
  const hero = htmlDe.get("/").split("<section")[1]; // primera sección = hero
  afirmar(enlacesDe(hero).some((e) => destinoWhatsApp(e.href) && /Cotizar por WhatsApp/.test(e.contenido)), "el hero no tiene su botón");
});

await prueba("el botón flotante existe en todas las páginas y apunta a /api/whatsapp", () => {
  for (const [ruta, html] of htmlDe) {
    const flotante = enlacesDe(html).find((e) => /fixed bottom-/.test(e.etiqueta));
    afirmar(flotante && destinoWhatsApp(flotante.href), `${ruta}: sin botón flotante`);
    afirmar(/target="_blank"/.test(flotante.etiqueta) && /rel="noopener noreferrer"/.test(flotante.etiqueta), `${ruta}: el flotante no abre en pestaña nueva con noopener`);
  }
});

await prueba("el botón flotante dentro de una ficha ya lleva el modelo de esa ficha", () => {
  for (const p of publicados) {
    const html = htmlDe.get(`/catalogo/${p.slug}`);
    const flotante = enlacesDe(html).find((e) => /fixed bottom-/.test(e.etiqueta));
    igual(flotante.href, `/api/whatsapp?producto=${p.slug}`, `ficha ${p.slug}`);
  }
});

// El catálogo se pinta en el cliente (filtros y búsqueda tras un Suspense), así que sus tarjetas no están
// en el HTML del servidor y este script no puede ver los botones. Aquí se comprueba lo que sí se puede:
// que los 7 productos viajan al catálogo y que la tarjeta cablea el botón con el slug de CADA producto.
// Los botones ya pintados se verifican en un navegador real (ver la sección «Cómo se probó» del informe).
await prueba(`el catálogo recibe los ${publicados.length} productos y su tarjeta cablea «Solicitar cotización» con el slug de cada uno`, () => {
  const html = htmlDe.get("/catalogo");
  for (const p of publicados) afirmar(html.includes(`\\"slug\\":\\"${p.slug}\\"`), `${p.slug} no llega al catálogo`);
  const tarjeta = readFileSync(path.join(raiz, "components", "catalogo", "TarjetaProducto.tsx"), "utf8");
  afirmar(/<BotonCotizar\s+producto=\{[^}]*producto\.slug[^}]*\}[^>]*>\s*Solicitar cotización\s*<\/BotonCotizar>/.test(tarjeta), "la tarjeta no pasa producto.slug al botón");
});

await prueba("cada ficha tiene su botón «Solicitar cotización» y el panel opcional (formulario POST, producto oculto)", () => {
  for (const p of publicados) {
    const html = htmlDe.get(`/catalogo/${p.slug}`);
    afirmar(
      enlacesDe(html).some((e) => e.href === `/api/whatsapp?producto=${p.slug}` && /Solicitar cotización/.test(e.contenido)),
      `${p.slug}: sin botón en la ficha`,
    );
    afirmar(/<form[^>]*method="post"[^>]*action="\/api\/whatsapp"|<form[^>]*action="\/api\/whatsapp"[^>]*method="post"/.test(html), `${p.slug}: sin formulario`);
    afirmar(new RegExp(`<input[^>]*name="producto"[^>]*value="${p.slug}"|<input[^>]*value="${p.slug}"[^>]*name="producto"`).test(html), `${p.slug}: el formulario no lleva el producto`);
    for (const campo of ["cantidad", "ciudad", "contacto"]) afirmar(html.includes(`name="${campo}"`), `${p.slug}: falta el campo ${campo}`);
  }
});

await prueba("ningún campo del panel es obligatorio (no hay required) y todos tienen etiqueta y límite", () => {
  const form = htmlDe.get(`/catalogo/${publicados[0].slug}`).match(/<form[^>]*action="\/api\/whatsapp"[\s\S]*?<\/form>/)[0];
  afirmar(!/\brequired\b/.test(form), "hay un campo obligatorio");
  for (const campo of ["cantidad", "ciudad", "contacto"]) {
    const input = form.match(new RegExp(`<input[^>]*name="${campo}"[^>]*>`))[0];
    afirmar(/maxLength="\d+"|maxlength="\d+"/i.test(input), `${campo} sin maxLength`);
    const id = /id="([^"]+)"/.exec(input)[1];
    afirmar(form.includes(`for="${id}"`), `${campo} sin <label>`);
  }
});

await prueba("/contacto y el cierre de la portada ofrecen el panel de cantidad y ciudad", () => {
  for (const ruta of ["/", "/contacto"]) afirmar(htmlDe.get(ruta).includes('action="/api/whatsapp"'), `${ruta} sin panel`);
  afirmar(/<details[^>]*\sopen=""/.test(htmlDe.get("/contacto")), "en /contacto el panel debería venir abierto");
});

await prueba("el botón de contacto de /contacto y el del pie llevan a /api/whatsapp", () => {
  for (const ruta of ["/contacto", "/"]) {
    afirmar(enlacesDe(htmlDe.get(ruta)).some((e) => destinoWhatsApp(e.href) && /Cotizar por WhatsApp/.test(e.contenido)), `${ruta}: sin botón de contacto`);
  }
});

// ---------------------------------------------------------------------
grupo("5. Redirección a WhatsApp: mensaje correcto por producto");

await prueba(`cada uno de los ${publicados.length} productos genera su mensaje exacto y redirige a wa.me`, async () => {
  for (const p of publicados) {
    const r = await obtener(BASE, `/api/whatsapp?producto=${p.slug}`);
    igual(r.status, 302, `${p.slug}: estado`);
    const { url, texto } = textoDelMensaje(r.headers.get("location"));
    igual(url.origin, "https://wa.me", `${p.slug}: destino`);
    igual(url.pathname, `/${numero}`, `${p.slug}: ruta de wa.me (no es el número configurado)`);
    const esperado = mensajeEsperado(p);
    afirmar(texto.startsWith(esperado), `${p.slug}: mensaje distinto\n      esperado: ${esperado}\n      recibido: ${texto}`);
    if (p.otrasMedidas?.length) afirmar(texto.includes("Tamaño que necesito"), `${p.slug}: no pide elegir tamaño`);
    else igual(texto, esperado, `${p.slug}: lleva texto de más`);
  }
});

await prueba("sin producto, la cotización es general", async () => {
  const r = await obtener(BASE, "/api/whatsapp");
  igual(r.status, 302, "estado");
  igual(textoDelMensaje(r.headers.get("location")).texto, MENSAJE_GENERAL, "mensaje general");
});

await prueba("un producto inexistente o con forma maliciosa cae en la cotización general y no se refleja en el texto", async () => {
  for (const valor of ["no-existe", "<script>alert(1)</script>", "../../etc/passwd", "a".repeat(500), "jaba%0d%0aX-Evil:1"]) {
    const r = await obtener(BASE, `/api/whatsapp?producto=${encodeURIComponent(valor)}`);
    igual(r.status, 302, `estado con «${valor.slice(0, 20)}»`);
    const { url, texto } = textoDelMensaje(r.headers.get("location"));
    igual(url.origin, "https://wa.me", "destino");
    igual(texto, MENSAJE_GENERAL, `mensaje con «${valor.slice(0, 20)}»`);
  }
});

await prueba("la redirección no se puede desviar: parámetros extra (host, url, text, phone) se ignoran", async () => {
  const r = await obtener(BASE, "/api/whatsapp?producto=x&text=hola&phone=1&url=https://malo.example&host=malo.example&cantidad=999");
  const { url, texto } = textoDelMensaje(r.headers.get("location"));
  igual(url.origin, "https://wa.me", "origen");
  igual(url.pathname, `/${numero}`, "ruta");
  igual(texto, MENSAJE_GENERAL, "texto");
});

await prueba("la respuesta no se guarda ni se indexa (no-store, noindex) y el cuerpo no trae el número", async () => {
  const r = await obtener(BASE, "/api/whatsapp?producto=" + publicados[0].slug);
  afirmar(/no-store/.test(r.headers.get("cache-control") ?? ""), "falta Cache-Control: no-store");
  afirmar(/noindex/.test(r.headers.get("x-robots-tag") ?? ""), "falta X-Robots-Tag: noindex");
  afirmar(!patronNumero.test(await r.text()), "el cuerpo de la redirección contiene el número");
});

await prueba("métodos no previstos (PUT, DELETE) devuelven 405", async () => {
  for (const metodo of ["PUT", "DELETE"]) igual((await obtener(BASE, "/api/whatsapp", { method: metodo })).status, 405, metodo);
});

// ---------------------------------------------------------------------
grupo("6. Datos opcionales: cantidad, ciudad, nombre o empresa");

const enviarFormulario = (campos, tipo = "urlencoded") => {
  const cuerpo = tipo === "multipart" ? new FormData() : new URLSearchParams();
  for (const [k, v] of Object.entries(campos)) cuerpo.append(k, v);
  return obtener(BASE, "/api/whatsapp", { method: "POST", body: cuerpo });
};
const producto0 = publicados[0];

await prueba("con los tres datos, el mensaje los incluye tras la frase base (303 hacia wa.me)", async () => {
  const r = await enviarFormulario({ producto: producto0.slug, cantidad: "500 unidades", ciudad: "Piura", contacto: "Distribuidora San Martín" });
  igual(r.status, 303, "estado");
  const { url, texto } = textoDelMensaje(r.headers.get("location"));
  igual(url.origin, "https://wa.me", "destino");
  igual(
    texto,
    `${mensajeEsperado(producto0)} Cantidad aproximada: 500 unidades. Ciudad de entrega: Piura. Nombre o empresa: Distribuidora San Martín.`,
    "mensaje",
  );
});

await prueba("funciona igual con multipart/form-data", async () => {
  const r = await enviarFormulario({ producto: producto0.slug, ciudad: "Arequipa" }, "multipart");
  igual(r.status, 303, "estado");
  afirmar(textoDelMensaje(r.headers.get("location")).texto.endsWith("Ciudad de entrega: Arequipa."), "no incluye la ciudad");
});

await prueba("todo es opcional: con los campos vacíos el mensaje es idéntico al del botón directo", async () => {
  const r = await enviarFormulario({ producto: producto0.slug, cantidad: "", ciudad: "   ", contacto: "" });
  igual(r.status, 303, "estado");
  igual(textoDelMensaje(r.headers.get("location")).texto, mensajeEsperado(producto0), "mensaje");
});

await prueba("solo se añade lo que el visitante escribió (un único dato opcional)", async () => {
  const r = await enviarFormulario({ producto: producto0.slug, cantidad: "2 000" });
  const { texto } = textoDelMensaje(r.headers.get("location"));
  afirmar(texto.endsWith("Cantidad aproximada: 2 000."), "falta la cantidad");
  afirmar(!/Ciudad|Nombre/.test(texto), "añadió campos que no se llenaron");
});

await prueba("sin producto en el formulario (por ejemplo desde /contacto) la cotización es general con los datos", async () => {
  const r = await enviarFormulario({ cantidad: "300", ciudad: "Trujillo" });
  igual(textoDelMensaje(r.headers.get("location")).texto, `${MENSAJE_GENERAL} Cantidad aproximada: 300. Ciudad de entrega: Trujillo.`, "mensaje");
});

await prueba("los textos largos se recortan a su límite (40 / 60 / 80)", async () => {
  const r = await enviarFormulario({ producto: producto0.slug, cantidad: "a".repeat(500), ciudad: "b".repeat(500), contacto: "c".repeat(500) });
  const { texto } = textoDelMensaje(r.headers.get("location"));
  afirmar(texto.includes(`Cantidad aproximada: ${"a".repeat(40)}.`) && !texto.includes("a".repeat(41)), "cantidad sin recortar");
  afirmar(texto.includes(`Ciudad de entrega: ${"b".repeat(60)}.`) && !texto.includes("b".repeat(61)), "ciudad sin recortar");
  afirmar(texto.includes(`Nombre o empresa: ${"c".repeat(80)}.`) && !texto.includes("c".repeat(81)), "contacto sin recortar");
});

await prueba("se eliminan saltos de línea, caracteres de control y direccionales invisibles", async () => {
  const r = await enviarFormulario({ producto: producto0.slug, cantidad: "500\r\nHola‮​ malo\u0000", contacto: "  Ana \n\n  Pérez  " });
  const { texto } = textoDelMensaje(r.headers.get("location"));
  afirmar(!/[\r\n‮​\u0000]/.test(texto), "quedaron caracteres de control o invisibles");
  afirmar(texto.includes("Cantidad aproximada: 500 Hola malo.") && texto.includes("Nombre o empresa: Ana Pérez."), `limpieza inesperada: ${texto}`);
});

await prueba("lo escrito se codifica: &, #, ?, comillas y emojis llegan intactos y no rompen el enlace", async () => {
  const r = await enviarFormulario({ producto: producto0.slug, contacto: 'Ñandú & Hijos #1 "SAC" ?x=1 🚚' });
  const location = r.headers.get("location");
  const { url, texto } = textoDelMensaje(location);
  igual(url.origin, "https://wa.me", "destino");
  igual([...url.searchParams.keys()].join(","), "text", "se coló otro parámetro");
  afirmar(texto.endsWith('Nombre o empresa: Ñandú & Hijos #1 "SAC" ?x=1 🚚.'), `texto: ${texto}`);
});

await prueba("un cuerpo ilegible no rompe nada: responde con la cotización general", async () => {
  const r = await obtener(BASE, "/api/whatsapp", { method: "POST", headers: { "content-type": "application/json" }, body: "{no es form" });
  afirmar([302, 303].includes(r.status), `estado ${r.status}`);
  igual(textoDelMensaje(r.headers.get("location")).texto, MENSAJE_GENERAL, "mensaje");
});

await prueba("el POST también es no-store y noindex", async () => {
  const r = await enviarFormulario({ producto: producto0.slug });
  afirmar(/no-store/.test(r.headers.get("cache-control") ?? "") && /noindex/.test(r.headers.get("x-robots-tag") ?? ""), "faltan cabeceras");
});

// =====================================================================
grupo(`7. Sitio sin número configurado (puerto ${PUERTO_SIN}): degradación segura`);
levantar(PUERTO_SIN, "");
const BASE_SIN = `http://localhost:${PUERTO_SIN}`;
await esperar(BASE_SIN);

await prueba("sin número, GET y POST envían a /#contacto en vez de a un error o a un wa.me roto", async () => {
  const g = await obtener(BASE_SIN, `/api/whatsapp?producto=${producto0.slug}`);
  afirmar([302, 307].includes(g.status), `GET estado ${g.status}`);
  igual(new URL(g.headers.get("location")).hash, "#contacto", "GET destino");
  afirmar(!/wa\.me/.test(g.headers.get("location")), "GET apunta a wa.me");
  const p = await obtener(BASE_SIN, "/api/whatsapp", { method: "POST", body: new URLSearchParams({ producto: producto0.slug }) });
  igual(p.status, 303, "POST estado");
  igual(new URL(p.headers.get("location")).hash, "#contacto", "POST destino");
});

await prueba("sin número, el sitio sigue funcionando y el correo queda como vía de contacto", async () => {
  for (const ruta of ["/", "/catalogo", "/contacto", `/catalogo/${producto0.slug}`]) igual((await obtener(BASE_SIN, ruta)).status, 200, ruta);
  afirmar((await (await obtener(BASE_SIN, "/contacto")).text()).includes(`mailto:${CORREO}`), "sin correo");
});

// ---------- Resumen ----------
detenerTodo();
const fallos = resultados.filter((r) => !r.ok);
console.log(`\n${resultados.length - fallos.length}/${resultados.length} comprobaciones superadas.`);
if (fallos.length) {
  console.log(`Fallan ${fallos.length}:\n - ${fallos.map((f) => f.nombre).join("\n - ")}`);
  process.exit(1);
}
