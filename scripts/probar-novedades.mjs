// Pruebas funcionales del formulario de novedades (Fase 7), sin gastar ni un correo real.
//
// Levanta un Resend SIMULADO en el puerto 4021 que responde lo que cada prueba le pide (éxito, clave inválida,
// límite, caída, tiempo agotado…) y registra qué le llegó. El sitio debe estar en marcha apuntando a él:
// fuera de producción, lib/novedades.ts acepta ERIZOPLAST_RESEND_URL justo para esto. En producción esa variable
// se ignora a propósito. Este simulador solo existe para probar: el sitio nunca finge un envío por su cuenta.
//
//   1) Con el servidor de desarrollo arrancado con estas variables (ver CONFIGURACION-FASE-7.md, «Probar»):
//        ERIZOPLAST_RESEND_API_KEY=re_prueba_no_real
//        ERIZOPLAST_RESEND_URL=http://localhost:4021/emails
//        node scripts/probar-novedades.mjs
//      Con --ui añade un 6.º grupo en un navegador real (Chrome o Edge): node scripts/probar-novedades.mjs --ui
//   2) Con el servidor arrancado SIN clave, para comprobar que no finge un envío:
//        node scripts/probar-novedades.mjs --sin-clave
//
// PRUEBA_URL cambia el sitio probado (por defecto http://localhost:3000). Cada ejecución consume cupo del límite
// por IP y global del servidor (en memoria): si repites muchas veces, reinicia el servidor.
// Salida: ✔ / ✘ por comprobación; código de salida 1 si algo falla.

import http from "node:http";
import { setTimeout as esperar } from "node:timers/promises";

const BASE = process.env.PRUEBA_URL ?? "http://localhost:3000";
const PUERTO_SIMULADOR = 4021;
const CLAVE_PRUEBA = "re_prueba_no_real";
const sinClave = process.argv.includes("--sin-clave");

// ---------- Mini arnés ----------
let fallos = 0;
async function prueba(nombre, fn) {
  try {
    await fn();
    console.log(`  ✔ ${nombre}`);
  } catch (error) {
    fallos += 1;
    console.log(`  ✘ ${nombre}\n      ${error?.message ?? error}`);
  }
}
function afirmar(condicion, mensaje) {
  if (!condicion) throw new Error(mensaje);
}
function igual(real, esperado, mensaje) {
  if (real !== esperado) throw new Error(`${mensaje}\n      esperado: ${JSON.stringify(esperado)}\n      recibido: ${JSON.stringify(real)}`);
}
const grupo = (titulo) => console.log(`\n${titulo}`);
// Salir tras una pausa: process.exit con conexiones fetch aún cerrándose provoca un fallo de libuv en Windows.
async function salir(codigo) {
  process.exitCode = codigo;
  await esperar(300);
  process.exit(codigo);
}

// ---------- Resend simulado ----------
let modo = "ok";
const recibidos = [];
const simulador = http.createServer((req, res) => {
  let cuerpo = "";
  req.on("data", (trozo) => (cuerpo += trozo));
  req.on("end", async () => {
    recibidos.push({ metodo: req.method, ruta: req.url, autorizacion: req.headers.authorization, cuerpo: safeJson(cuerpo) });
    const json = (estado, objeto) => {
      res.writeHead(estado, { "content-type": "application/json" });
      res.end(JSON.stringify(objeto));
    };
    switch (modo) {
      case "ok":
        return json(200, { id: "49a3999c-0ce1-4ea6-ab68-afcd6dc2e794" });
      case "ok-lento":
        await esperar(1800); // para ver el estado de carga en el navegador
        return json(200, { id: "49a3999c-0ce1-4ea6-ab68-afcd6dc2e794" });
      case "sin-id":
        return json(200, {});
      case "clave-invalida":
        return json(401, { statusCode: 401, name: "invalid_api_key", message: "API key is invalid" });
      case "solo-pruebas":
        return json(403, { statusCode: 403, name: "validation_error", message: "You can only send testing emails to your own email address" });
      case "rechazado":
        return json(422, { statusCode: 422, name: "validation_error", message: "Invalid `to` field" });
      case "limite":
        return json(429, { statusCode: 429, name: "rate_limit_exceeded", message: "Too many requests" });
      case "caido":
        return json(500, { statusCode: 500, name: "internal_server_error", message: "boom" });
      case "html":
        res.writeHead(502, { "content-type": "text/html" });
        return res.end("<html>Bad gateway</html>");
      case "lento":
        await esperar(9500); // más que el tiempo máximo de espera del sitio (8 s)
        return json(200, { id: "tarde" });
    }
  });
});
const safeJson = (texto) => {
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
};

