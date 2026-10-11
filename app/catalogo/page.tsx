import type { Metadata } from "next";
import { PaginaCatalogo } from "@/components/catalogo/PaginaCatalogo";

export const metadata: Metadata = {
  title: "Catálogo de jabas plásticas industriales",
  description:
    "Jabas plásticas industriales, agrícolas y para alimentos, con medidas, capacidad y material de cada modelo. Venta en Lima y todo el Perú; cotiza por WhatsApp.",
};

export default function Catalogo() {
  return <PaginaCatalogo />;
}
