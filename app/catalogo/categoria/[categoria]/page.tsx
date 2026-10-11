import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIAS } from "@/data/categorias";
import { esCategoria, productosPublicados } from "@/lib/productos";
import { PaginaCatalogo } from "@/components/catalogo/PaginaCatalogo";

type Props = { params: Promise<{ categoria: string }> };

// Una página estática por categoría, incluso la que aún no tiene modelos: sigue en la barra de categorías y su
// página explica que no hay modelo publicado (más honesto que esconderla). Esa página vacía no se indexa.
export function generateStaticParams() {
  return CATEGORIAS.map((c) => ({ categoria: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const actual = CATEGORIAS.find((c) => c.id === categoria);
  if (!actual) return {};
  const hayModelos = productosPublicados().some((p) => p.categorias.includes(actual.id));
  return {
    title: actual.titulo,
    description: `${actual.descripcion} Medidas y material de cada modelo. Venta de jabas plásticas en Lima y todo el Perú; cotiza por WhatsApp.`,
    robots: hayModelos ? undefined : { index: false, follow: true },
  };
}

export default async function CategoriaCatalogo({ params }: Props) {
  const { categoria } = await params;
  if (!esCategoria(categoria)) notFound();
  return <PaginaCatalogo categoria={categoria} />;
}