// ---------- Peticiones ----------
let contadorIp = 0;
const bloqueIp = Math.floor(Math.random() * 256); // otra tanda por ejecución: no choca con IP de una vuelta anterior
/** Cada prueba usa su propia IP (cabecera que Vercel rellena): así no comparten el límite de 5 por hora. */
const ipNueva = () => `198.51.${bloqueIp}.${++contadorIp}`;

function enviar({ cuerpo, ip = ipNueva(), origen = BASE, tipo = "application/json", metodo = "POST", crudo } = {}) {
  const headers = { "x-forwarded-for": ip };
  if (origen !== null) headers.origin = origen;
  if (tipo) headers["content-type"] = tipo;
  return fetch(`${BASE}/api/novedades`, { method: metodo, headers, body: crudo ?? (metodo === "GET" ? undefined : JSON.stringify(cuerpo)) }).then(async (r) => ({
    estado: r.status,
    headers: r.headers,
    cuerpo: await r.json().catch(() => null),
  }));
}
const valido = (extra = {}) => ({ correo: "ventas.lima+jabas@empresa.com.pe", empresa: "Distribuidora Andina S.A.C.", consentimiento: true, url_confirmacion: "", tiempo: 5000, ...extra });
const cuantosLlegaron = () => recibidos.length;

// =====================================================================
if (sinClave) {
  grupo(`Servidor SIN clave de Resend (${BASE})`);
  await prueba("una solicitud perfecta responde 503 «no disponible» y no finge éxito", async () => {
    const r = await enviar({ cuerpo: valido() });
    igual(r.estado, 503, "estado");
    igual(r.cuerpo?.ok, false, "ok");
    afirmar(/aún no está disponible/.test(r.cuerpo?.mensaje ?? ""), `mensaje inesperado: ${r.cuerpo?.mensaje}`);
  });
  await prueba("la validación sigue mandando: un correo inválido es 400, no 503", async () => {
    const r = await enviar({ cuerpo: valido({ correo: "no-es-correo" }) });
    igual(r.estado, 400, "estado");
  });
  await prueba("sin consentimiento es 400 aunque falte la clave", async () => {
    const r = await enviar({ cuerpo: valido({ consentimiento: false }) });
    igual(r.estado, 400, "estado");
  });
  console.log(fallos ? `\n${fallos} comprobación(es) fallaron.` : "\nTodo en orden.");
  await salir(fallos ? 1 : 0);
}

await new Promise((resolver, rechazar) => simulador.once("error", rechazar).listen(PUERTO_SIMULADOR, resolver));
process.on("exit", () => simulador.close());

try {
  const r = await fetch(`${BASE}/robots.txt`);
  if (!r.ok) throw new Error(`robots.txt respondió ${r.status}`);
} catch (error) {
  console.error(`El sitio no responde en ${BASE} (${error.message}). Arráncalo con las variables indicadas en la cabecera de este archivo.`);
  await salir(1);
}

// =====================================================================
grupo("1. Defensas previas (nada de esto debe llegar a Resend)");
const antes = cuantosLlegaron();

