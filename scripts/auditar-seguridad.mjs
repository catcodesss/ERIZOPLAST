// Auditoría de seguridad del proyecto. Comprueba, sin servicios externos:
//   · que ningún secreto (el de .env.local ni uno con forma de clave) esté en el código, la documentación o lo que
//     descarga el navegador;
//   · que .env* quede fuera del repositorio y solo se versione la plantilla sin valores reales;
//   · que las variables públicas sean solo las previstas y los módulos con secretos sean «server-only»;
//   · que el sitio compilado envíe las cabeceras de seguridad y no anuncie el framework.
// Los valores de .env.local se leen solo para buscarlos: nunca se imprimen (se sustituyen por <SECRETO>).
//
// Uso:  npm run build && npm run auditar

import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUERTO = 4012;
const VARIABLES_PUBLICAS_PERMITIDAS = new Set(["NEXT_PUBLIC_SITE_URL"]);
const EXTENSIONES_TEXTO = /\.(tsx?|mjs|cjs|js|json|md|css|svg|html|txt|ya?ml|rsc|example|bat|ps1|map)$/i;

let fallos = 0;
const secretos = [];
function prueba(nombre, fn) {
  try {
    fn();
    console.log(`  ✔ ${nombre}`);
  } catch (error) {
    fallos++;
    console.log(`  ✘ ${nombre}\n      ${ocultar(error?.message ?? error)}`);
  }
}
async function pruebaAsync(nombre, fn) {
  try {
    await fn();
    console.log(`  ✔ ${nombre}`);
  } catch (error) {
    fallos++;
    console.log(`  ✘ ${nombre}\n      ${ocultar(error?.message ?? error)}`);
  }
}
const afirmar = (condicion, mensaje) => {
  if (!condicion) throw new Error(mensaje);
};
const ocultar = (texto) => secretos.reduce((t, s) => t.replaceAll(s, "<SECRETO>"), String(texto));
const grupo = (titulo) => console.log(`\n${titulo}`);

function recorrer(directorio, ignorar, acumulado = []) {
  for (const nombre of readdirSync(directorio)) {
    const completa = path.join(directorio, nombre);
    if (ignorar(nombre)) continue;
    if (statSync(completa).isDirectory()) recorrer(completa, ignorar, acumulado);
    else acumulado.push(completa);
  }
  return acumulado;
}
const sinComentarios = (c) => c.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const rel = (f) => path.relative(raiz, f);

// ---------- Secretos de .env.local (solo para buscarlos) ----------
const envLocal = existsSync(path.join(raiz, ".env.local")) ? readFileSync(path.join(raiz, ".env.local"), "utf8") : "";
for (const linea of envLocal.split(/\r?\n/)) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/.exec(linea.replace(/^\uFEFF/, ""));
  if (m && m[2].length >= 8 && !/^https?:\/\//.test(m[2])) secretos.push(m[2].replace(/^["']|["']$/g, ""));
}

const archivosProyecto = recorrer(raiz, (n) => ["node_modules", ".next", ".git", ".vercel", ".claude"].includes(n) || n.startsWith(".env") || n === "tsconfig.tsbuildinfo").filter((f) => EXTENSIONES_TEXTO.test(f));

grupo("1. Secretos fuera del código y de lo público");
prueba("ningún valor de .env.local aparece en el código, la documentación ni los scripts", () => {
  if (secretos.length === 0) return; // no hay .env.local: nada que buscar (se avisa abajo)
  const donde = archivosProyecto.filter((f) => secretos.some((s) => readFileSync(f, "utf8").includes(s))).map(rel);
  afirmar(donde.length === 0, `aparecen en: ${donde.join(", ")}`);
});
prueba("ningún valor de .env.local está en lo que descarga el navegador (.next/static, public/) ni en lo prerenderizado", () => {
  if (secretos.length === 0) return;
  const sitios = [path.join(raiz, ".next", "static"), path.join(raiz, "public"), path.join(raiz, ".next", "server", "app")].filter(existsSync);
  afirmar(sitios.length > 0, "no hay compilación: ejecuta npm run build antes");
  const archivos = sitios.flatMap((s) => recorrer(s, () => false)).filter((f) => EXTENSIONES_TEXTO.test(f));
  afirmar(archivos.length > 20, `solo se revisaron ${archivos.length} archivos`);
  const donde = archivos.filter((f) => secretos.some((s) => readFileSync(f, "utf8").includes(s))).map(rel);
  afirmar(donde.length === 0, `aparecen en: ${donde.join(", ")}`);
});
prueba("ningún texto con forma de clave o credencial (Resend, OpenAI, AWS, claves privadas, api_key = \"…\") en el código", () => {
  const patrones = [/\bre_[A-Za-z0-9]{20,}/, /\bsk-[A-Za-z0-9_-]{20,}/, /\bAKIA[0-9A-Z]{16}\b/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /\b(api[_-]?key|secret|token|password)\b\s*[:=]\s*["'][^"'\s]{16,}["']/i];
  const donde = archivosProyecto.filter((f) => patrones.some((p) => p.test(sinComentarios(readFileSync(f, "utf8"))))).map(rel);
  afirmar(donde.length === 0, `posibles credenciales en: ${donde.join(", ")}`);
});
prueba("public/ no contiene archivos de configuración, claves ni mapas de código", () => {
  const publico = existsSync(path.join(raiz, "public")) ? recorrer(path.join(raiz, "public"), () => false) : [];
  const raros = publico.filter((f) => /(^|[\\/])\.env|\.(pem|key|p12|map|sql|bak|log)$/i.test(f)).map(rel);
  afirmar(raros.length === 0, `archivos sospechosos: ${raros.join(", ")}`);
});
if (secretos.length === 0) console.log("  · aviso: no hay .env.local con valores; las dos primeras comprobaciones no tenían qué buscar.");

