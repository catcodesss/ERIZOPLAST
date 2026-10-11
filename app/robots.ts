import type { MetadataRoute } from "next";
import { urlSitio } from "@/lib/sitio";

// /api/ no tiene nada que indexar; /sistema-diseno es una guía interna que ni siquiera responde en producción.
// /privacidad y /creditos llevan su propio noindex mientras sean borrador.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/sistema-diseno"] }],
    sitemap: `${urlSitio()}/sitemap.xml`,
  };
}
