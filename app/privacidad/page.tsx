import type { Metadata } from "next";
import type { ReactNode } from "react";
import { TEXTO_CONSENTIMIENTO, VERSION_CONSENTIMIENTO } from "@/data/consentimiento";
import { empresa } from "@/data/empresa";
import { Contenedor } from "@/components/ui/Contenedor";
import { EncabezadoSeccion } from "@/components/ui/EncabezadoSeccion";
import { Etiqueta } from "@/components/ui/Etiqueta";
import { Seccion } from "@/components/ui/Seccion";

export const metadata: Metadata = {
  title: "Política de privacidad",
  // Fuera de los buscadores hasta que un abogado la revise y se completen los datos marcados.
  robots: { index: false, follow: false },
};

// BORRADOR de la Fase 7. Redactado a partir de lo que el sitio hace de verdad (ver app/api/novedades/route.ts
// y lib/novedades.ts), no de una plantilla. Dos cosas lo mantienen como borrador a propósito:
//  1. Todo dato que PLASTINORTE aún no ha dado sale marcado con <Pendiente>, nunca inventado.
//  2. Las referencias a la Ley 29733 y su reglamento no están verificadas por un abogado
//     (puntos a revisar en REVISION-LEGAL-FASE-7.md).
// Cuando algo del sitio cambie (analítica, un formulario, otro proveedor), esta página cambia con él.
// Si cambia TEXTO_CONSENTIMIENTO, hay que subir VERSION_CONSENTIMIENTO y revisar el apartado 4.

const VERSION = "Borrador 2 · 09/10/2026";

function Pendiente({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded-pieza bg-naranja-100 px-1.5 py-0.5 font-mono text-[0.8125rem] text-naranja-800">
      [Por completar: {children}]
    </mark>
  );
}

function Apartado({ numero, titulo, children }: { numero: number; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`ap-${numero}`} className="border-t border-concreto-200 py-8">
      <h2 id={`ap-${numero}`} className="font-display ancho-normal text-xl font-extrabold text-petroleo-800">
        <span className="cifras mr-3 text-concreto-500">{String(numero).padStart(2, "0")}</span>
        {titulo}
      </h2>
      <div className="mt-4 space-y-4 leading-relaxed text-concreto-700 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">{children}</div>
    </section>
  );
}

const enlaceCorreo = (
  <a href={`mailto:${empresa.correo}`} className="text-petroleo-700 underline underline-offset-4 hover:text-naranja-700">
    {empresa.correo}
  </a>
);

