// Mide LCP, FCP, CLS, TBT aproximado y peso transferido de una página con un Chrome real, en dos perfiles:
//   movil       → pantalla de 390 px, CPU 4× más lenta y red «4G lenta» (1,6 Mb/s, 150 ms): es el perfil de
//                 Lighthouse móvil, el más exigente;
//   escritorio  → 1440 px sin estrangular.
// Reporta la mediana de varias repeticiones. LCP y FCP se fijan ANTES de desplazarse (en un Chrome real el LCP
// termina con la primera interacción); el CLS incluye un recorrido completo de la página.
//
// Uso:  npm run build && npm run start      (en otra consola)
//       npm run medir -- http://localhost:3000/ [movil|escritorio] [repeticiones]
// Umbrales «buenos» de Google: LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms (aprox. de INP).
// Mide siempre una compilación de producción: `npm run dev` es mucho más lento y no representa al visitante.

import { abrirNavegador } from "./lib/chrome.mjs";

const [, , url = "http://localhost:3000/", perfil = "movil", repeticiones = "3"] = process.argv;

const INYECCION = `(() => {
  const m = window.__m = { lcp: 0, lcpEl: '', cls: 0, fcp: 0, largas: [] };
  new PerformanceObserver((l) => { for (const e of l.getEntries()) { m.lcp = e.startTime; m.lcpEl = e.element ? e.element.tagName + (e.url ? ' ' + e.url.slice(-60) : '') : ''; } }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) m.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') m.fcp = e.startTime; }).observe({ type: 'paint', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) m.largas.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true });
})();`;

async function una() {
  const nav = await abrirNavegador();
  const { cdp, evaluar, eventos, esperar } = nav;
  await cdp("Network.setCacheDisabled", { cacheDisabled: true });
  if (perfil === "movil") {
    await cdp("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await cdp("Emulation.setCPUThrottlingRate", { rate: 4 });
    await cdp("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  } else {
    await cdp("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  }
  await cdp("Page.addScriptToEvaluateOnNewDocument", { source: INYECCION });
  await cdp("Page.navigate", { url });
  await esperar(7000);
  const antes = JSON.parse(await evaluar("JSON.stringify(window.__m)"));
  for (let y = 0; y < 9000; y += 700) {
    await evaluar(`window.scrollTo(0, ${y})`);
    await esperar(180);
  }
  await esperar(1500);
  const m = JSON.parse(await evaluar("JSON.stringify(window.__m)"));

  const tipos = new Map();
  const bytesPorTipo = {};
  let total = 0;
  for (const e of eventos) {
    if (e.method === "Network.requestWillBeSent") tipos.set(e.params.requestId, e.params.type);
    if (e.method === "Network.loadingFinished") {
      const t = tipos.get(e.params.requestId) ?? "Otro";
      total += e.params.encodedDataLength;
      bytesPorTipo[t] = (bytesPorTipo[t] ?? 0) + e.params.encodedDataLength;
    }
  }
  const tbt = m.largas.filter(([inicio]) => inicio >= antes.fcp && inicio < 7000).reduce((s, [, d]) => s + Math.max(0, d - 50), 0);
  nav.cerrar();
  return {
    lcp: Math.round(antes.lcp),
    fcp: Math.round(antes.fcp),
    cls: +m.cls.toFixed(3),
    tbt: Math.round(tbt),
    elementoLcp: antes.lcpEl,
    totalKB: Math.round(total / 1024),
    porTipoKB: Object.fromEntries(Object.entries(bytesPorTipo).map(([k, v]) => [k, Math.round(v / 1024)])),
  };
}

const n = Number(repeticiones);
const corridas = [];
for (let i = 0; i < n; i++) corridas.push(await una());
const mediana = (k) => corridas.map((r) => r[k]).sort((a, b) => a - b)[Math.floor(n / 2)];
const veredicto = (valor, bueno, malo) => (valor <= bueno ? "bueno" : valor <= malo ? "mejorable" : "malo");
console.log(`\n${url}  ·  perfil ${perfil}  ·  mediana de ${n}`);
console.log(`  LCP ${mediana("lcp")} ms (${veredicto(mediana("lcp"), 2500, 4000)})   FCP ${mediana("fcp")} ms`);
console.log(`  CLS ${mediana("cls")} (${veredicto(mediana("cls"), 0.1, 0.25)})   TBT ${mediana("tbt")} ms (${veredicto(mediana("tbt"), 200, 600)})`);
console.log(`  Transferido ${mediana("totalKB")} KB tras recorrer la página · elemento LCP: ${corridas.at(-1).elementoLcp || "(texto)"}`);
console.log(`  Por tipo (KB): ${JSON.stringify(corridas.at(-1).porTipoKB)}`);
process.exit(0);
