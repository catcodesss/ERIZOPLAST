// Utilidad común de los medidores de navegador (rendimiento, responsive, menú móvil): arranca un Chrome o Edge
// sin ventana y lo maneja por el protocolo de depuración (CDP), sin instalar nada. Node 24 trae WebSocket.
//
// El navegador se busca en las rutas habituales; si el tuyo está en otra, indica CHROME_PATH:
//   PowerShell:  $env:CHROME_PATH = "C:\ruta\chrome.exe"
// Si hay un antivirus que inyecta scripts en las páginas (Kaspersky lo hace) y falsea las medidas, indica
//   BLOQUEAR_HOSTS="*kaspersky-labs.com*"   (varios, separados por comas)

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as esperar } from "node:timers/promises";

const CANDIDATOS = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

export async function abrirNavegador() {
  const exe = CANDIDATOS.find((c) => existsSync(c));
  if (!exe) throw new Error("No encuentro Chrome ni Edge. Indica su ruta con la variable CHROME_PATH.");
  const puerto = 9300 + Math.floor(Math.random() * 600);
  const perfil = mkdtempSync(path.join(tmpdir(), "erizoplast-nav-"));
  const proceso = spawn(exe, ["--headless=new", "--disable-gpu", `--remote-debugging-port=${puerto}`, `--user-data-dir=${perfil}`, "--no-first-run", "--mute-audio", "about:blank"], { stdio: "ignore" });

  let wsUrl;
  for (let i = 0; i < 60 && !wsUrl; i++) {
    try {
      wsUrl = (await (await fetch(`http://127.0.0.1:${puerto}/json/new?about:blank`, { method: "PUT" })).json()).webSocketDebuggerUrl;
    } catch {
      await esperar(250);
    }
  }
  if (!wsUrl) {
    proceso.kill();
    throw new Error("El navegador no arrancó.");
  }

  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pendientes = new Map();
  const eventos = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && pendientes.has(d.id)) {
      pendientes.get(d.id)(d);
      pendientes.delete(d.id);
    } else if (d.method) eventos.push(d);
  };
  await new Promise((r) => (ws.onopen = r));

  const cdp = (method, params = {}) =>
    new Promise((res) => {
      const i = ++id;
      pendientes.set(i, res);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  const evaluar = async (expresion) => (await cdp("Runtime.evaluate", { expression: expresion, returnByValue: true, awaitPromise: true })).result.result.value;

  await cdp("Page.enable");
  await cdp("Runtime.enable");
  await cdp("Network.enable");
  const bloqueados = (process.env.BLOQUEAR_HOSTS ?? "").split(",").map((h) => h.trim()).filter(Boolean);
  if (bloqueados.length) await cdp("Network.setBlockedURLs", { urls: bloqueados });

  const cerrar = () => {
    try {
      ws.close();
      proceso.kill();
      rmSync(perfil, { recursive: true, force: true });
    } catch {}
  };
  process.on("exit", cerrar);
  return { cdp, evaluar, eventos, cerrar, esperar };
}
