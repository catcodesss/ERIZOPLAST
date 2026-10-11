import type { NextConfig } from "next";

// Cabeceras de seguridad para todas las rutas. Sin Content-Security-Policy a propósito: una CSP estricta en
// Next exige nonces por petición y rompería la hidratación si se hace a medias; las defensas de abajo no.
// HSTS no se declara aquí: Vercel ya lo envía en sus dominios y en los dominios propios con HTTPS.
const cabecerasSeguridad = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // No anunciar el framework en cada respuesta.
  poweredByHeader: false,
  images: {
    // AVIF primero (la mitad de peso que JPEG en estas fotos) y WebP de respaldo. 85 solo para la foto de portada;
    // el resto usa 75.
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    // Las fotos no cambian entre despliegues: 31 días en caché. Al sustituir una foto, ponle un nombre de archivo
    // nuevo (o espera a que caduque): ver DESPLIEGUE.md.
    minimumCacheTTL: 2_678_400,
  },
  async headers() {
    return [{ source: "/:path*", headers: cabecerasSeguridad }];
  },
  turbopack: {
    // Hay otro package-lock.json en la carpeta de usuario; sin esto Next toma esa carpeta como raíz.
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
