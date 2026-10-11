import type { Metadata } from "next";
import { empresa } from "@/data/empresa";
import { Cierre } from "@/components/inicio/Cierre";
import { Hero } from "@/components/inicio/Hero";
import { LineasDestacadas } from "@/components/inicio/LineasDestacadas";
import { Logistica } from "@/components/inicio/Logistica";
import { Novedades } from "@/components/inicio/Novedades";
import { Sobre } from "@/components/inicio/Sobre";
import { Ventajas } from "@/components/inicio/Ventajas";
import { DatosEstructurados } from "@/components/seo/DatosEstructurados";
import { urlSitio } from "@/lib/sitio";

// FASE 3: portada completa. Seis secciones, cada una con su propia composición:
// portada fotográfica · panel horizontal de ventajas · mosaico de líneas · imagen y texto asimétricos ·
// bloque oscuro de fabricación y transporte · cierre de conversión. La Fase 7 añade una séptima sección,
// «Novedades», con el formulario de captación de correos (va tras el cierre, antes del pie).
// Todas las fotos son referenciales (data/fotos.ts) y van rotuladas como tales.

// SEO de la portada: las frases que busca un comprador («jabas plásticas al por mayor», «en Lima», «fábrica»,
// «Perú», «Lima Norte») aparecen una vez y de forma natural en el título y la descripción, no repetidas.
// `absolute` evita que la plantilla «%s · PLASTINORTE» le añada el nombre otra vez.
export const metadata: Metadata = {
  title: { absolute: "Jabas plásticas al por mayor en Lima | Fábrica PLASTINORTE" },
  description:
    "Fábrica de jabas plásticas industriales en Lima Norte: venta al por mayor en Lima y todo el Perú, con transporte propio. Cotiza por WhatsApp.",
};

export default function Inicio() {
  return (
    <>
      <DatosEstructurados
        datos={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: empresa.nombre,
          url: urlSitio(),
          description: empresa.descripcion,
          email: empresa.correo,
          // Solo la zona que la empresa ya publica; sin calle ni teléfono (no se publican).
          address: { "@type": "PostalAddress", addressLocality: "Lima Norte", addressRegion: "Lima", addressCountry: "PE" },
          areaServed: { "@type": "Country", name: "Perú" },
        }}
      />
      <Hero />
      <Ventajas />
      <LineasDestacadas />
      <Sobre />
      <Logistica />
      <Cierre />
      <Novedades />
    </>
  );
}
