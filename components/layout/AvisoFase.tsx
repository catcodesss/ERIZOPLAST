import Link from "next/link";

// Solo en desarrollo: recuerda en qué fase está el proyecto y lleva a la guía de estilo.
// En producción no renderiza nada, así que no hace falta quitarlo antes de publicar.
export function AvisoFase() {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <div className="bg-naranja-500 px-4 py-1.5 text-center font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-petroleo-950">
      Fase 8 · revisión final ·{" "}
      <Link href="/sistema-diseno" className="font-bold underline underline-offset-2">
        Ver sistema de diseño
      </Link>
    </div>
  );
}
