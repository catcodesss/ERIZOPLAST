# PLASTINORTE — Informe final (Fase 8: revisión y optimización)

**Fecha:** 09/10/2026 · **Estado:** el sitio está **completo y listo para desplegar en Vercel**. Lo único que falta es
lo que solo la empresa puede dar: credenciales (WhatsApp, Resend), dominio, datos legales, confirmación de modelos
y precios, y fotos propias. Todo eso está listado en [§9](#9-pendiente-de-configuración-y-de-información-comercial).

No se reconstruyó nada: se auditó lo existente, se corrigió lo que fallaba y se añadió lo que faltaba, manteniendo la
identidad visual aprobada (azul petróleo, naranja industrial, tipografía Archivo/IBM Plex, motivo de púas).

> **Cómo leer este informe.** Cada afirmación dice **cómo se comprobó**. Lo que *no* se pudo comprobar está en
> [§8](#8-lo-que-no-se-pudo-comprobar). Las cifras de rendimiento son de **laboratorio** (un Chrome real con red y CPU
> estranguladas), no datos de visitantes reales.

---

## 1. Resumen

| Área | Resultado | Cómo se comprobó |
|---|---|---|
| Tipos, lint, build | ✔ sin errores ni avisos; 29 páginas generadas | `npm run typecheck`, `npm run lint`, `npm run build` |
| Funcionalidad: WhatsApp, botones, enlaces, número oculto | ✔ 42/42 | `npm run probar` |
| Formulario de novedades (validación, anti-spam, errores del proveedor, interfaz) | ✔ 38 + 3 + 6 (navegador real) | `npm run probar:novedades` (+ `-- --sin-clave`, `-- --ui`) |
| Navegación móvil, categorías y búsqueda del catálogo | ✔ 12/12 | `npm run probar:menu` |
| Responsive | ✔ ver [§3](#3-responsive) | `npm run responsive` |
| Seguridad | ✔ 16/16 | `npm run auditar` + `npm audit` (0 vulnerabilidades) |
| Revisión comercial (nada inventado, fotos rotuladas) | ✔ 12/12 | `npm run revisar` |
| Rendimiento (móvil lento) | ✔ LCP ≈ 1,5 s, CLS ≈ 0, TBT ≈ 130 ms | `npm run medir` ([§6](#6-rendimiento)) |

---

## 2. Problemas encontrados y corregidos

Ordenados por gravedad. Cada uno tiene su causa, no solo su parche.

| # | Problema | Impacto | Corrección |
|---|---|---|---|
| 1 | **El catálogo no estaba en el HTML del servidor.** El `Suspense` solo dejaba un hueco y los productos aparecían al ejecutar JavaScript. | Un buscador sin JS veía un catálogo vacío; en móvil lento el LCP era alto. | Ahora el servidor pinta el catálogo completo; cada **categoría es una página estática propia** (`/catalogo/categoria/agricolas`…) con su título y descripción. LCP de `/catalogo` en móvil lento: 3,4 → **1,7 s**, CLS 0. |
| 2 | **Desbordamiento horizontal en móviles de 320–360 px** (portada, contacto, fichas): grids sin columna explícita se ensanchaban hasta el botón más ancho. | Página que "baila" de lado y botones cortados. | Regla base `:where(.grid)` con una columna que puede encogerse + botones que pueden pasar a dos líneas en pantallas muy estrechas. |
| 3 | El titular **«TRANSPORTAMOS.» se salía de la pantalla** a ≤ 360 px (mayúsculas expandidas). | Texto cortado en un titular principal. | Tamaño que escala con el ancho (`min(display-lg, 7,4 vw)`). |
| 4 | **Texto interno visible al público** en 3 de 7 modelos: «FOTO PENDIENTE… foto propia sobre fondo neutro» (una instrucción para el equipo). | Aspecto de web a medio hacer. | Esquema isométrico del modelo con sus **medidas reales**, rotulado como esquema y no como foto («Foto propia próximamente»). |
| 5 | **Textos alternativos de las 10 fotos con la codificación rota** («plÃ¡sticas»). | Accesibilidad y SEO de imágenes; crédito ilegible. | Reparado `data/fotos.ts`. |
| 6 | **No se podían usar fotos propias**: toda foto con `id` llevaba «Imagen referencial» y se acreditaba como de banco. | «Sustituir fotografías» era imposible sin tocar código. | Licencia «Propia» (sin rótulo ni crédito) + `npm run foto` que optimiza, mide y registra. |
| 7 | La guía interna **`/sistema-diseno` era pública**. | Página no destinada a clientes, con lectura de archivos del proyecto. | 404 en producción. |
| 8 | Portada sin título/descripción propios, sin canónica, sin imagen al compartir, sin datos estructurados; sitemap sin categorías. | SEO débil; al compartir en WhatsApp salía un enlace pelado. | Ver [§5](#5-seo). |
| 9 | Encabezado demasiado ancho a 320 px; título largo de «industriales» desbordaba 10 px a 320 px. | Menú y títulos pegados al borde o cortados. | Logo y separación más pequeños bajo 400 px; mínimo de la escala `display-xl` reducido + salto de palabra de seguridad. |
| 10 | El correo del formulario se partía a mitad de dirección; etiqueta «Imagen referencial» de 10 px; enlaces del pie bajos para el dedo; sobretítulo apretado. | Detalles de pulido. | Corregidos. |
| 11 | Sin cabeceras de seguridad; el servidor anunciaba su framework. | Superficie innecesaria. | Cabeceras + `poweredByHeader: false`. |
| 12 | Fuentes: un peso de Plex Mono (600) que solo usaba la guía interna y precarga de una fuente que solo rotula etiquetas pequeñas. | Bytes y ancho de banda competidos con la foto de portada. | Quitado el peso 600 y la precarga de la fuente de etiquetas. |

**Un hallazgo sobre las mediciones.** Mis primeras cifras de rendimiento eran engañosas: el **antivirus de este equipo
(Kaspersky) inyecta un script bloqueante en cada página** y retrasaba el primer pintado hasta 3 s. Lo detecté porque
el pintado coincidía al milisegundo con la descarga de ese script, y lo bloqueé en el medidor (`BLOQUEAR_HOSTS`).
Las cifras de este informe son sin esa interferencia. Un visitante real no la tiene.

---

## 3. Responsive

`npm run responsive` carga **19 páginas × 12 anchos (320, 360, 375, 390, 430, 600, 768, 820, 1024, 1280, 1440 y 1920 px) = 228
combinaciones** en un Chrome real y mide desbordamiento horizontal (cajas y texto), texto menor de 11 px, objetivos
táctiles y que haya un único `<h1>`. Cubre celulares pequeños y grandes, tablets, portátiles y monitores.

**Resultado sobre la versión final: 228/228 combinaciones sin desbordamiento horizontal, ningún texto menor de 11 px, un único `<h1>` en cada página.** (La primera pasada encontró los problemas 2, 3, 9 de §2; la segunda, uno más —el título de «industriales» a 320 px—; esta tercera, ninguno.) Quedan 11 enlaces de menos de 24 px de alto en móvil: son enlaces dentro de frases (correo, «política de privacidad»), tarjetas con enlace extendido y los créditos de `/creditos`, que WCAG 2.2 admite por su espaciado; no son botones.

No se hicieron pruebas en un dispositivo físico (ver [§8](#8-lo-que-no-se-pudo-comprobar)).

---

## 4. Diseño

La portada ya tenía composición variada (foto a sangre, panel que se solapa, mosaico asimétrico, bloque oscuro con
titular de tres golpes, cierre naranja, sección de novedades). No se tocó su estructura (salvo el subtítulo del héroe, reescrito para el SEO). Cambios:

- **Modelos sin foto → esquema técnico isométrico** con las medidas reales y cotas (en vez de un marcador vacío). Es
  honesto —un dibujo, rotulado— y coherente con la estética industrial.
- **Contacto:** la columna de datos pasa a un panel oscuro con regla naranja que acompaña al desplazamiento (antes
  dejaba un hueco grande bajo tres líneas de texto).
- **Categorías:** de botones de filtro a **enlaces a páginas propias**, sin saltos de diseño al cambiar.
- Pulido: correo sin partir, sobretítulo con interlínea, enlaces del pie más altos, etiqueta de foto legible.

**Calidad de las fotografías.** Las 10 miden entre 1600 y 2560 px de ancho (suficiente para pantallas grandes con el recorte actual), pesan 165–800 KB de origen y se sirven en AVIF/WebP del tamaño exacto de cada pantalla. Dos de las de transporte tienen desenfoque de movimiento a propósito. En el camión se recortó el encuadre para dejar fuera marcas ajenas (ver los comentarios de `Logistica.tsx`); no revisé cada foto buscando logotipos de terceros. Técnicamente están bien; lo que les falta es ser *de la empresa*.

**Lo que el diseño no puede resolver solo:** todas las fotografías son de bancos y están rotuladas. Una web de empresa
industrial «real» se ve realmente real con **fotos propias de la planta, los moldes, el producto y los camiones**.
Es la mejora de mayor efecto que queda y solo la empresa puede hacerla (con `npm run foto`, [DESPLIEGUE.md §6](DESPLIEGUE.md#6-sustituir-fotografías)).

---

## 5. SEO

Frases objetivo y dónde viven (aparecen una vez y de forma natural, sin repetirlas):

| Búsqueda | Dónde |
|---|---|
| «jabas plásticas en Lima» / «al por mayor» | Título de la portada: *«Jabas plásticas al por mayor en Lima \| Fábrica PLASTINORTE»*; descripción y subtítulo del héroe |
| «fábrica de jabas plásticas Perú» / «Lima Norte» | Descripción de la portada, `<title>` por defecto, datos estructurados (Organization, zona Lima Norte, Perú) |
| «jabas industriales Lima Norte» | Página `/catalogo/categoria/industriales` («Jabas plásticas industriales y de almacenamiento») |
| «venta de jabas plásticas Perú» | Descripciones de catálogo, categorías, fichas y contacto («Venta de jabas plásticas en Lima y todo el Perú») |
| Búsquedas por uso | Páginas de categoría: agrícolas y fruteras, para alimentos, cerradas, caladas multiuso |

Implementado: `<title>` y descripción propios en cada página; **canónica** en cada una; **Open Graph/Twitter** con una tarjeta
de marca generada (`/opengraph-image`, **sin fotos**, para que no circule una foto de banco sin su rótulo);
**JSON-LD** (`Organization` en la portada, `BreadcrumbList` en las fichas; sin teléfono, precios ni certificaciones);
**sitemap** con portada, catálogo, contacto, categorías con modelos y fichas; **robots.txt** (oculta `/api/`);
`/privacidad` y `/creditos` con `noindex`; un único `<h1>` por página; `lang="es-PE"`; HTML con la lista de productos ya
pintada. La URL base sale de `NEXT_PUBLIC_SITE_URL` o, en Vercel, del dominio de producción.

**Límite:** el SEO real se gana con tiempo, contenido propio y enlaces. Falta dar de alta el sitio en Google Search Console
y, si hay local, Google Business Profile ([DESPLIEGUE.md](DESPLIEGUE.md#después-de-publicar-lista-de-comprobación)).

---

## 6. Rendimiento

Mediana de 3–5 repeticiones, **compilación de producción**, `npm run medir`. «Móvil» = 390 px, CPU 4× más lenta y red
4G lenta (1,6 Mb/s, 150 ms), el perfil más duro de Lighthouse. Umbrales buenos: LCP ≤ 2,5 s · CLS ≤ 0,1 · TBT ≤ 200 ms.

| Página | Perfil | LCP | CLS | TBT |
|---|---|---|---|---|
| Portada | móvil | **1,5–1,6 s** | 0,001 | 129 ms |
| Portada | escritorio | 0,33 s | 0 | 0 |
| Catálogo | móvil | 1,7 s | 0 | 128 ms |
| Categoría (agrícolas) | móvil | 1,5 s | 0,03 | 120 ms |
| Fichas | móvil | 1,5–1,6 s | 0 | 106–136 ms |
| Contacto | móvil | 1,4 s | 0 | 113 ms |

Qué se hizo: imágenes en **AVIF** con WebP de respaldo (el héroe baja de 626 KB a 38 KB a 828 px) y caché de 31 días;
catálogo y categorías renderizados en el servidor; fuentes alojadas por el propio sitio con `display: swap` y menos
pesos (la de etiquetas ya no compite con la foto de portada); **JavaScript inicial ≈ 176 KB comprimido**, casi todo
React y Next (el código propio son unas decenas de KB; `lucide-react` solo trae los íconos usados); dependencias
mínimas (4 de producción, `npm audit` sin vulnerabilidades); animaciones solo con `transform`/`opacity` y respetan
`prefers-reduced-motion`.

**Límites.** Son medidas de laboratorio en un equipo concreto: el rendimiento real depende del dispositivo y la red de
cada visitante (en Vercel, el HTML y las imágenes salen de una red de distribución, algo que aquí no se mide). No se
ejecutó Lighthouse/PageSpeed oficial. Se observó un CLS de 0,03 en una de las categorías (aún «bueno»); no investigué su causa.

---

## 7. Seguridad

Comprobado con `npm run auditar` (16 comprobaciones) y `npm run probar`:

- **El número comercial no aparece** como texto visible, ni en el HTML, ni en el JavaScript, ni en los archivos
  prerenderizados, ni en el código ni en la documentación. Vive en una variable de entorno que solo lee un módulo
  `server-only`; los botones apuntan a `/api/whatsapp`.
- **Secretos solo en el servidor:** ningún valor de `.env.local` está en lo que descarga el navegador; la clave de
  Resend solo la lee un módulo `server-only`; las únicas variables públicas (`NEXT_PUBLIC_`) son la URL del sitio.
- **`.env*` fuera del repositorio:** `.gitignore` excluye `.env*` y solo versiona `.env.example` (vacío o ficticio).
  *El proyecto aún no es un repositorio git*: al crearlo, `git status` debe confirmarlo (ver [DESPLIEGUE.md §7](DESPLIEGUE.md#7-publicarlo-en-vercel)).
- **Entradas validadas** en navegador y servidor (correo, consentimiento, longitudes, caracteres de control), con
  campo trampa, tiempo mínimo, mismo origen, tamaño máximo y límite por IP y global; los datos opcionales de
  cotización se limpian y recortan antes de entrar en el mensaje de WhatsApp.
- **Cabeceras:** `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`; sin
  `X-Powered-By`; respuestas de `/api/` con `no-store`.
- **`npm audit`: 0 vulnerabilidades** en dependencias de producción.

**Limitación inevitable del destino en WhatsApp.** El número queda oculto en la página, pero **no es secreto**: quien
pulsa «Cotizar» lo ve en WhatsApp (tiene que verlo para escribirte), y quien siga a mano la redirección de `/api/whatsapp`,
o un programa que lo haga, lo lee en la dirección de destino (`wa.me/…`). Ninguna web que deba permitir escribir por WhatsApp
puede evitarlo. Lo que se logra es que **no esté en el texto, el código fuente ni los buscadores**, y que los programas que
rastrean teléfonos en el HTML no lo recojan. Si se filtra, se cambia la variable y se vuelve a desplegar.

**Otros límites reconocidos:** el límite de envíos del formulario vive en memoria de cada instancia (frena abuso casual,
no un ataque decidido; el siguiente paso sería un desafío tipo Turnstile y un almacén compartido); no hay Content-Security-Policy
(una CSP estricta exige nonces en Next y rompería la página si se hace a medias).

---

## 8. Lo que no se pudo comprobar

Dicho sin rodeos, para que no se dé por hecho:

- **Resend real.** No hay clave: el formulario se probó contra un servidor simulado (cada respuesta posible del proveedor)
  y en el navegador, pero **ningún correo real se envió**. Se confirma con la prueba real de [CONFIGURACION-FASE-7.md](CONFIGURACION-FASE-7.md).
- **WhatsApp real desde un celular.** Se comprueba que la ruta redirige a `wa.me` con el mensaje exacto de cada producto, pero
  no se abrió la app en un teléfono físico.
- **Dispositivos y navegadores reales.** Todo se midió con Chrome (emulando tamaños y táctil). No se probó en Safari/iOS, Firefox
  ni en un celular físico; los comportamientos propios de esos motores (barra de direcciones móvil de iOS, tipografías) quedan sin verificar.
- **Lighthouse/PageSpeed oficial y datos de campo (CrUX).** Solo mediciones de laboratorio propias.
- **El despliegue en Vercel.** El proyecto está preparado y compila en producción, pero no se desplegó (no hay cuenta ni repositorio).
- **Revisión legal.** Las normas peruanas citadas salen de fuentes secundarias; nada fue revisado por un abogado ([REVISION-LEGAL-FASE-7.md](REVISION-LEGAL-FASE-7.md)).
- **Veracidad comercial.** No puedo saber si es cierto que la empresa fabrica, tiene flota propia o vende a precio competitivo: el
  sitio lo afirma porque la empresa lo declaró (ver §10).

---

## 9. Pendiente de configuración y de información comercial

**Configuración (la hace quien administra el sitio; [DESPLIEGUE.md](DESPLIEGUE.md)):**

- [ ] `ERIZOPLAST_WHATSAPP_NUMBER` en Vercel (sin él, los botones llevan al correo).
- [ ] Cuenta de Resend con dylan_cal@outlook.com y `ERIZOPLAST_RESEND_API_KEY` en Vercel; probar con un envío real.
- [ ] Crear el repositorio git y subirlo (hoy es una carpeta suelta); importarlo en Vercel.
- [ ] Dominio propio; `NEXT_PUBLIC_SITE_URL`; verificar el dominio en Resend y pasar a un correo con dominio.
- [ ] Alta en Google Search Console (enviar `sitemap.xml`).

**Información que solo la empresa puede dar:**

- [ ] **Razón social, RUC y domicilio** (aparecen en la política de privacidad y el pie; hoy `null`, no se inventan).
- [ ] **Qué modelos fabrica realmente** (y si hace jaba panadera: hoy 0 modelos), con sus medidas, material y colores; luego marcar `confirmacionEmpresa: "confirmado"`.
- [ ] **Aprobación de precios** (costo/margen/IGV). Hoy ninguno se publica: todo dice «Consultar precio».
- [ ] **Fotos propias:** portada, planta, moldes, producto por modelo, camiones (`npm run foto`).
- [ ] **Logo definitivo** (el actual es una propuesta tipográfica).
- [ ] **Texto legal** de `/privacidad` revisado por un abogado; quitar entonces `noindex` y la etiqueta «Borrador».
- [ ] Correo de contacto con dominio propio (hoy `@outlook.com`).
- [ ] Si corresponde, Libro de Reclamaciones y otros requisitos del sitio (ver PLAN-FASE-1.md).

---

## 10. Revisión comercial

`npm run revisar` (12 comprobaciones) y lectura de todo el texto del sitio.

**Lo que NO aparece** (se busca automáticamente en cada página comercial): precios en soles, certificaciones (ISO, HACCP,
SENASA…), años de trayectoria o fundación, número de clientes, superlativos («líder», «el mejor»), garantías, plazos de
entrega, promociones o stock prometido. **Ninguna foto de banco se presenta como propia**: cada una lleva «Imagen
referencial» y está en `/creditos`; los modelos sin foto muestran un esquema rotulado. Mientras la empresa no confirme un
modelo, su ficha y el catálogo avisan «medidas y datos referenciales, se confirman al cotizar».

**Lo que SÍ afirma el sitio — porque la empresa lo declaró — y que conviene que confirme por escrito:**

| Afirmación | Dónde aparece |
|---|---|
| «Fabricamos», «Producimos nosotros mismos lo que vendemos», «sin intermediarios» | Portada (héroe, ventajas, sobre nosotros, fabricación) |
| «Transporte propio / flota propia», «Entregamos con nuestra propia flota en Lima Metropolitana» | Portada, contacto, pie |
| «Envíos a todo el Perú» | Portada, contacto, pie, datos estructurados |
| «Precios competitivos por volumen» | Ventajas y cierre de la portada (afirmación comercial no medible: confirmar o suavizar) |
| Sede en Lima Norte | Portada, contacto, pie, datos estructurados |

**Claridad sobre fabricación y logística:** la portada lo dice en tres lugares (héroe, panel de ventajas y el bloque
«Fabricamos. Abastecemos. Transportamos.») y en el pie. **Orientación a cotizar:** botón de WhatsApp visible en la portada,
catálogo, categorías, cada ficha (ya con el modelo elegido), contacto y pie, más botón flotante en móvil, más correo como
alternativa.

---

## 11. Qué se añadió al proyecto

| Archivo | Para qué |
|---|---|
| [DESPLIEGUE.md](DESPLIEGUE.md) | Guía: ejecutar, variables, WhatsApp, correo, productos y precios, fotos, publicar en Vercel |
| `app/catalogo/categoria/[categoria]/page.tsx`, `components/catalogo/PaginaCatalogo.tsx` | Páginas de categoría |
| `components/ui/PlanoModelo.tsx` | Esquema isométrico del modelo |
| `lib/sitio.ts`, `components/seo/DatosEstructurados.tsx`, `app/opengraph-image.tsx` | SEO |
| `scripts/agregar-foto.mjs` | `npm run foto`: incorporar fotos propias |
| `scripts/auditar-seguridad.mjs`, `revisar-contenido.mjs` | `npm run auditar`, `npm run revisar` |
| `scripts/auditar-responsive.mjs`, `medir-rendimiento.mjs`, `probar-menu.mjs`, `lib/chrome.mjs` | Medidores con Chrome real |
| `INFORME-FASE-8.md` | Este informe |

**No avanzo a nada más hasta tu aprobación.**
