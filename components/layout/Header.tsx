"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Mail, MapPin, Menu, X } from "lucide-react";
import { empresa } from "@/data/empresa";
import { navegacion } from "@/data/navegacion";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/marca/Logo";
import { BotonCotizar } from "@/components/ui/BotonCotizar";

export function Header() {
  const [abierto, setAbierto] = useState(false);
  const pathname = usePathname();
  const cabecera = useRef<HTMLElement>(null);

  // Sombra al hacer scroll: se marca el atributo en el DOM (sin estado) para no re-renderizar en cada scroll.
  useEffect(() => {
    const el = cabecera.current;
    if (!el) return;
    const alternar = () => {
      el.dataset.scroll = window.scrollY > 8 ? "si" : "no";
    };
    alternar();
    window.addEventListener("scroll", alternar, { passive: true });
    return () => window.removeEventListener("scroll", alternar);
  }, []);

  // Menú móvil abierto: Escape lo cierra, el scroll del fondo se bloquea y, si la ventana
  // crece a escritorio, se cierra solo para no dejar el bloqueo activo.
  useEffect(() => {
    if (!abierto) return;
    const cerrarConEscape = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    const consulta = window.matchMedia("(min-width: 1024px)");
    const cerrarEnEscritorio = () => consulta.matches && setAbierto(false);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", cerrarConEscape);
    consulta.addEventListener("change", cerrarEnEscritorio);
    return () => {
      document.body.style.overflow = overflowPrevio;
      document.removeEventListener("keydown", cerrarConEscape);
      consulta.removeEventListener("change", cerrarEnEscritorio);
    };
  }, [abierto]);

  return (
    <>
      {/* Franja superior: datos de contacto discretos, solo en escritorio */}
      <div className="hidden bg-petroleo-950 text-petroleo-100 lg:block">
        <div className="mx-auto flex h-9 w-full max-w-[80rem] items-center justify-between px-12 text-xs">
          <p className="flex items-center gap-2">
            <MapPin aria-hidden="true" className="size-3.5 text-naranja-400" />
            {empresa.zona} · {empresa.cobertura.nacional}
          </p>
          <a
            href={`mailto:${empresa.correo}`}
            className="flex items-center gap-2 transition-colors hover:text-white"
          >
            <Mail aria-hidden="true" className="size-3.5 text-naranja-400" />
            {empresa.correo}
          </a>
        </div>
      </div>

      <header
        ref={cabecera}
        data-scroll="no"
        className="sticky top-0 z-50 border-b border-concreto-200 bg-white transition-shadow duration-300 data-[scroll=si]:shadow-pieza"
      >
        <div className="mx-auto flex h-(--spacing-cabecera) w-full max-w-[80rem] items-center justify-between gap-3 px-5 sm:gap-6 sm:px-8 lg:px-12">
          <Link href="/" aria-label="PLASTINORTE, ir al inicio" onClick={() => setAbierto(false)} className="-ml-1 rounded-pieza p-1">
            <Logo />
          </Link>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {navegacion.map((enlace) => {
                const activo = pathname === enlace.href;
                return (
                  <li key={enlace.href}>
                    <Link
                      href={enlace.href}
                      aria-current={activo ? "page" : undefined}
                      className={cn(
                        "group/nav relative inline-block py-2 font-display ancho-normal text-[0.8125rem] font-bold uppercase tracking-[0.08em] transition-colors",
                        activo ? "text-petroleo-800" : "text-concreto-700 hover:text-petroleo-800",
                      )}
                    >
                      {enlace.etiqueta}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute inset-x-0 -bottom-0.5 h-0.5 origin-left bg-naranja-500 transition-transform duration-300 ease-industrial",
                          activo ? "scale-x-100" : "scale-x-0 group-hover/nav:scale-x-100",
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <BotonCotizar tamano="md">Cotizar</BotonCotizar>
            </div>
            <button
              type="button"
              aria-expanded={abierto}
              aria-controls="menu-movil"
              aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setAbierto((v) => !v)}
              className="grid size-11 place-items-center rounded-pieza border-2 border-petroleo-700 text-petroleo-800 transition-colors hover:bg-petroleo-700 hover:text-white lg:hidden"
            >
              {abierto ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Menú móvil: hermano del header (no hijo) para que `fixed` se mida contra la ventana */}
      <div
        id="menu-movil"
        inert={!abierto}
        className={cn(
          "fixed inset-0 z-40 flex flex-col bg-petroleo-950 pt-(--spacing-cabecera) text-white lg:hidden",
          "transition-[opacity,visibility] duration-300 ease-industrial",
          abierto ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <nav aria-label="Principal (móvil)" className="flex flex-1 flex-col justify-center px-5 sm:px-8">
          <ul className="flex flex-col">
            {navegacion.map((enlace, i) => (
              <li key={enlace.href} className="border-b border-white/12 first:border-t">
                <Link
                  href={enlace.href}
                  onClick={() => setAbierto(false)}
                  style={{ transitionDelay: abierto ? `${80 + i * 55}ms` : "0ms" }}
                  className={cn(
                    "flex items-center justify-between py-5 font-display ancho-normal text-display-md font-extrabold uppercase",
                    "transition-[opacity,transform,color] duration-500 ease-industrial hover:text-naranja-400",
                    abierto ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                  )}
                >
                  {enlace.etiqueta}
                  <span aria-hidden="true" className="text-naranja-500">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-4 border-t border-white/12 p-5 sm:p-8">
          <BotonCotizar tamano="lg" bloque>
            Cotizar por WhatsApp
          </BotonCotizar>
          <a href={`mailto:${empresa.correo}`} className="flex items-center justify-center gap-2 py-2 text-sm text-petroleo-100">
            <Mail aria-hidden="true" className="size-4 text-naranja-400" />
            {empresa.correo}
          </a>
        </div>
      </div>
    </>
  );
}
