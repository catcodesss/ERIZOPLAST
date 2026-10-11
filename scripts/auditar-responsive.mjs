// Auditoría responsive con un Chrome real: carga cada página pública en 12 anchos de pantalla (320 → 1920 px,
// de móviles pequeños a monitores grandes) y mide, en cada una:
//   · desbordamiento horizontal (cajas o texto que se salen del ancho, ignorando lo que está bien recortado
//     —filas con scroll horizontal, paneles fuera de pantalla, elementos fijos—);
//   · texto menor de 11 px;
//   · objetivos táctiles menores de 24 px (WCAG 2.2) en pantallas de móvil;
//   · que haya un único <h1>.
// Las páginas salen de los datos: cada categoría y cada producto publicado.
//
// Uso:  npm run build && npm run start      (en otra consola)
//       npm run responsive -- http://localhost:3000
// Código de salida 1 si hay desbordamientos. Tarda 5 minutos aproximadamente.

import { pathToFileURL } from "node:url";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { abrirNavegador } from "./lib/chrome.mjs";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");

const { productos } = await import(pathToFileURL(path.join(raiz, "data", "productos.ts")).href);
const { CATEGORIAS } = await import(pathToFileURL(path.join(raiz, "data", "categorias.ts")).href);
const rutas = ["/", "/catalogo", ...CATEGORIAS.map((c) => `/catalogo/categoria/${c.id}`), ...productos.filter((p) => p.publicado).map((p) => `/catalogo/${p.slug}`), "/contacto", "/privacidad", "/creditos", "/ruta-que-no-existe"];
const anchos = [320, 360, 375, 390, 430, 600, 768, 820, 1024, 1280, 1440, 1920];

const MEDIR = `(() => {
  const d = document, cw = d.documentElement.clientWidth;
  const texto = [], cajas = [], pequeno = new Set(), tap = new Set();
  const tw = d.createTreeWalker(d.body, NodeFilter.SHOW_TEXT); let n;
  while ((n = tw.nextNode())) {
    if (!n.textContent.trim()) continue; const p = n.parentElement;
    if (p.closest('[aria-hidden=true]') || p.closest('details:not([open])') || getComputedStyle(p).visibility === 'hidden') continue;
    let ignorar = false;
    for (let a = p; a; a = a.parentElement) { const s = getComputedStyle(a); if (s.position === 'fixed') ignorar = true; if (a !== p && a !== d.body && ['hidden','clip','auto','scroll'].includes(s.overflowX) && a.getBoundingClientRect().right <= cw + 1) ignorar = true; }
    if (ignorar) continue;
    const rg = d.createRange(); rg.selectNodeContents(n); const r = rg.getBoundingClientRect();
    if (r.width && r.right > cw + 1) texto.push(Math.round(r.right - cw) + ' "' + n.textContent.trim().slice(0, 26) + '"');
  }
  for (const el of d.body.querySelectorAll('*')) {
    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    if (r.right > cw + 1) { let ign = false; for (let a = el; a && a !== d.body; a = a.parentElement) { const s = getComputedStyle(a); if (s.position === 'fixed' || a.getAttribute('aria-hidden') === 'true') ign = true; if (a !== el && ['hidden','clip','auto','scroll'].includes(s.overflowX) && a.getBoundingClientRect().right <= cw + 1) ign = true; } if (!ign) cajas.push(el.tagName.toLowerCase() + ' +' + Math.round(r.right - cw)); }
    if ([...el.childNodes].some(x => x.nodeType === 3 && x.textContent.trim()) && parseFloat(cs.fontSize) < 11 && !el.closest('[aria-hidden=true]')) pequeno.add(cs.fontSize + ' "' + el.textContent.trim().slice(0, 20) + '"');
    if (['A','BUTTON','INPUT','SUMMARY','SELECT'].includes(el.tagName) && el.type !== 'hidden' && el.tabIndex >= 0 && !el.closest('[aria-hidden=true]') && !el.closest('[inert]') && (r.height < 24 || r.width < 24) && !(el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio'))) tap.add(el.tagName.toLowerCase() + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' "' + (el.textContent.trim() || el.getAttribute('aria-label') || '').slice(0, 20) + '"');
  }
  return JSON.stringify({ cw, sw: d.documentElement.scrollWidth, texto: texto.slice(0, 3), cajas: cajas.slice(0, 3), pequeno: [...pequeno].slice(0, 3), tap: [...tap].slice(0, 4), h1: d.querySelectorAll('h1').length });
})()`;

const nav = await abrirNavegador();
const { cdp, evaluar, esperar } = nav;
let revisadas = 0;
const desbordamientos = [];
const sinH1Unico = [];
const tapMovil = new Map();
const pequenos = new Set();

for (const ruta of rutas) {
  for (const W of anchos) {
    await cdp("Emulation.setDeviceMetricsOverride", { width: W, height: 900, deviceScaleFactor: 1, mobile: W < 800 });
    await cdp("Page.navigate", { url: BASE + ruta });
    await esperar(1800);
    await evaluar("window.scrollTo(0, document.body.scrollHeight)");
    await esperar(400);
    await evaluar("window.scrollTo(0, 0)");
    await esperar(300);
    const r = JSON.parse(await evaluar(MEDIR));
    revisadas++;
    if (r.sw > r.cw || r.texto.length || r.cajas.length) desbordamientos.push({ ruta, ancho: W, scrollWidth: r.sw, clientWidth: r.cw, texto: r.texto, cajas: r.cajas });
    if (r.h1 !== 1 && !sinH1Unico.includes(ruta)) sinH1Unico.push(ruta);
    if (W <= 430) for (const t of r.tap) tapMovil.set(t, ruta);
    for (const p of r.pequeno) pequenos.add(p);
  }
}
nav.cerrar();

console.log(`\nRevisadas ${revisadas} combinaciones (${rutas.length} páginas × ${anchos.length} anchos: ${anchos[0]}–${anchos.at(-1)} px) en ${BASE}`);
console.log(desbordamientos.length ? `✘ Desbordamientos horizontales: ${desbordamientos.length}` : "✔ Ningún desbordamiento horizontal");
for (const d of desbordamientos) console.log("   ", JSON.stringify(d));
console.log(sinH1Unico.length ? `✘ Páginas sin un único <h1>: ${sinH1Unico.join(", ")}` : "✔ Un único <h1> en cada página");
console.log(pequenos.size ? `✘ Texto menor de 11 px: ${[...pequenos].join(" | ")}` : "✔ Ningún texto menor de 11 px");
if (tapMovil.size) {
  console.log(`· Objetivos táctiles menores de 24 px en móvil (revisar si son enlaces sueltos y no enlaces dentro de una frase): ${tapMovil.size}`);
  for (const [t, ruta] of [...tapMovil].slice(0, 10)) console.log(`    ${ruta}  ${t}`);
}
process.exit(desbordamientos.length || sinH1Unico.length || pequenos.size ? 1 : 0);
