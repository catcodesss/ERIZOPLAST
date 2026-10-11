# PLASTINORTE — sitio web comercial

Sitio B2B de un fabricante peruano de jabas plásticas industriales (Lima Norte). Next.js 16 · TypeScript · Tailwind CSS v4 · Lucide. Sin base de datos, sin carrito, sin pasarela.

El plan y las decisiones están en [PLAN-FASE-1.md](PLAN-FASE-1.md). **Estado: Fase 8** (revisión y optimización final; lista para desplegar salvo credenciales y datos de la empresa; pendiente de aprobación). Informe en [INFORME-FASE-8.md](INFORME-FASE-8.md); **guía de uso y despliegue en [DESPLIEGUE.md](DESPLIEGUE.md)**. Antes: Fase 7 (formulario de novedades por correo), Fase 6 (contacto y cotizaciones por WhatsApp) y Fase 5 (contacto y privacidad; su boletín con Brevo fue **sustituido** en la Fase 7). Catálogo de la Fase 4: fuentes y precios en [FUENTES-FASE-4.md](FUENTES-FASE-4.md), documento interno.

## Ejecutar

```bash
npm install
npm run dev        # http://localhost:3000
```

Revisar el sistema de diseño en **http://localhost:3000/sistema-diseno** (solo en desarrollo: en producción responde 404). Para ejecutarlo, configurarlo y publicarlo paso a paso: **[DESPLIEGUE.md](DESPLIEGUE.md)**.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Valida el catálogo y compila para producción |
| `npm run typecheck` | Tipos (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm run probar` | Pruebas funcionales de contacto y cotización (requiere `npm run build` antes) |
| `npm run probar:novedades` | Pruebas del formulario de novedades contra un Resend simulado (ver CONFIGURACION-FASE-7.md) |
| `npm run auditar` | Auditoría de seguridad: secretos, `.env`, cabeceras (requiere `npm run build` antes) |
| `npm run revisar` | Revisión comercial automática: fotos rotuladas, nada inventado, orientación a cotizar (requiere build) |
| `npm run medir -- <url> [movil o escritorio]` | LCP, CLS y TBT con un Chrome real (requiere el sitio en marcha con `npm run start`) |
| `npm run responsive -- <url>` | Auditoría responsive de todas las páginas en 12 anchos, 320–1920 px (≈ 5 min) |
| `npm run probar:menu -- <url>` | Navegación y menú móvil con un Chrome real |
| `npm run foto -- …` | Incorpora una foto propia (portada, secciones o producto) |
| `npm run validar` | Comprueba `data/productos.ts` (se ejecuta solo antes del build) |

## Variables de entorno

Copia `.env.example` a `.env.local`:

- `ERIZOPLAST_WHATSAPP_NUMBER` — número comercial, solo dígitos con código de país. **Solo servidor**: nunca con prefijo `NEXT_PUBLIC_`. El valor real va solo en `.env.local` (ignorado por git); `.env.example` lleva uno ficticio. En Vercel se declara en *Settings → Environment Variables*.
- `NEXT_PUBLIC_SITE_URL` — URL pública del sitio (canónicas, sitemap, robots y Open Graph). Opcional en local; **recomendada al publicar** (en Vercel, si falta, se usa el dominio de producción del proyecto).
- `ERIZOPLAST_RESEND_API_KEY` — clave de Resend para el formulario de novedades. **Solo servidor.** Sin ella el formulario responde «aún no disponible» y no recoge nada. Opcionales: `ERIZOPLAST_CONTACTO_DESTINO` y `ERIZOPLAST_CONTACTO_REMITENTE`. Pasos en [CONFIGURACION-FASE-7.md](CONFIGURACION-FASE-7.md).

## WhatsApp y cotizaciones (Fase 6)

Ningún componente contiene el número ni enlaces `wa.me`. Todos los botones apuntan a `/api/whatsapp` ([app/api/whatsapp/route.ts](app/api/whatsapp/route.ts)), que redirige a WhatsApp desde el servidor. `lib/whatsapp.ts` importa `server-only`: si alguien lo usa desde un componente de cliente, el build falla.

| Entrada | Qué hace |
|---|---|
| `GET /api/whatsapp` | Cotización general (302). |
| `GET /api/whatsapp?producto=<slug>` | Mensaje con ese producto: «Hola, estoy interesado en cotizar la jaba … Quisiera conocer los precios por volumen y las opciones de entrega.». Un slug desconocido o malformado cae en la cotización general. |
| `POST /api/whatsapp` | Igual, más tres datos **opcionales**: `cantidad`, `ciudad`, `contacto` (nombre o empresa). Va por POST para que no queden en la URL ni en los registros del hosting; el servidor los limpia (sin saltos de línea ni caracteres invisibles; máximo 40/60/80 caracteres) y no los guarda (303). |

- Los botones («Cotizar por WhatsApp», «Solicitar cotización», «Hablar con un asesor») salen de `BotonCotizar`. El panel de datos opcionales sale de `CotizacionRapida` (un `<details>` con `<form>` nativo, sin JavaScript) y está en las fichas de producto, en el cierre de la portada y en `/contacto`. Cada tarjeta del catálogo lleva el botón directo, sin formulario.
- El botón flotante (`BotonFlotante`) usa el producto de la ficha en la que estás; en el resto del sitio es general.
- Si la variable no está configurada, los botones llevan a `/#contacto` (el correo) en lugar de a un error.
- Correo `mailto:`, ubicación y cobertura salen de `data/empresa.ts`.

Límites: el número queda oculto en la interfaz, en el HTML y en el JavaScript, pero **no es confidencial**: aparece en la redirección final y dentro de WhatsApp, y quien siga la redirección lo verá. No sirve un export 100 % estático: hace falta ejecución en servidor (Vercel lo da).

### Pruebas funcionales

```bash
npm run build
npm run probar
```

`scripts/probar-cotizacion.mjs` levanta el sitio compilado dos veces (con número y sin él), sin servicios externos, y hace 42 comprobaciones: que el número no esté en el código, el HTML, el JS ni lo prerenderizado; que ningún enlace esté vacío o roto; el mensaje exacto de cada producto; los datos opcionales (recorte, limpieza, codificación); las cabeceras `no-store` y `noindex`; y la degradación sin número. El número real se lee de `.env.local` solo para buscarlo y nunca se imprime.

Límite: el catálogo se pinta en el cliente, así que el script no ve sus botones ya renderizados (solo comprueba que la tarjeta cablea el slug de cada producto). Esos botones se verifican en un navegador.

## Novedades y contacto (Fase 7)

- **Formulario de novedades**: sección «Conoce nuestras novedades y productos» en la portada (`/#novedades`) → `POST /api/novedades` ([app/api/novedades/route.ts](app/api/novedades/route.ts)) → aviso por correo vía **Resend** ([lib/novedades.ts](lib/novedades.ts)) a dylan_cal@outlook.com. Sin base de datos: el buzón es el registro. Campos: correo (obligatorio), empresa (opcional) y casilla de consentimiento **sin marcar y obligatoria**; el aviso lleva el texto aceptado y su versión como constancia. Validación compartida navegador/servidor ([lib/novedades-validacion.ts](lib/novedades-validacion.ts)); anti-spam básico (campo trampa, tiempo mínimo, mismo origen, límite por IP y global). El correo no se escribe en ningún log. El pie solo enlaza a la sección.
- **Falta configurar el servicio**: hace falta cuenta de Resend y `ERIZOPLAST_RESEND_API_KEY`. **No se probó contra Resend real**, solo contra un servidor simulado: sin clave el formulario responde «aún no disponible» y no finge nada. Pasos, límites y qué no hace (no envía boletines ni confirma al visitante) en [CONFIGURACION-FASE-7.md](CONFIGURACION-FASE-7.md).
- **Pruebas**: `npm run probar:novedades` (con el servidor de desarrollo apuntando al Resend simulado; ver el documento anterior).
- **Contacto**: `/contacto` con WhatsApp y correo; sin formulario de contacto, así la web no guarda datos de quien escribe.
- **Política de privacidad**: `/privacidad` es un **borrador** (`noindex`) con los datos pendientes marcados `[Por completar: …]`. Lo que hay que revisar con un abogado antes de publicar (Ley 29733, su nuevo reglamento, Ley 28493 de spam, flujo transfronterizo, inscripción del banco de datos…) está en [REVISION-LEGAL-FASE-7.md](REVISION-LEGAL-FASE-7.md).

## Estructura

```
app/                    rutas: /, /catalogo, /catalogo/categoria/[categoria], /catalogo/[slug], /contacto, /privacidad,
                        /creditos, /api/whatsapp, /api/novedades, /sistema-diseno (solo dev), sitemap, robots, opengraph-image
  globals.css           ← TODOS los tokens (color, tipografía, espaciado, movimiento)
components/
  marca/                Logo y Simbolo
  ui/                   Boton, BotonCotizar, Seccion, Contenedor, EncabezadoSeccion,
                        Tarjeta, Etiqueta, BloqueDato, Foto, PlanoModelo, DivisorPuas, Reveal
  secciones/            Panoramica, DosColumnas (composiciones reutilizables)
  inicio/               Hero, Ventajas, LineasDestacadas, Sobre, Logistica, Cierre, Novedades (la portada)
  catalogo/             PaginaCatalogo, CatalogoInteractivo (categorías = enlaces + búsqueda), TarjetaProducto, FotoProducto, PrecioProducto
  seo/                  DatosEstructurados (JSON-LD)
  novedades/            FormularioNovedades (cliente: validación, estados, accesibilidad)
  layout/               Header, Footer, BotonFlotante, AvisoFase (solo en dev)
data/                   empresa, navegacion, categorias, tipos, productos, fuentes-productos (INTERNO), lineas, fotos, consentimiento
lib/                    cn, color (contraste WCAG), productos, sitio (URL pública), whatsapp (server-only),
                        novedades (server-only), novedades-validacion
scripts/                validar-catalogo, probar-cotizacion, probar-novedades, probar-menu, auditar-seguridad,
                        revisar-contenido, auditar-responsive, medir-rendimiento, agregar-foto, lib/chrome
```

## Cómo editar el catálogo

Todo está en `data/productos.ts`: un bloque por producto con nombre, categorías, precio, imágenes, medidas, características y disponibilidad. Tras editar, `npm run validar` (también corre solo antes del build).

- **Precio**: `{ tipo: "referencial", soles, unidad: "por unidad" }` o `{ tipo: "consultar", etiqueta }`. **Por decisión del 09/10/2026 todos están en `consultar`** hasta que la empresa apruebe costo y margen; el catálogo deja de mencionar precios mientras no haya ninguno publicado. Un precio referencial exige su producto equivalente en `data/fuentes-productos.ts` y debe quedar entre un 5 % y un 8 % por debajo; si no, el validador falla.
- **Fotos propias**: en `public/productos/<slug>/01.webp` y en `imagenes`. Quita entonces `fotoReferencial`.
- **Producto nuevo**: copia un bloque, cambia el `slug` (da la URL de su ficha y el enlace de cotización) y añade su fuente en `data/fuentes-productos.ts`.
- **Ocultar** sin borrar: `publicado: false`.
- `confirmacionEmpresa` pasa a `"confirmado"` solo cuando PLASTINORTE confirme que fabrica ese modelo con esas medidas.
- `data/fuentes-productos.ts` tiene precios de la competencia: **no importarlo desde `app/` ni `components/`**.

## Convenciones

- **Español** en nombres, comentarios y textos.
- Los comentarios explican el porqué, no el qué.
- Colores, tamaños y espacios salen de `globals.css`; los componentes no inventan valores.
- Los fondos de sección (`Seccion`) marcan `data-tono`, y los hijos se adaptan con `group-data-[tono=oscuro]/seccion:`.
- Esta versión de Next.js trae `cacheComponents`: no usar `new Date()` ni datos de petición en componentes de servidor sin `'use cache'` o `<Suspense>` (ver `components/layout/Footer.tsx`). Leer `node_modules/next/dist/docs/` antes de tocar APIs de Next.

## Pendiente (ver PLAN-FASE-1.md, §12)

Confirmación de la empresa de cada modelo (y si fabrica jaba panadera) · aprobar precios · fotos propias de producto, planta y camiones · razón social, RUC y dirección · logo definitivo (el actual es una propuesta tipográfica) · dominio y correo propio · texto legal de `/privacidad` con revisión.
