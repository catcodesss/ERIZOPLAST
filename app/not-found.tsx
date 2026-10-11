import { Boton } from "@/components/ui/Boton";
import { Contenedor } from "@/components/ui/Contenedor";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { Seccion } from "@/components/ui/Seccion";

export default function NoEncontrada() {
  return (
    <Seccion fondo="petroleo-profundo" textura className="grid min-h-[60vh] place-items-center">
      <Contenedor>
        <EncabezadoSeccion
          nivel="h1"
          tamano="xl"
          sobretitulo="Error 404"
          titulo="Esta página no existe"
          descripcion="Puede que el enlace haya cambiado. Vuelve al inicio o revisa el catálogo."
          acciones={
            <>
              <Boton href="/" tamano="lg">
                Ir al inicio
              </Boton>
              <Boton href="/catalogo" variante="contorno-claro" tamano="lg" flecha>
                Ver catálogo
              </Boton>
            </>
          }
        />
      </Contenedor>
    </Seccion>
  );
}
