import type { MetadataRoute } from "next";
import { CATEGORIAS } from "@/data/categorias";
import { productosPublicados } from "@/lib/productos";
import { urlSitio } from "@/lib/sitio";

// Solo páginas públicas e indexables. /privacidad y /creditos quedan fuera mientras sean borrador (noindex).
// Sin `lastModified`: no hay una fecha real de cambio por página y una inventada (la del build) engaña a los
// buscadores; es un campo opcional.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = urlSitio();
  const publicados = productosPublicados();
  // Solo las categorías con modelos: la página de una categoría vacía va con noindex.
  const categorias = CATEGORIAS.filter((c) => publicados.some((p) => p.categorias.includes(c.id)));
  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/catalogo`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/contacto`, changeFrequency: "yearly", priority: 0.5 },
    ...categorias.map((c) => ({
      url: `${base}/catalogo/categoria/${c.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...publicados.map((p) => ({
      url: `${base}/catalogo/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