await prueba("sin cabecera Origin → 403", async () => igual((await enviar({ cuerpo: valido(), origen: null })).estado, 403, "estado"));
await prueba("Origin de otro sitio → 403", async () => igual((await enviar({ cuerpo: valido(), origen: "https://malo.example" })).estado, 403, "estado"));
await prueba("Origin «null» (iframe aislado) → 403", async () => igual((await enviar({ cuerpo: valido(), origen: "null" })).estado, 403, "estado"));
await prueba("tipo de contenido que no es JSON → 415", async () => igual((await enviar({ crudo: "correo=a@b.com", tipo: "application/x-www-form-urlencoded" })).estado, 415, "estado"));
await prueba("cuerpo de más de 2000 caracteres → 413", async () => igual((await enviar({ cuerpo: valido({ empresa: "x".repeat(3000) }) })).estado, 413, "estado"));
await prueba("JSON roto → 400", async () => igual((await enviar({ crudo: "{no es json" })).estado, 400, "estado"));
await prueba("JSON que no es un objeto (lista, texto, null) → 400", async () => {
  for (const crudo of ["[1,2]", '"hola"', "null", "42"]) igual((await enviar({ crudo })).estado, 400, `cuerpo ${crudo}`);
});
await prueba("GET, PUT y DELETE → 405", async () => {
  for (const metodo of ["GET", "PUT", "DELETE"]) igual((await enviar({ metodo, tipo: null })).estado, 405, metodo);
});
await prueba("campo trampa relleno → 200 «Listo.» sin enviar nada (es lo único que se finge, solo ante un bot)", async () => {
  const r = await enviar({ cuerpo: valido({ url_confirmacion: "http://spam.example" }) });
  igual(r.estado, 200, "estado");
  igual(r.cuerpo?.mensaje, "Listo.", "mensaje");
});
await prueba("enviado demasiado rápido o sin tiempo → 429 con error real (no falso éxito)", async () => {
  for (const tiempo of [0, 400, 1499, undefined, "5000", null]) {
    const r = await enviar({ cuerpo: valido({ tiempo }) });
    igual(r.estado, 429, `tiempo=${JSON.stringify(tiempo)}`);
    igual(r.cuerpo?.ok, false, "ok");
    afirmar(r.headers.get("retry-after"), "falta Retry-After");
  }
});
await prueba("ninguna de las anteriores llegó a Resend", () => igual(cuantosLlegaron(), antes, "peticiones recibidas por el simulador"));

// =====================================================================
grupo("2. Validación en el servidor (sin tocar Resend)");
const antes2 = cuantosLlegaron();

await prueba("sin consentimiento → 400 con error en ese campo (false, ausente, «true», «on», 1)", async () => {
  for (const consentimiento of [false, undefined, "true", "on", 1, null]) {
    const r = await enviar({ cuerpo: valido({ consentimiento }) });
    igual(r.estado, 400, `consentimiento=${JSON.stringify(consentimiento)}`);
    afirmar(r.cuerpo?.errores?.consentimiento, "falta el error de consentimiento");
  }
});
await prueba("correos inválidos → 400 con error en «correo»", async () => {
  const malos = ["", " ", "a", "a@b", "a@b.c", "a b@c.com", "a@@b.com", "<x>@b.com", "a@b.com\nBcc: otro@x.com", ".a@b.com", "a.@b.com", "a..b@b.com", "a@-b.com", "a@b..com", '"a"@b.com', "a,b@c.com", `${"x".repeat(250)}@b.com`, 12345, null, {}, ["a@b.com"]];
  for (const correo of malos) {
    const r = await enviar({ cuerpo: valido({ correo }) });
    igual(r.estado, 400, `correo=${JSON.stringify(correo)?.slice(0, 40)}`);
    afirmar(r.cuerpo?.errores?.correo, `sin error de correo para ${JSON.stringify(correo)?.slice(0, 40)}`);
  }
});
await prueba("empresa de más de 120 caracteres → 400 con error en «empresa»", async () => {
  const r = await enviar({ cuerpo: valido({ empresa: "E".repeat(121) }) });
  igual(r.estado, 400, "estado");
  afirmar(r.cuerpo?.errores?.empresa, "falta el error de empresa");
});
await prueba("varios errores a la vez se devuelven todos", async () => {
  const r = await enviar({ cuerpo: { correo: "mal", empresa: "E".repeat(200), consentimiento: false, tiempo: 5000 } });
  igual(r.estado, 400, "estado");
  afirmar(r.cuerpo.errores.correo && r.cuerpo.errores.empresa && r.cuerpo.errores.consentimiento, "faltan errores");
});
await prueba("ninguna solicitud inválida llegó a Resend", () => igual(cuantosLlegaron(), antes2, "peticiones recibidas por el simulador"));

