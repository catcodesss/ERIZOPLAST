import { PackageSearch } from "lucide-react";
import { CATEGORIAS, type IdCategoria } from "@/data/categorias";
import { hayPreciosPublicados, modeloPendiente, productosPublicados } from "@/lib/productos";
import { AvisoModeloReferencial } from "@/components/catalogo/AvisoModeloReferencial";
import { CatalogoInteractivo } from "@/components/catalogo/CatalogoInteractivo";
import { BotonCotizar } from "@/components/ui/BotonCotizar";
import { Contenedor } from "@/components/ui/Contenedor";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { Seccion } from "@/components/ui/Seccion";
import { Tarjeta } from "@/components/ui/Tarjeta";

// Cuerpo común de /catalogo y de /catalogo/categoria/<id>. Cada categoría es una página estática propia (no un
// filtro de JavaScript sobre la misma): así tiene su título y descripción para los buscadores, el HTML ya trae
// solo sus productos y cambiar de categoría no provoca saltos de diseño.
export function PaginaCatalogo({ categoria }: { categoria?: IdCategoria }) {
  const todos = productosPublicados();
  const actual = CATEGORIAS.find((c) => c.id === categoria);
  const productos = actual ? todos.filter((p) => p.categorias.includes(actual.id)) : todos;

  return (
    <>
      <Seccion fondo="petroleo" espaciado="compacto" textura>
        <Contenedor>
          <EncabezadoSeccion
            nivel="h1"
            tamano="xl"
            sobretitulo="Catálogo"
            titulo={actual ? actual.titulo : "Jabas plásticas industriales"}
            descripcion={
              actual
                ? `${actual.descripcion} Medidas, capacidad y material de cada jaba, para que compares con claridad antes de cotizar.`
                : "Medidas, capacidad y material de cada jaba, para que compares con claridad antes de cotizar."
            }
          />
        </Contenedor>
      </Seccion>

      <Seccion fondo="blanco" espaciado="compacto">
        <Contenedor>
          {todos.length > 0 ? (
            <>
              {productos.some(modeloPendiente) && <AvisoModeloReferencial alcance="catalogo" className="mb-8" />}
              <CatalogoInteractivo productos={productos} todos={todos} categoria={actual?.id} />
            </>
          ) : (
            <Tarjeta variante="plana" className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-6 py-14 text-center sm:px-12">
              <PackageSearch aria-hidden="true" className="size-12 text-petroleo-500" strokeWidth={1.25} />
              <h2 className="font-display ancho-normal text-display-md font-extrabold text-petroleo-800">Estamos preparando el catálogo</h2>
              <p className="text-pretty text-concreto-700">
                Publicaremos cada jaba con sus medidas reales y fotos propias. Mientras tanto, cuéntanos qué necesitas y te
                cotizamos por WhatsApp.
              </p>
              <BotonCotizar tamano="lg" />
            </Tarjeta>
          )}

          <p className="mt-10 max-w-3xl text-sm leading-relaxed text-concreto-600">
            {hayPreciosPublicados(todos) && "Precios referenciales por unidad, en soles, sujetos a confirmación comercial. "}
            Las medidas son nominales y las confirmamos al cotizar. Las fotografías son referenciales hasta contar con fotos
            propias de cada modelo.
          </p>
        </Contenedor>
      </Seccion>
    </>
  );
}
