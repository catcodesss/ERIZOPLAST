import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  ancho?: "normal" | "estrecho" | "completo";
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

const anchos = {
  normal: "max-w-[80rem]",
  estrecho: "max-w-[56rem]",
  completo: "max-w-none",
} as const;

export function Contenedor({ ancho = "normal", as: Etiqueta = "div", className, children }: Props) {
  return <Etiqueta className={cn("mx-auto w-full px-5 sm:px-8 lg:px-12", anchos[ancho], className)}>{children}</Etiqueta>;
}
