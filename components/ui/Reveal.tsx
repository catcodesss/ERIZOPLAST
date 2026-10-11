"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  as?: ElementType;
  /** Retraso en ms, para escalonar varios elementos hermanos. */
  retraso?: number;
  className?: string;
  children: ReactNode;
};

// Aparición discreta al entrar en pantalla. Maneja el atributo directamente sobre el DOM
// (sin estado de React) para no provocar renders extra. Lo que ya está a la vista al cargar
// no se oculta ni se anima: solo se revela lo que el usuario aún no ha visto.
export function Reveal({ as: Etiqueta = "div", retraso = 0, className, children }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
      el.dataset.estado = "visible";
      return;
    }

    el.dataset.estado = "oculto";
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          el.dataset.estado = "visible";
          observador.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return (
    <Etiqueta
      ref={ref}
      className={cn("reveal", className)}
      style={retraso ? ({ "--retraso": `${retraso}ms` } as CSSProperties) : undefined}
    >
      {children}
    </Etiqueta>
  );
}