grupo("2. Variables de entorno y repositorio");
prueba(".gitignore excluye .env* (todos los .env locales) y deja versionar solo .env.example", () => {
  const g = readFileSync(path.join(raiz, ".gitignore"), "utf8");
  afirmar(/^\.env\*\s*$/m.test(g), "falta la regla .env*");
  afirmar(/^!\.env\.example\s*$/m.test(g), "falta la excepción !.env.example");
});
prueba(".env.example no lleva valores reales: claves y números vacíos o ficticios", () => {
  const ej = readFileSync(path.join(raiz, ".env.example"), "utf8").replace(/^\uFEFF/, "");
  afirmar(/^ERIZOPLAST_RESEND_API_KEY=\s*$/m.test(ej), "ERIZOPLAST_RESEND_API_KEY debe ir vacía en .env.example");
  afirmar(/^ERIZOPLAST_WHATSAPP_NUMBER=51900000000\s*$/m.test(ej), "el número de ejemplo debe ser el ficticio 51900000000");
  for (const s of secretos) afirmar(!ej.includes(s), "un valor de .env.local está en .env.example");
});
prueba("las únicas variables NEXT_PUBLIC_ (visibles en el navegador) son las previstas y no son secretas", () => {
  const usadas = new Set();
  for (const f of [...archivosProyecto, path.join(raiz, ".env.example")]) for (const m of readFileSync(f, "utf8").matchAll(/NEXT_PUBLIC_[A-Z0-9_]+/g)) usadas.add(m[0]);
  const extra = [...usadas].filter((v) => !VARIABLES_PUBLICAS_PERMITIDAS.has(v));
  afirmar(extra.length === 0, `variables públicas no previstas: ${extra.join(", ")}`);
});
prueba("quien lee una variable ERIZOPLAST_* es un módulo «server-only» (nunca un componente de navegador)", () => {
  const culpables = archivosProyecto
    .filter((f) => /[\\/](app|components|lib|data)[\\/]/.test(f) && /\.tsx?$/.test(f))
    .filter((f) => /process\.env\b[^;\n]*ERIZOPLAST_|process\.env\[\s*VARIABLE_/.test(sinComentarios(readFileSync(f, "utf8"))))
    .filter((f) => !/^\s*import\s+["']server-only["']/m.test(readFileSync(f, "utf8")));
  afirmar(culpables.length === 0, `sin server-only: ${culpables.map(rel).join(", ")}`);
});
prueba("ningún componente con \"use client\" importa un módulo server-only", () => {
  const serverOnly = archivosProyecto.filter((f) => /\.tsx?$/.test(f) && /^\s*import\s+["']server-only["']/m.test(readFileSync(f, "utf8"))).map((f) => path.basename(f).replace(/\.tsx?$/, ""));
  const culpables = archivosProyecto
    .filter((f) => /\.tsx$/.test(f) && /^\s*["']use client["']/m.test(readFileSync(f, "utf8")))
    .filter((f) => serverOnly.some((m) => new RegExp(`from\\s+["'][^"']*[\\\\/]${m}["']`).test(readFileSync(f, "utf8"))));
  afirmar(culpables.length === 0, culpables.map(rel).join(", "));
});
prueba("dangerouslySetInnerHTML solo se usa en los datos estructurados (JSON-LD, con «<» escapado)", () => {
  const usos = archivosProyecto.filter((f) => /\.tsx?$/.test(f) && /dangerouslySetInnerHTML/.test(sinComentarios(readFileSync(f, "utf8")))).map(rel);
  afirmar(usos.length === 1 && /DatosEstructurados\.tsx$/.test(usos[0]), `usos: ${usos.join(", ")}`);
  afirmar(/replace\(\/<\/g, "\\\\u003c"\)/.test(readFileSync(path.join(raiz, "components", "seo", "DatosEstructurados.tsx"), "utf8")), "no escapa «<»");
});

grupo("3. Sitio compilado: cabeceras y respuestas");
if (!existsSync(path.join(raiz, ".next", "BUILD_ID"))) {
  fallos++;
  console.log("  ✘ no hay compilación de producción. Ejecuta primero: npm run build");
} else {
  const nextBin = path.join(raiz, "node_modules", "next", "dist", "bin", "next");
  const hijo = spawn(process.execPath, [nextBin, "start", "-p", String(PUERTO)], { cwd: raiz, env: { ...process.env, NODE_ENV: "production" }, stdio: "ignore", windowsHide: true });
  const detener = () => {
    if (!hijo.pid) return;
    if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(hijo.pid), "/T", "/F"], { stdio: "ignore" });
    else hijo.kill("SIGTERM");
  };
  process.on("exit", detener);
  const BASE = `http://localhost:${PUERTO}`;
  let listo = false;
  for (let i = 0; i < 90 && !listo; i++) {
    try {
      listo = (await fetch(`${BASE}/robots.txt`)).ok;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  if (!listo) {
    fallos++;
    console.log("  ✘ el servidor no arrancó");
  } else {
    const rutas = ["/", "/catalogo", "/contacto", "/privacidad"];
    await pruebaAsync("todas las páginas llevan nosniff, X-Frame-Options, Referrer-Policy y Permissions-Policy", async () => {
      for (const r of rutas) {
        const h = (await fetch(BASE + r)).headers;
        afirmar(h.get("x-content-type-options") === "nosniff", `${r}: falta X-Content-Type-Options`);
        afirmar(h.get("x-frame-options") === "DENY", `${r}: falta X-Frame-Options`);
        afirmar(h.get("referrer-policy") === "strict-origin-when-cross-origin", `${r}: falta Referrer-Policy`);
        afirmar(/camera=\(\)/.test(h.get("permissions-policy") ?? ""), `${r}: falta Permissions-Policy`);
      }
    });
    await pruebaAsync("no se anuncia el framework (sin X-Powered-By)", async () => afirmar(!(await fetch(BASE + "/")).headers.has("x-powered-by"), "X-Powered-By presente"));
    await pruebaAsync("las respuestas de /api/ no se guardan en caché ni se indexan", async () => {
      const r = await fetch(`${BASE}/api/whatsapp`, { redirect: "manual" });
      afirmar(/no-store/.test(r.headers.get("cache-control") ?? ""), "/api/whatsapp sin no-store");
      afirmar(/noindex/.test(r.headers.get("x-robots-tag") ?? ""), "/api/whatsapp sin noindex");
      const p = await fetch(`${BASE}/api/novedades`, { method: "POST", headers: { origin: BASE, "content-type": "application/json" }, body: "{}" });
      afirmar(/no-store/.test(p.headers.get("cache-control") ?? ""), "/api/novedades sin no-store");
    });
    await pruebaAsync("/api/novedades rechaza peticiones sin origen o de otro sitio (403)", async () => {
      const cuerpo = JSON.stringify({ correo: "a@b.co", consentimiento: true, tiempo: 5000 });
      afirmar((await fetch(`${BASE}/api/novedades`, { method: "POST", headers: { "content-type": "application/json" }, body: cuerpo })).status === 403, "sin Origin no dio 403");
      afirmar((await fetch(`${BASE}/api/novedades`, { method: "POST", headers: { origin: "https://malo.example", "content-type": "application/json" }, body: cuerpo })).status === 403, "Origin ajeno no dio 403");
    });
    await pruebaAsync("la guía interna /sistema-diseno no existe en producción (404) y las rutas privadas no se indexan", async () => {
      afirmar((await fetch(`${BASE}/sistema-diseno`)).status === 404, "/sistema-diseno responde");
      const robots = await (await fetch(`${BASE}/robots.txt`)).text();
      afirmar(/Disallow:\s*\/api\//.test(robots), "robots.txt no oculta /api/");
      for (const r of ["/privacidad", "/creditos"]) afirmar(/name="robots" content="noindex/.test(await (await fetch(BASE + r)).text()), `${r} sin noindex`);
    });
    await pruebaAsync("las páginas no filtran secretos ni rutas del equipo en el HTML (claves, C:\\\\Users, .env)", async () => {
      for (const r of rutas) {
        const html = await (await fetch(BASE + r)).text();
        afirmar(!/ERIZOPLAST_(RESEND|WHATSAPP|CONTACTO)/.test(html), `${r} nombra una variable secreta`);
        afirmar(!/C:\\\\Users|\.env(\.local)?\b/.test(html), `${r} filtra una ruta local`);
        for (const s of secretos) afirmar(!html.includes(s), `${r} contiene un secreto`);
      }
    });
  }
  detener();
}

console.log(fallos ? `\n${fallos} comprobación(es) fallaron.` : "\nTodo en orden.");
process.exitCode = fallos ? 1 : 0;
