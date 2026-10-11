"use client";

import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import Link from "next/link";
import { CircleAlert, CircleCheck, Loader2 } from "lucide-react";
import { TEXTO_CONSENTIMIENTO } from "@/data/consentimiento";
import { MAX_CORREO, MAX_EMPRESA, validarNovedades, type CamposNovedades, type ErroresNovedades } from "@/lib/novedades-validacion";
import { cn } from "@/lib/cn";
import { Boton } from "@/components/ui/Boton";

type Estado = { fase: "reposo" } | { fase: "enviando" } | { fase: "ok"; mensaje: string } | { fase: "error"; mensaje: string };

type RespuestaServidor = { ok?: boolean; mensaje?: string; errores?: ErroresNovedades } | null;

const ORDEN_CAMPOS: CamposNovedades[] = ["correo", "empresa", "consentimiento"];

// Se desactiva la validación nativa del navegador (`noValidate`) para controlar el mensaje, su texto en español
// y el foco: los avisos nativos varían entre navegadores y no se enlazan a cada campo. El servidor repite la
// validación, que es la que cuenta.
//
// Accesibilidad: cada campo tiene <label> visible; los errores se enlazan con aria-describedby y aria-invalid,
// el foco salta al primer campo con error, la espera y el resultado se anuncian en regiones vivas, y mientras
// envía el botón usa aria-disabled (no `disabled`) para no perder el foco del teclado.
export function FormularioNovedades() {
  const [estado, setEstado] = useState<Estado>({ fase: "reposo" });
  const [errores, setErrores] = useState<ErroresNovedades>({});

  const correoRef = useRef<HTMLInputElement>(null);
  const empresaRef = useRef<HTMLInputElement>(null);
  const consentimientoRef = useRef<HTMLInputElement>(null);
  const exitoRef = useRef<HTMLDivElement>(null);
  const campos: Record<CamposNovedades, RefObject<HTMLInputElement | null>> = {
    correo: correoRef,
    empresa: empresaRef,
    consentimiento: consentimientoRef,
  };

  // Instante en que el formulario quedó a la vista: el servidor descarta envíos imposiblemente rápidos.
  const mostradoEn = useRef(0);
  useEffect(() => {
    mostradoEn.current = Date.now();
  }, []);

  function mostrarErrores(nuevos: ErroresNovedades) {
    setErrores(nuevos);
    const primero = ORDEN_CAMPOS.find((campo) => nuevos[campo]);
    if (primero) campos[primero].current?.focus();
  }

  // Quitar el error de un campo en cuanto la persona lo corrige, sin esperar al siguiente envío.
  function limpiarError(campo: CamposNovedades) {
    if (errores[campo]) setErrores((previos) => ({ ...previos, [campo]: undefined }));
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (estado.fase === "enviando") return;

    const datos = new FormData(evento.currentTarget);
    const entrada = {
      correo: datos.get("correo"),
      empresa: datos.get("empresa"),
      consentimiento: datos.get("consentimiento") === "on",
    };

    const validacion = validarNovedades(entrada);
    if (!validacion.ok) {
      setEstado({ fase: "reposo" });
      mostrarErrores(validacion.errores);
      return;
    }

    setErrores({});
    setEstado({ fase: "enviando" });

    try {
      const respuesta = await fetch("/api/novedades", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...entrada,
          url_confirmacion: datos.get("url_confirmacion"),
          tiempo: Date.now() - mostradoEn.current,
        }),
      });
      const cuerpo = (await respuesta.json().catch(() => null)) as RespuestaServidor;

      if (respuesta.ok) {
        setEstado({ fase: "ok", mensaje: cuerpo?.mensaje ?? "Listo. Recibimos tu correo." });
        return;
      }
      if (cuerpo?.errores && Object.values(cuerpo.errores).some(Boolean)) {
        setEstado({ fase: "reposo" });
        mostrarErrores(cuerpo.errores);
        return;
      }
      setEstado({ fase: "error", mensaje: cuerpo?.mensaje ?? "No pudimos enviar tus datos. Prueba de nuevo." });
    } catch {
      setEstado({ fase: "error", mensaje: "Sin conexión. Revisa tu internet e inténtalo de nuevo." });
    }
  }

  // Al mostrar la confirmación, el foco pasa a ella: quien usa lector de pantalla o teclado no se queda en un
  // botón que desapareció.
  useEffect(() => {
    if (estado.fase === "ok") exitoRef.current?.focus();
  }, [estado.fase]);

  function registrarOtro() {
    setEstado({ fase: "reposo" });
    setErrores({});
    mostradoEn.current = Date.now();
  }

  const enviando = estado.fase === "enviando";

  if (estado.fase === "ok") {
    return (
      <div ref={exitoRef} tabIndex={-1} role="status" className="flex flex-col items-start gap-5 outline-offset-8">
        <CircleCheck aria-hidden="true" className="size-9 text-petroleo-600" strokeWidth={1.75} />
        <div>
          <p className="font-display ancho-normal text-xl font-extrabold text-petroleo-800">Recibimos tu solicitud</p>
          <p className="mt-2 text-concreto-700">{estado.mensaje}</p>
        </div>
        <Boton variante="texto" onClick={registrarOtro}>
          Registrar otro correo
        </Boton>
      </div>
    );
  }

  const campo = (invalido: boolean) =>
    cn(
      "min-h-12 w-full rounded-pieza border bg-white px-4 text-[0.9375rem] text-petroleo-950 placeholder:text-concreto-500 focus-visible:border-petroleo-600",
      invalido ? "border-2 border-naranja-700" : "border-concreto-500",
    );
  const etiqueta = "mb-1.5 flex items-baseline justify-between gap-3 text-sm font-medium text-petroleo-900";
  const nota = "font-mono text-[0.6875rem] font-normal uppercase tracking-[0.1em] text-concreto-600";

  return (
    <form onSubmit={enviar} noValidate aria-busy={enviando} aria-label="Recibir novedades y productos" className="relative flex flex-col gap-5">
      <div>
        <label htmlFor="novedades-correo" className={etiqueta}>
          Correo electrónico <span className={nota}>obligatorio</span>
        </label>
        <input
          ref={correoRef}
          id="novedades-correo"
          name="correo"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={MAX_CORREO}
          placeholder="nombre@empresa.com"
          aria-required="true"
          aria-invalid={errores.correo ? true : undefined}
          aria-describedby={errores.correo ? "novedades-correo-error" : undefined}
          onChange={() => limpiarError("correo")}
          className={campo(Boolean(errores.correo))}
        />
        <MensajeError id="novedades-correo-error" texto={errores.correo} />
      </div>

      <div>
        <label htmlFor="novedades-empresa" className={etiqueta}>
          Nombre de tu empresa <span className={nota}>opcional</span>
        </label>
        <input
          ref={empresaRef}
          id="novedades-empresa"
          name="empresa"
          type="text"
          autoComplete="organization"
          maxLength={MAX_EMPRESA}
          aria-invalid={errores.empresa ? true : undefined}
          aria-describedby={errores.empresa ? "novedades-empresa-error" : undefined}
          onChange={() => limpiarError("empresa")}
          className={campo(Boolean(errores.empresa))}
        />
        <MensajeError id="novedades-empresa-error" texto={errores.empresa} />
      </div>

      {/* Trampa para bots: una persona no la ve ni llega a ella con el teclado. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden">
        <label>
          Dejar este campo vacío
          <input name="url_confirmacion" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <div className="flex items-start gap-3">
          <input
            ref={consentimientoRef}
            id="novedades-consentimiento"
            name="consentimiento"
            type="checkbox"
            aria-required="true"
            aria-invalid={errores.consentimiento ? true : undefined}
            aria-describedby={cn("novedades-consentimiento-ayuda", errores.consentimiento && "novedades-consentimiento-error")}
            onChange={() => limpiarError("consentimiento")}
            className="mt-0.5 size-5 shrink-0 cursor-pointer accent-petroleo-700"
          />
          <label htmlFor="novedades-consentimiento" className="cursor-pointer text-sm leading-relaxed text-petroleo-900">
            {TEXTO_CONSENTIMIENTO}
          </label>
        </div>
        <p id="novedades-consentimiento-ayuda" className="mt-2 pl-8 text-sm text-concreto-700">
          Cómo tratamos tus datos y cómo darte de baja, en nuestra{" "}
          <Link href="/privacidad" className="font-medium text-petroleo-700 underline underline-offset-4 hover:text-naranja-700">
            política de privacidad
          </Link>
          .
        </p>
        <div className="pl-8">
          <MensajeError id="novedades-consentimiento-error" texto={errores.consentimiento} />
        </div>
      </div>

      {estado.fase === "error" && (
        <div role="alert" className="flex items-start gap-3 rounded-pieza border border-naranja-700 bg-naranja-50 p-4 text-sm text-naranja-900">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p>{estado.mensaje}</p>
        </div>
      )}

      <div>
        <Boton
          type="submit"
          tamano="lg"
          bloque
          aria-disabled={enviando}
          flecha={!enviando}
          icono={enviando ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : undefined}
          className="aria-disabled:pointer-events-none aria-disabled:opacity-60 sm:w-auto"
        >
          {enviando ? "Enviando…" : "Quiero recibir novedades"}
        </Boton>
        {/* Región viva siempre presente: los lectores de pantalla anuncian los cambios de su texto. */}
        <p role="status" aria-live="polite" className="sr-only">
          {enviando ? "Enviando tus datos…" : ""}
        </p>
      </div>
    </form>
  );
}

function MensajeError({ id, texto }: { id: string; texto?: string }) {
  if (!texto) return null;
  return (
    <p id={id} className="mt-2 flex items-start gap-2 text-sm font-medium text-naranja-800">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {texto}
    </p>
  );
}
