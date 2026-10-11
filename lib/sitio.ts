import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

// URL pública del sitio, de donde salen las canónicas, el sitemap, robots.txt y Open Graph.
// Orden: la variable que fija la empresa (su dominio) → el dominio de producción que Vercel asigna al
// proyecto (así funciona desde el primer despliegue, antes de comprar dominio) → localhost en desarrollo.
// Sin barra final.

// Una compilación de producción con canónicas apuntando a localhost es un error silencioso que los buscadores
// castigan, así que se avisa. El build corre en varios procesos y cada uno ejecutaría el aviso: una marca en
// `.next/` (que cada build limpia) hace que salga una sola vez.
function avisarUnaVez() {
  try {
    const carpeta = path.join(process.cwd(), ".next");
    mkdirSync(carpeta, { recursive: true });
    writeFileSync(path.join(carpeta, "aviso-url-sitio.marca"), "", { flag: "wx" });
  } catch {
    return; // ya existía la marca (otro proceso avisó) o no se pudo escribir: no repetir ni fallar
  }
  console.warn("[sitio] NEXT_PUBLIC_SITE_URL no está definida: las canónicas, el sitemap y Open Graph apuntarán a localhost. Ver DESPLIEGUE.md.");
}

export function urlSitio(): string {
  const configurada = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configurada) return configurada.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;

  if (process.env.NODE_ENV === "production") avisarUnaVez();
  return "http://localhost:3000";
}