// =====================================================================
grupo("3. Envío real al (falso) Resend: qué se manda y cómo se responde");

await prueba("éxito: 200, y Resend recibe exactamente un aviso bien formado", async () => {
  modo = "ok";
  const antes = cuantosLlegaron();
  const r = await enviar({ cuerpo: valido() });
  igual(r.estado, 200, "estado");
  igual(r.cuerpo?.ok, true, "ok");
  igual(cuantosLlegaron(), antes + 1, "avisos enviados");
  const { metodo, ruta, autorizacion, cuerpo } = recibidos.at(-1);
  igual(metodo, "POST", "método");
  igual(ruta, "/emails", "ruta");
  igual(autorizacion, `Bearer ${CLAVE_PRUEBA}`, "autenticación");
  igual(cuerpo.to?.length, 1, "destinatarios");
  igual(cuerpo.to[0], "dylan_cal@outlook.com", "destino");
  igual(cuerpo.reply_to, "ventas.lima+jabas@empresa.com.pe", "reply_to");
  afirmar(/onboarding@resend\.dev/.test(cuerpo.from), `remitente: ${cuerpo.from}`);
  igual(cuerpo.subject, "Nuevo contacto comercial: Distribuidora Andina S.A.C.", "asunto");
});
await prueba("el aviso lleva correo, empresa, fecha de Lima y la constancia literal del consentimiento", () => {
  const { text } = recibidos.at(-1).cuerpo;
  for (const trozo of ["Correo: ventas.lima+jabas@empresa.com.pe", "Empresa: Distribuidora Andina S.A.C.", "Fecha y hora (Lima):", "Versión del texto: 2026-10-v1", "Acepto que PLASTINORTE use mi correo electrónico", "información comercial sobre su catálogo, nuevos productos y novedades"]) {
    afirmar(text.includes(trozo), `falta en el aviso: «${trozo}»`);
  }
  afirmar(!/\bip\b|dirección ip|198\.51\./i.test(text), "el aviso no debe incluir la IP");
});
await prueba("empresa vacía: se envía igual, con asunto genérico y «(no indicada)»", async () => {
  const r = await enviar({ cuerpo: valido({ empresa: "   " }) });
  igual(r.estado, 200, "estado");
  const { cuerpo } = recibidos.at(-1);
  igual(cuerpo.subject, "Nuevo contacto comercial desde la web", "asunto");
  afirmar(cuerpo.text.includes("Empresa: (no indicada)"), "falta «(no indicada)»");
});
await prueba("empresa con saltos de línea y caracteres de control: el asunto queda en una sola línea", async () => {
  const r = await enviar({ cuerpo: valido({ empresa: "Mi\r\nBcc: otro@x.com\t  Empresa\u0000" }) });
  igual(r.estado, 200, "estado");
  const { subject } = recibidos.at(-1).cuerpo;
  afirmar(!/[\r\n\u0000]/.test(subject), `asunto con saltos: ${JSON.stringify(subject)}`);
});
await prueba("el correo se normaliza (minúsculas, sin espacios) antes de enviarse", async () => {
  await enviar({ cuerpo: valido({ correo: "  Compras@EMPRESA.com  " }) });
  igual(recibidos.at(-1).cuerpo.reply_to, "compras@empresa.com", "reply_to");
});

