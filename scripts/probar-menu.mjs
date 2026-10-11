// Prueba del menú móvil y de la navegación básica con un Chrome real (pantalla de 390 px): abrir, Escape,
// bloqueo del scroll de fondo, navegar, botón flotante y enlace «Saltar al contenido».
//
// Uso:  npm run start      (en otra consola, tras npm run build)
//       npm run probar:menu -- http://localhost:3000

import { abrirNavegador } from "./lib/chrome.mjs";

const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const nav = await abrirNavegador();
const { cdp, evaluar, esperar } = nav;
await cdp("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await cdp("Page.navigate", { url: BASE + "/" });
await esperar(3500);

let fallos = 0;
const prueba = (nombre, ok, detalle = "") => {
  console.log(`  ${ok ? "✔" : "✘"} ${nombre}${ok ? "" : "  → " + detalle}`);
  if (!ok) fallos++;
};
const estado = async () =>
  JSON.parse(await evaluar(`JSON.stringify({ expandido: document.querySelector('[aria-controls=menu-movil]').getAttribute('aria-expanded'), inerte: document.getElementById('menu-movil').inert, visibilidad: getComputedStyle(document.getElementById('menu-movil')).visibility, desborde: document.body.style.overflow, ruta: location.pathname })`));
const tecla = async (key, code, vk) => {
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: vk });
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: vk });
};

let e = await estado();
prueba("menú cerrado al cargar (oculto, inerte, aria-expanded=false)", e.expandido === "false" && e.inerte && e.visibilidad === "hidden", JSON.stringify(e));
await evaluar("document.querySelector('[aria-controls=menu-movil]').click()");
await esperar(500);
e = await estado();
prueba("«Abrir menú» lo muestra, deja de ser inerte y bloquea el scroll del fondo", e.expandido === "true" && !e.inerte && e.visibilidad === "visible" && e.desborde === "hidden", JSON.stringify(e));
const enlaces = JSON.parse(await evaluar("JSON.stringify([...document.querySelectorAll('#menu-movil a')].map(a => a.textContent.trim() + ' → ' + a.getAttribute('href')))"));
prueba("el menú lleva Catálogo, Nosotros, Fabricación, Contacto, cotizar por WhatsApp y el correo", ["Catálogo", "Nosotros", "Fabricación", "Contacto"].every((x) => enlaces.some((l) => l.startsWith(x))) && enlaces.some((l) => l.includes("/api/whatsapp")) && enlaces.some((l) => l.includes("mailto:")), enlaces.join(" | "));
await tecla("Escape", "Escape", 27);
await esperar(500);
e = await estado();
prueba("Escape lo cierra y devuelve el scroll", e.expandido === "false" && e.inerte && e.desborde === "", JSON.stringify(e));
await evaluar("document.querySelector('[aria-controls=menu-movil]').click()");
await esperar(400);
await evaluar("[...document.querySelectorAll('#menu-movil a')].find(a => a.textContent.trim().startsWith('Catálogo')).click()");
await esperar(2500);
e = await estado();
prueba("elegir «Catálogo» navega a /catalogo y cierra el menú", e.ruta === "/catalogo" && e.expandido === "false" && e.desborde === "", JSON.stringify(e));
prueba("el botón flotante «Cotizar» es visible y táctil (≥ 44 px), apunta a /api/whatsapp y abre en pestaña nueva", await evaluar(`(() => { const a = document.querySelector('a[aria-label^="Cotizar por WhatsApp"]'); const r = a.getBoundingClientRect(); return a.getAttribute('href') === '/api/whatsapp' && r.bottom <= innerHeight && r.width >= 44 && r.height >= 44 && a.target === '_blank' && a.rel.includes('noopener'); })()`));
prueba("existe el enlace «Saltar al contenido» y su destino", await evaluar("!!document.querySelector('a[href=\"#contenido\"]') && !!document.getElementById('contenido')"));
await cdp("Page.navigate", { url: BASE + "/catalogo" });
await esperar(2500);
const cat = JSON.parse(await evaluar(`JSON.stringify({ chips: [...document.querySelectorAll('nav[aria-label="Categorías del catálogo"] a')].map(a => a.getAttribute('href')), activa: document.querySelector('nav[aria-label="Categorías del catálogo"] a[aria-current]')?.getAttribute('href') })`));
prueba("el catálogo ofrece «Todas» y cada categoría como enlace, con la actual marcada (aria-current)", cat.chips.length === 7 && cat.chips[0] === "/catalogo" && cat.chips.slice(1).every((h) => h.startsWith("/catalogo/categoria/")) && cat.activa === "/catalogo", JSON.stringify(cat));
const buscar = async (texto) => {
  await evaluar(`(() => { const el = document.getElementById('buscar-producto'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, ${JSON.stringify(texto)}); el.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await esperar(300);
  return JSON.parse(await evaluar(`JSON.stringify({ estado: document.querySelector('[role=status]')?.textContent, tarjetas: [...document.querySelectorAll('main ul li h3')].map(h => h.textContent.trim()), sinResultados: [...document.querySelectorAll('main h2')].some(h => h.textContent.trim() === 'Sin resultados') })`));
};
let r = await buscar("pescado");
prueba("buscar «pescado» deja solo los modelos que lo mencionan (nombre, uso o resumen)", r.estado === "2 modelos" && r.tarjetas.some((t) => t.startsWith("Jaba para pescado")), JSON.stringify(r));
r = await buscar("60x40");
prueba("buscar por medidas «60x40» encuentra el modelo de 60 × 40", r.tarjetas.length >= 1 && r.tarjetas.every((t) => /60 × 40/.test(t)), JSON.stringify(r));
r = await buscar("zzzz");
prueba("una búsqueda sin coincidencias dice «0 modelos» y «Sin resultados»", r.estado === "0 modelos" && r.sinResultados, JSON.stringify(r));
r = await buscar("");
prueba("vaciar la búsqueda devuelve los 7 modelos", r.estado === "7 modelos" && r.tarjetas.length === 7, JSON.stringify(r));
nav.cerrar();
console.log(fallos ? `\n${fallos} fallo(s)` : "\nNavegación móvil: todo en orden.");
process.exit(fallos ? 1 : 0);
