import { ImageResponse } from "next/og";
import { empresa } from "@/data/empresa";

// Imagen que se ve al compartir el enlace (WhatsApp, LinkedIn, Facebook…). Es una tarjeta de marca, sin
// fotografías a propósito: las fotos del sitio son referenciales y, fuera de la página, perderían su rótulo
// «Imagen referencial» y parecerían de PLASTINORTE.
export const alt = `${empresa.nombre} · ${empresa.lema}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ImagenOpenGraph() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0f2c38",
          padding: "72px 80px",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 22, height: 22, background: "#ee6a14", transform: "rotate(45deg)" }} />
          <div style={{ fontSize: 30, letterSpacing: 6, color: "#fb8335", textTransform: "uppercase" }}>Lima Norte · Perú</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", fontSize: 124, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>
            <span>PLASTI</span>
            <span style={{ color: "#fb8335" }}>NORTE</span>
          </div>
          <div style={{ fontSize: 44, lineHeight: 1.2, color: "#d5e8ed", maxWidth: 940 }}>{empresa.lema}</div>
        </div>

        <div style={{ display: "flex", height: 10, width: 220, background: "#ee6a14" }} />
      </div>
    ),
    size,
  );
}