export default function Privacidad() {
  return (
    <Seccion fondo="blanco">
      <Contenedor ancho="estrecho">
        <EncabezadoSeccion nivel="h1" tamano="lg" sobretitulo="Legal" titulo="Política de privacidad" />
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Etiqueta tono="naranja">Borrador pendiente de revisión legal</Etiqueta>
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-concreto-600">{VERSION}</span>
        </div>
        <p className="mt-6 text-lg leading-relaxed text-concreto-700">
          Esta política explica qué datos personales trata este sitio web, para qué los usamos y qué derechos tienes. Es breve
          porque el sitio recoge muy poco: solo lo que tú escribes en el formulario de novedades.
        </p>

        <div className="mt-10">
          <Apartado numero={1} titulo="Quién es el responsable">
            <p>
              {empresa.razonSocial ?? <Pendiente>razón social</Pendiente>}, con nombre comercial {empresa.nombre}
              {empresa.ruc ? `, RUC ${empresa.ruc}` : null}
              {empresa.ruc ? null : (
                <>
                  , <Pendiente>RUC</Pendiente>
                </>
              )}
              , domicilio en {empresa.direccion ?? <Pendiente>domicilio</Pendiente>} ({empresa.zona}).
            </p>
            <p>Para cualquier tema de privacidad, escríbenos a {enlaceCorreo}.</p>
          </Apartado>

          <Apartado numero={2} titulo="Qué datos recopilamos">
            <p>
              <strong>Formulario «Conoce nuestras novedades y productos»</strong> (portada del sitio):
            </p>
            <ul>
              <li>
                <strong>Tu correo electrónico</strong> (obligatorio): sin él no podemos escribirte.
              </li>
              <li>
                <strong>El nombre de tu empresa</strong> (opcional): puedes dejarlo en blanco.
              </li>
              <li>
                <strong>La constancia de tu consentimiento</strong>: la fecha y hora en que marcaste la casilla y la versión del
                texto que aceptaste ({VERSION_CONSENTIMIENTO}). Sirve para poder demostrar que nos autorizaste.
              </li>
            </ul>
            <p>
              No te pedimos teléfono, cargo, dirección ni nada más. Para frenar el envío masivo de formularios por programas
              automáticos, el servidor usa tu dirección IP solo un momento y en memoria: no se guarda en ningún archivo ni se
              incluye en el aviso que recibimos, y se descarta en menos de una hora.
            </p>
            <p>
              <strong>Otros canales:</strong>
            </p>
            <ul>
              <li>
                <strong>Cotizaciones por WhatsApp:</strong> esta web no recibe ni guarda lo que escribes. Al pulsar «Cotizar» se
                abre WhatsApp con un mensaje ya redactado; lo que envíes, y tu número, lo ven {empresa.nombre} y WhatsApp. Lo
                único que anota nuestro servidor es qué producto se estaba cotizando, sin datos tuyos.
              </li>
              <li>
                <strong>Correo directo:</strong> si nos escribes a {empresa.correo}, usamos tu mensaje y tu dirección solo para
                responderte.
              </li>
              <li>
                <strong>Datos técnicos:</strong> como en cualquier sitio web, el proveedor de alojamiento puede registrar
                temporalmente tu dirección IP y el navegador al servir las páginas, por seguridad y funcionamiento.
              </li>
            </ul>
            <p>
              Este sitio <strong>no usa cookies de seguimiento, publicidad ni analítica de terceros</strong>. Si esto cambia, se
              avisará aquí y se pedirá tu consentimiento antes.{" "}
              <Pendiente>comprobar con el sitio ya publicado que no se cargue ninguna cookie de terceros</Pendiente>
            </p>
          </Apartado>

          <Apartado numero={3} titulo="Para qué los usamos">
            <p>
              <strong>Finalidad comercial.</strong> Usamos tu correo (y el nombre de tu empresa, si lo indicas) para enviarte
              información comercial sobre el catálogo de {empresa.nombre}, nuevos productos y novedades. Es publicidad de
              nuestros propios productos: no es un servicio que hayas contratado.
            </p>
            <p>
              No vendemos ni cedemos tus datos a otras empresas para su publicidad, y no tomamos decisiones sobre ti de forma
              automática a partir de ellos.
            </p>
          </Apartado>

          <Apartado numero={4} titulo="Tu consentimiento">
            <p>
              Solo recibes comunicaciones comerciales si lo pides: la casilla del formulario aparece <strong>sin marcar</strong>{" "}
              y hay que marcarla a propósito. Dice exactamente:
            </p>
            <blockquote className="border-l-4 border-naranja-500 bg-concreto-100 px-5 py-4 text-petroleo-900">
              «{TEXTO_CONSENTIMIENTO}»
            </blockquote>
            <p>
              Dar tus datos es voluntario. Si no marcas la casilla, no registramos tu correo y no te escribimos; eso no te
              impide cotizar con nosotros por WhatsApp o por correo.
            </p>
          </Apartado>

          <Apartado numero={5} titulo="Cómo dejar de recibir comunicaciones">
            <p>
              Puedes retirar tu consentimiento cuando quieras, sin dar explicaciones y sin coste. Escribe a {enlaceCorreo} con
              el asunto «Baja» desde el correo con el que te registraste. Dejaremos de enviarte comunicaciones comerciales y,
              si lo pides, eliminaremos tus datos.
            </p>
            <p>
              Además, cada comunicación comercial que te enviemos indicará cómo darte de baja.{" "}
              <Pendiente>
                plazo concreto de atención de las bajas; la Ley 28493 sobre correo comercial exige respetar la baja en pocos
                días
              </Pendiente>
            </p>
          </Apartado>

          <Apartado numero={6} titulo="Con quién se comparten los datos">
            <p>Usamos proveedores que tratan datos por nuestra cuenta, solo para prestar su servicio:</p>
            <ul>
              <li>
                <strong>Resend</strong>, servicio de envío de correo: transporta el aviso con tu correo y tu empresa hasta
                nuestro buzón.
              </li>
              <li>
                <strong>Microsoft (Outlook)</strong>, donde está nuestro buzón comercial y, por tanto, donde se conservan esos
                avisos.
              </li>
              <li>
                <strong>WhatsApp (Meta)</strong>, cuando eliges cotizar por ese canal; se rige por sus propios términos.
              </li>
              <li>
                <strong>Proveedor de alojamiento del sitio</strong>: <Pendiente>nombre del proveedor y país</Pendiente>
              </li>
            </ul>
            <p>
              Estos proveedores pueden tener servidores fuera del Perú, por lo que tus datos podrían tratarse en otros países.{" "}
              <Pendiente>confirmar países y garantías de cada proveedor (flujo transfronterizo)</Pendiente>
            </p>
            <p>También podríamos entregar datos a una autoridad si la ley nos obliga.</p>
          </Apartado>

          <Apartado numero={7} titulo="Tus derechos">
            <p>
              Conforme a la Ley N.° 29733, Ley de Protección de Datos Personales, y su reglamento, puedes en cualquier momento:
            </p>
            <ul>
              <li>pedir información sobre cómo tratamos tus datos;</li>
              <li>acceder a los datos que tenemos sobre ti;</li>
              <li>actualizarlos o rectificarlos;</li>
              <li>pedir que los eliminemos (cancelación);</li>
              <li>oponerte a que los tratemos;</li>
              <li>retirar tu consentimiento.</li>
            </ul>
            <p>
              Para ejercer cualquiera de estos derechos, escribe a {enlaceCorreo} indicando qué quieres y desde qué correo te
              registraste (así comprobamos que eres tú). Te responderemos dentro de los plazos que fija la norma.{" "}
              <Pendiente>revisión legal: plazos y requisitos de identificación según el reglamento vigente</Pendiente>
            </p>
            <p>
              Si crees que no atendimos bien tu solicitud, puedes acudir a la Autoridad Nacional de Protección de Datos
              Personales, del Ministerio de Justicia y Derechos Humanos.
            </p>
          </Apartado>

          <Apartado numero={8} titulo="Cuánto tiempo conservamos tus datos">
            <p>
              Conservamos tu correo mientras no retires tu consentimiento. Si te das de baja o pides su eliminación, lo
              borramos de nuestra lista de contactos.{" "}
              <Pendiente>plazo de conservación tras la baja y si se guarda constancia mínima del consentimiento</Pendiente>
            </p>
          </Apartado>

          <Apartado numero={9} titulo="Seguridad y registro del banco de datos">
            <p>
              La clave del servicio de correo vive solo en el servidor, nunca en la web que ves. La conexión con el sitio va
              cifrada, el formulario valida lo que recibe en el servidor y no escribimos tu correo en ningún archivo de
              errores. Ninguna medida es infalible, pero las revisamos si algo cambia.
            </p>
            <p>
              Inscripción del banco de datos de contactos comerciales en el Registro Nacional de Protección de Datos
              Personales: <Pendiente>trámite por realizar si corresponde</Pendiente>
            </p>
          </Apartado>

          <Apartado numero={10} titulo="Cambios en esta política">
            <p>
              Si el sitio cambia en algo que afecte a tus datos, actualizaremos esta página y su fecha. Versión actual:{" "}
              {VERSION}.
            </p>
          </Apartado>
        </div>
      </Contenedor>
    </Seccion>
  );
}