const casos = [
  ["clave-invalida", 502, "Resend rechaza la clave (401) → 502 con mensaje al visitante, sin filtrar el motivo"],
  ["solo-pruebas", 502, "remitente de pruebas hacia otra dirección (403) → 502"],
  ["rechazado", 502, "Resend rechaza los datos (422) → 502"],
  ["sin-id", 502, "Resend responde 200 pero sin identificador → NO se da por enviado: 502"],
  ["html", 503, "Resend devuelve basura HTML con 502 → 503 «reintentar»"],
  ["limite", 503, "Resend limita (429) → 503 «reintentar» con Retry-After"],
  ["caido", 503, "Resend caído (500) → 503 «reintentar»"],
];
for (const [simulado, esperado, nombre] of casos) {
  await prueba(nombre, async () => {
    modo = simulado;
    const r = await enviar({ cuerpo: valido() });
    igual(r.estado, esperado, "estado");
    igual(r.cuerpo?.ok, false, "ok debe ser false: no se presenta como éxito");
    afirmar(!/resend|api_key|401|403|422|invalid/i.test(r.cuerpo?.mensaje ?? ""), `el mensaje revela detalles internos: ${r.cuerpo?.mensaje}`);
    if (esperado === 503) afirmar(r.headers.get("retry-after"), "falta Retry-After");
  });
}
await prueba("Resend no responde en 8 s → 503 «reintentar» (no se queda colgado)", async () => {
  modo = "lento";
  const inicio = Date.now();
  const r = await enviar({ cuerpo: valido() });
  const duracion = Date.now() - inicio;
  igual(r.estado, 503, "estado");
  afirmar(duracion >= 7500 && duracion < 9400, `tardó ${duracion} ms; se esperaba ≈8000`);
});
modo = "ok";

// =====================================================================
grupo("4. Límite de intentos");

await prueba("la 6.ª solicitud válida de la misma IP en una hora → 429, y Resend solo vio 5", async () => {
  const ip = ipNueva();
  const antes = cuantosLlegaron();
  const estados = [];
  for (let i = 0; i < 6; i++) estados.push((await enviar({ cuerpo: valido(), ip })).estado);
  igual(estados.join(","), "200,200,200,200,200,429", "secuencia de estados");
  igual(cuantosLlegaron() - antes, 5, "avisos que llegaron a Resend");
});
await prueba("otra IP no se ve afectada por ese bloqueo", async () => igual((await enviar({ cuerpo: valido() })).estado, 200, "estado"));
await prueba("una IP insistente (60 intentos) no agota el cupo global: otra persona sigue pudiendo enviar", async () => {
  const ip = ipNueva();
  const antes = cuantosLlegaron();
  for (let i = 0; i < 60; i++) await enviar({ cuerpo: valido(), ip });
  igual(cuantosLlegaron() - antes, 5, "avisos que llegaron a Resend desde esa IP");
  igual((await enviar({ cuerpo: valido() })).estado, 200, "estado de otra persona");
});
await prueba("los intentos con datos inválidos no gastan el cupo de la IP", async () => {
  const ip = ipNueva();
  for (let i = 0; i < 8; i++) igual((await enviar({ cuerpo: valido({ correo: "mal" }), ip })).estado, 400, `intento ${i}`);
  igual((await enviar({ cuerpo: valido(), ip })).estado, 200, "el envío válido posterior");
});

// =====================================================================
grupo("5. La página y lo que se entrega al navegador");

const html = await (await fetch(`${BASE}/`)).text();
const privacidad = await (await fetch(`${BASE}/privacidad`)).text();

