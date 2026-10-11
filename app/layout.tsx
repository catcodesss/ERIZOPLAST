import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { empresa } from "@/data/empresa";
import { AvisoFase } from "@/components/layout/AvisoFase";
import { BotonFlotante } from "@/components/layout/BotonFlotante";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { urlSitio } from "@/lib/sitio";
import "./globals.css";

// Archivo: titulares y marca. Su eje de ancho (wdth) permite el logotipo expandido.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

// IBM Plex Sans: texto corrido, de aire técnico pero muy legible. Plex Mono: cifras de ficha.
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"], // el 600 solo lo usaba la guía interna (/sistema-diseno), que no existe en producción
  display: "swap",
  // Solo rotula etiquetas y cifras pequeñas: no merece competir con la foto de portada por el ancho de banda inicial.
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(urlSitio()),
  title: {
    default: `${empresa.nombre} · Fábrica de jabas plásticas en Lima Norte`,
    template: `%s · ${empresa.nombre}`,
  },
  description: `${empresa.descripcion} Venta directa de fábrica y envíos a todo el Perú.`,
  applicationName: empresa.nombre,
  // Cada página se declara a sí misma como canónica ("./" se resuelve contra su propia ruta).
  alternates: { canonical: "./" },
  // OJO: un `openGraph` en el metadata de una página REEMPLAZA este objeto entero, no se fusiona.
  openGraph: {
    type: "website",
    locale: "es_PE",
    siteName: empresa.nombre,
  },
  twitter: { card: "summary_large_image" },
  // El teléfono no se publica: que el navegador no convierta números sueltos en enlaces.
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#1c4a5c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-PE" className={`${archivo.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#contenido"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-pieza bg-naranja-500 px-4 py-3 font-bold text-petroleo-950 transition-transform focus:translate-y-0"
        >
          Saltar al contenido
        </a>
        <AvisoFase />
        <Header />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer />
        <BotonFlotante />
      </body>
    </html>
  );
}
