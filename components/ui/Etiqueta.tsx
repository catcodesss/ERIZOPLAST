import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  tono?: "neutro" | "petroleo" | "naranja" | "oscuro";
  children: ReactNode;
  className?: string;
};

const tonos = {
  neutro: "bg-concreto-100 text-concreto-700",
  petroleo: "bg-petroleo-100 text-petroleo-800",
  naranja: "bg-naranja-100 text-naranja-800",
  oscuro: "bg-petroleo-950 text-white",
} as const;

export function Etiqueta({ tono = "neutro", children, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pieza px-2.5 py-1 font-mono text-[0.6875rem] font-medium uppercase leading-none tracking-[0.1em]",
        tonos[tono],
        className,
      )}
    >
      {children}
    </span>
  );
}