await prueba("la portada tiene la sección con el título y la descripción pedidos", () => {
  afirmar(/id="novedades"/.test(html), "falta id=novedades");
  afirmar(html.includes("Conoce nuestras novedades y productos"), "falta el título");
  afirmar(html.includes("Déjanos tu correo y recibe información sobre nuestras soluciones industriales."), "falta la descripción");
});
await prueba("el formulario: correo obligatorio, empresa opcional, casilla SIN marcar, etiquetas visibles y enlace a /privacidad", () => {
  const form = html.match(/<form[^>]*aria-label="Recibir novedades y productos"[\s\S]*?<\/form>/)?.[0];
  afirmar(form, "no se encontró el formulario");
  afirmar(/for="novedades-correo"/.test(form) && /id="novedades-correo"/.test(form), "correo sin label");
  afirmar(/for="novedades-empresa"/.test(form) && /id="novedades-empresa"/.test(form), "empresa sin label");
  afirmar(/for="novedades-consentimiento"/.test(form) && /id="novedades-consentimiento"/.test(form), "casilla sin label");
  const casilla = form.match(/<input[^>]*name="consentimiento"[^>]*>/)[0];
  afirmar(/type="checkbox"/.test(casilla), "la casilla no es checkbox");
  afirmar(!/\bchecked\b/.test(casilla) && !/defaultChecked/.test(casilla), "¡la casilla viene premarcada!");
  afirmar(/aria-required="true"/.test(form.match(/<input[^>]*name="correo"[^>]*>/)[0]), "correo sin aria-required");
  afirmar(/novalidate/i.test(form), "falta noValidate (la validación debe ser la propia)");
  afirmar(form.includes("obligatorio") && form.includes("opcional"), "no se indica qué es obligatorio/opcional");
  afirmar(form.includes('href="/privacidad"'), "sin enlace a la política");
  afirmar(form.includes("información comercial sobre su catálogo, nuevos productos y novedades"), "la finalidad comercial no está en la casilla");
});
await prueba("el campo trampa está fuera del teclado y de los lectores de pantalla", () => {
  const trampa = html.match(/<div[^>]*aria-hidden="true"[^>]*>\s*<label>[\s\S]*?url_confirmacion[\s\S]*?<\/div>/)?.[0];
  afirmar(trampa, "no se encontró la trampa");
  afirmar(/tabindex="-1"/i.test(trampa) && /autoComplete="off"|autocomplete="off"/i.test(trampa), "la trampa es alcanzable con teclado o autocompletable");
});
await prueba("ni la clave de Resend ni el nombre de sus variables aparecen en el HTML entregado", () => {
  afirmar(!html.includes(CLAVE_PRUEBA) && !privacidad.includes(CLAVE_PRUEBA), "aparece la clave");
  afirmar(!/ERIZOPLAST_RESEND/.test(html), "aparece el nombre de la variable");
});
await prueba("/privacidad: explica datos, finalidad comercial, baja, derechos y avisa que es borrador, sin indexar", () => {
  const texto = privacidad.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
  for (const trozo of ["Qué datos recopilamos", "Finalidad comercial", "Cómo dejar de recibir comunicaciones", "Ley N.° 29733", "Resend", "Borrador pendiente de revisión legal", "Por completar"]) {
    afirmar(texto.includes(trozo), `falta «${trozo}»`);
  }
  afirmar(/<meta[^>]*name="robots"[^>]*content="noindex/.test(privacidad), "la política no está marcada noindex");
});

// =====================================================================
// 6. Interfaz en un navegador real (solo con --ui; necesita Chrome o Edge: ver scripts/lib/chrome.mjs)
if (process.argv.includes("--ui")) {
  grupo("6. Interfaz en un navegador real: validación, carga, éxito y error (pantalla de 390 px)");
  const { abrirNavegador } = await import("./lib/chrome.mjs");
  const nav = await abrirNavegador();
  const { cdp, evaluar, esperar: pausa } = nav;
  const llegaronAntes = cuantosLlegaron();
  await cdp("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  const iniciar = async () => {
    await cdp("Page.navigate", { url: `${BASE}/` });
    await pausa(3000);
    await evaluar("document.getElementById('novedades-correo').scrollIntoView()");
    await pausa(1700); // el servidor descarta envíos hechos antes de 1,5 s desde que se muestra el formulario
  };
  const escribir = (id, valor) =>
    evaluar(`(() => { const el = document.getElementById('${id}'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(el, ${JSON.stringify(valor)}); el.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  const marcar = () => evaluar("document.getElementById('novedades-consentimiento').click()");
  const enviarForm = () => evaluar("document.querySelector('form[aria-label=\"Recibir novedades y productos\"] button[type=submit]').click()");
  const leer = async () =>
    JSON.parse(
      await evaluar(`JSON.stringify((() => {
        const f = document.querySelector('form[aria-label="Recibir novedades y productos"]'); const b = f && f.querySelector('button[type=submit]'); const q = (s) => document.querySelector(s);
        return { hayForm: !!f, boton: b && b.textContent.trim(), ariaDisabled: b && b.getAttribute('aria-disabled'), busy: f && f.getAttribute('aria-busy'), spinner: !!(b && b.querySelector('svg.animate-spin')),
          anuncio: f && f.querySelector('p.sr-only') && f.querySelector('p.sr-only').textContent, foco: document.activeElement && document.activeElement.id,
          errCorreo: q('#novedades-correo-error') && q('#novedades-correo-error').textContent, errConsent: q('#novedades-consentimiento-error') && q('#novedades-consentimiento-error').textContent,
          invalidoCorreo: q('#novedades-correo') && q('#novedades-correo').getAttribute('aria-invalid'), describe: q('#novedades-correo') && q('#novedades-correo').getAttribute('aria-describedby'),
          alerta: q('#novedades [role=alert]') && q('#novedades [role=alert]').textContent, exito: q('#novedades [role=status]') && q('#novedades [role=status]').textContent,
          focoEnExito: document.activeElement === q('#novedades [role=status]'), correo: q('#novedades-correo') && q('#novedades-correo').value, casilla: q('#novedades-consentimiento') && q('#novedades-consentimiento').checked };
      })())`),
    );

  await iniciar();
  await enviarForm();
  await pausa(300);
  let e = await leer();
  await prueba("enviar vacío: errores en correo y consentimiento, foco al correo, aria-invalid y aria-describedby, sin petición", () => {
    igual(e.foco, "novedades-correo", "foco");
    afirmar(e.errCorreo && e.errConsent, "faltan mensajes de error");
    igual(e.invalidoCorreo, "true", "aria-invalid");
    igual(e.describe, "novedades-correo-error", "aria-describedby");
    igual(cuantosLlegaron(), llegaronAntes, "peticiones a Resend pese a los errores");
  });
  await escribir("novedades-correo", "ventas@empresa");
  await enviarForm();
  await pausa(300);
  e = await leer();
  await prueba("correo incompleto: mensaje de formato en español", () => afirmar(/forma nombre@empresa\.com/.test(e.errCorreo ?? ""), `mensaje: ${e.errCorreo}`));

  modo = "ok-lento";
  await escribir("novedades-correo", "compras@logistica-sur.pe");
  await escribir("novedades-empresa", "Logística Sur S.A.C.");
  await marcar();
  await enviarForm();
  await pausa(500);
  e = await leer();
  await prueba("durante el envío: botón «Enviando…», spinner, aria-busy, aria-disabled y anuncio para lectores de pantalla", () => {
    igual(e.boton, "Enviando…", "texto del botón");
    afirmar(e.spinner, "sin spinner");
    igual(e.busy, "true", "aria-busy");
    igual(e.ariaDisabled, "true", "aria-disabled");
    afirmar(/Enviando/.test(e.anuncio ?? ""), "sin anuncio");
  });
  await pausa(2200);
  e = await leer();
  await prueba("éxito: el formulario se reemplaza por la confirmación y el foco pasa a ella", () => {
    afirmar(!e.hayForm, "el formulario sigue visible");
    afirmar(/Recibimos tu solicitud/.test(e.exito ?? ""), `confirmación: ${e.exito}`);
    afirmar(e.focoEnExito, "el foco no está en la confirmación");
  });
  await prueba("Resend recibió exactamente ese contacto, con la constancia del consentimiento", () => {
    const { cuerpo } = recibidos.at(-1);
    igual(cuerpo.reply_to, "compras@logistica-sur.pe", "reply_to");
    afirmar(cuerpo.text.includes("Empresa: Logística Sur S.A.C.") && cuerpo.text.includes("Versión del texto: 2026-10-v1"), "aviso incompleto");
  });

  modo = "caido";
  await iniciar();
  await escribir("novedades-correo", "prueba@empresa.com.pe");
  await marcar();
  await enviarForm();
  await pausa(1200);
  e = await leer();
  await prueba("con Resend caído: alerta visible, lo escrito se conserva, el botón vuelve a estar activo y NO se muestra éxito", () => {
    afirmar(/No pudimos enviar tus datos ahora/.test(e.alerta ?? ""), `alerta: ${e.alerta}`);
    igual(e.correo, "prueba@empresa.com.pe", "correo conservado");
    afirmar(e.casilla === true, "la casilla se desmarcó");
    igual(e.ariaDisabled, "false", "botón sigue bloqueado");
    afirmar(!e.exito, "se mostró éxito");
  });
  modo = "ok";
  nav.cerrar();
}

console.log(fallos ? `\n${fallos} comprobación(es) fallaron.` : "\nTodo en orden.");
await salir(fallos ? 1 : 0);
