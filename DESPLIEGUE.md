# PLASTINORTE — Guía de uso y despliegue

Para quien administra el sitio. Todo está pensado para hacerse **sin saber programar a fondo**: se edita un archivo
de datos, se ejecuta una orden y se publica. Si algo falla, cada paso dice qué mirar.

**Índice:** [1. Ejecutarlo en tu computadora](#1-ejecutarlo-en-tu-computadora) ·
[2. Variables de entorno](#2-variables-de-entorno) · [3. Configurar WhatsApp](#3-configurar-whatsapp) ·
[4. Configurar el correo](#4-configurar-el-servicio-de-correos) · [5. Productos y precios](#5-modificar-productos-y-precios) ·
[6. Sustituir fotografías](#6-sustituir-fotografías) · [7. Publicarlo en Vercel](#7-publicarlo-en-vercel) ·
[Después de publicar](#después-de-publicar-lista-de-comprobación)

---

## 1. Ejecutarlo en tu computadora

**Necesitas** [Node.js 24](https://nodejs.org) (el proyecto lo exige: `node -v` debe decir `v24.x`).

```bash
npm install           # una sola vez: instala las dependencias
npm run dev           # abre http://localhost:3000 con recarga automática
```

Para ver el sitio **tal como se verá publicado** (más rápido, sin el aviso naranja de fases):

```bash
npm run build         # valida el catálogo y compila para producción
npm run start         # sirve la versión compilada en http://localhost:3000
```

| Comando | Para qué |
|---|---|
| `npm run typecheck` | Revisa los tipos (TypeScript) |
| `npm run lint` | Revisa el estilo del código |
| `npm run validar` | Comprueba `data/productos.ts` (también corre solo antes de cada `build`) |
| `npm run build && npm run probar` | Pruebas funcionales: WhatsApp, botones, enlaces, número oculto (42 comprobaciones) |
| `npm run build && npm run auditar` | Auditoría de seguridad: secretos, `.env`, cabeceras (16 comprobaciones) |
| `npm run probar:novedades` | Pruebas del formulario de novedades contra un Resend simulado (ver [CONFIGURACION-FASE-7.md](CONFIGURACION-FASE-7.md)) |
| `npm run build && npm run revisar` | Revisión comercial automática: fotos de banco rotuladas, nada inventado, cada página orienta a cotizar |
| `npm run medir -- http://localhost:3000/ movil` | LCP, CLS y TBT con un Chrome real, con el sitio en marcha (`npm run start`) |
| `npm run responsive -- http://localhost:3000` | Revisa todas las páginas en 12 anchos de pantalla, 320–1920 px (≈ 5 min) |
| `npm run probar:menu -- http://localhost:3000` | Navegación y menú móvil con un Chrome real |
| `npm run foto -- …` | Incorpora una foto propia (ver [sección 6](#6-sustituir-fotografías)) |

---

## 2. Variables de entorno

Las variables son los datos **secretos o que cambian según el entorno**. Nunca van en el código.

**En tu computadora:** copia `.env.example` a `.env.local` y rellénalo. `.env.local` está en `.gitignore`: no se sube
a GitHub ni a Vercel por error.

**En Vercel:** *Project → Settings → Environment Variables* (marca *Production*, *Preview* y *Development*).
Cada vez que cambies una variable, **vuelve a desplegar** (*Deployments → ⋯ → Redeploy*): no se aplica a despliegues ya hechos.

| Variable | ¿Obligatoria? | Qué es |
|---|---|---|
| `ERIZOPLAST_WHATSAPP_NUMBER` | **Sí** (sin ella los botones llevan al correo) | Número comercial con código de país y solo dígitos: `51` + 9 dígitos. Solo servidor. |
| `ERIZOPLAST_RESEND_API_KEY` | **Sí**, para el formulario de novedades | Clave de Resend (`re_…`). Solo servidor. Sin ella el formulario dice «aún no disponible» y no recoge nada. |
| `ERIZOPLAST_CONTACTO_DESTINO` | No | Quién recibe los avisos del formulario. Por defecto, `empresa.correo` de `data/empresa.ts`. |
| `ERIZOPLAST_CONTACTO_REMITENTE` | No | Remitente de los avisos. Por defecto `PLASTINORTE <onboarding@resend.dev>` (solo pruebas). |
| `NEXT_PUBLIC_SITE_URL` | **Recomendada** | Dirección pública del sitio, p. ej. `https://www.plastinorte.pe`. De aquí salen las canónicas, el sitemap y las vistas previas al compartir. En Vercel, si falta, se usa el dominio de producción del proyecto. |

> **Regla de oro:** si una variable lleva un secreto (clave, número), **nunca** le pongas el prefijo `NEXT_PUBLIC_`:
> todo lo que lo lleva termina en el JavaScript público. `npm run auditar` lo comprueba.

---

## 3. Configurar WhatsApp

1. Pon tu número en `ERIZOPLAST_WHATSAPP_NUMBER` (`.env.local` y Vercel): código de país + número, solo dígitos.
   Ejemplo para un celular de Lima: `51987654321`.
2. Prueba: `npm run dev`, abre <http://localhost:3000> y pulsa **Cotizar por WhatsApp**. Debe abrirse WhatsApp con el
   mensaje «Hola, estoy interesado en cotizar jabas plásticas…». En una ficha de producto, el mensaje ya nombra ese modelo.
3. Si el número falta o es inválido, el botón no se rompe: lleva al correo del pie.

**Cómo funciona y por qué no se ve el número.** Ningún botón, texto ni archivo público contiene el número. Todos los
botones apuntan a `/api/whatsapp`; esa ruta, que corre en el servidor, lee la variable y redirige a WhatsApp con un
mensaje ya escrito. Las pruebas (`npm run probar`) buscan el número en el código, el HTML, el JavaScript y lo
prerenderizado.

**Limitación inevitable.** El número queda oculto en la página, pero **no es secreto**: cuando el visitante abre WhatsApp,
lo ve en la aplicación (es necesario para que le escriba), y quien siga la redirección a mano —o un programa que lo haga—
puede leerlo en la dirección de destino (`wa.me/…`). Ninguna web puede evitarlo si el cliente debe poder escribirte.
Lo que sí se evita es que aparezca en el texto de la página, en el código fuente o en los buscadores, y que los
programas que recogen teléfonos de las páginas se lo lleven sin más. Si el número se filtrara, se cambia la variable y
se vuelve a desplegar.

---

## 4. Configurar el servicio de correos

El formulario «Conoce nuestras novedades y productos» envía **un aviso por correo** a la empresa por cada persona que lo
usa (con el consentimiento como constancia). Usa [Resend](https://resend.com). Resumen:

1. Crea una cuenta en Resend **con el mismo correo que recibirá los avisos** (hoy, dylan_cal@outlook.com).
2. *API Keys → Create API Key* con permiso «Sending access». Copia la clave (`re_…`).
3. Ponla en `ERIZOPLAST_RESEND_API_KEY` (`.env.local` y Vercel) y vuelve a desplegar.
4. Envía el formulario con tu propio correo y revisa la bandeja **y «Correo no deseado»**.

Sin dominio propio verificado en Resend solo se puede enviar al correo de la cuenta, y no se puede escribir a los
visitantes. Para eso, y para saber qué hace y qué no hace el formulario, lee **[CONFIGURACION-FASE-7.md](CONFIGURACION-FASE-7.md)**.
Antes de publicar, revisa **[REVISION-LEGAL-FASE-7.md](REVISION-LEGAL-FASE-7.md)** (política de privacidad).

---

## 5. Modificar productos y precios

Todo el catálogo está en **`data/productos.ts`**: un bloque por producto. No hay base de datos ni panel. Edita, guarda y
ejecuta `npm run validar` (también corre solo en cada `build`, y **el build falla si algo está mal**: es a propósito).

**Cambiar un dato** (nombre, resumen, usos, características, medidas, capacidad, carga, colores…): edita el campo.
Las categorías posibles están en `data/categorias.ts`.

**Producto nuevo:** copia un bloque entero, cambia su `slug` (da la dirección de su ficha: `/catalogo/<slug>`; solo
minúsculas, números y guiones) y sus datos. La ficha, la tarjeta, el botón de cotizar, el sitemap y la página de su
categoría se crean solos.

**Ocultar sin borrar:** `publicado: false`.

**Precios.** Por decisión del 09/10/2026 **ningún precio se publica** hasta que la empresa apruebe costo y margen: todos
dicen «Consultar precio». Para publicar uno:

```ts
precio: { tipo: "referencial", soles: 12.5, unidad: "por unidad" },
```

El sitio lo rotula siempre «referencial, sujeto a confirmación comercial». El validador exige que ese precio tenga su
producto equivalente en `data/fuentes-productos.ts` y quede entre un 5 % y un 8 % por debajo de él; si no, `npm run
validar` falla. (Ese archivo tiene precios de la competencia: **nunca** se importa desde el sitio.) Para volver a «Consultar
precio»: `precio: { tipo: "consultar", etiqueta: "Consultar precio" }` (o `"Cotizar por volumen"`).

**Confirmar un modelo.** Todos están en `confirmacionEmpresa: "pendiente"`: la web avisa «medidas referenciales» hasta que la
empresa confirme que fabrica ese modelo con esas medidas y material. Cuando lo confirme, cámbialo a `"confirmado"` (y
ajusta lo que difiera: medidas, colores, material).

---

## 6. Sustituir fotografías

Hoy **ninguna foto es propia**: las 10 de la portada son de bancos con licencia comercial (Pexels y Unsplash), están
rotuladas «Imagen referencial» y listadas en `/creditos`, y los modelos sin foto muestran un esquema con sus medidas.
Cuando tengas fotos propias:

### Fotos de la portada y de las secciones

```bash
npm run foto -- ids                                      # lista las fotos y su id
npm run foto -- sustituir hero-pasillo-jabas C:\fotos\planta.jpg --alt "Pasillo de la planta de PLASTINORTE con jabas apiladas"
npm run foto -- nueva  taller-moldes C:\fotos\moldes.jpg --alt "Moldes de inyección de la planta"
```

El script convierte la foto a JPG optimizado (hasta 2560 px de ancho), mide sus dimensiones, genera el placeholder y la
registra en `data/fotos.ts`. Una foto propia **deja de llevar el rótulo «Imagen referencial» y sale de `/creditos`**.
Reglas para que se vea profesional:

- **Mínimo 2400 px de ancho** para la portada y las fotos grandes; formato horizontal. Mejor con luz natural y la planta ordenada.
- **El texto `--alt` describe lo que se ve**, no el nombre del archivo. Es obligatorio.
- **No pongas una foto ajena como propia.** Si una foto no la hizo la empresa, no es «propia»: pide licencia o déjala como referencial.
- Cada sustitución usa un nombre de archivo nuevo (porque Next guarda las fotos optimizadas 31 días); el archivo anterior
  queda sin uso y puedes borrarlo de `public/fotos/`.
- Si el recorte no te gusta, cambia `posicion` donde se usa la foto (p. ej. `posicion="50% 30%"` en `components/inicio/*.tsx`).

### Fotos de un producto

```bash
npm run foto -- producto jaba-cosechera-calada-52x36x31 C:\fotos\cosechera.jpg
```

Guarda `public/productos/<slug>/01.webp` (1600 px) y te dice qué línea poner. En `data/productos.ts`, en ese producto:

```ts
imagenes: ["/productos/jaba-cosechera-calada-52x36x31/01.webp"],
// y borra la línea fotoReferencial: "..."
```

Repite el comando para más fotos (`02.webp`, `03.webp`…); la primera es la principal. Después, `npm run validar`.
Recomendado: fondo neutro y claro, la jaba entera, sin marcas ajenas visibles.

### Logo

El logotipo actual es **una propuesta tipográfica**, no el definitivo. Está en `components/marca/Logo.tsx` y `Simbolo.tsx` (el
símbolo es un SVG) y el ícono de la pestaña en `app/icon.svg`. Si la empresa tiene logo propio, se sustituyen ahí.

---

## 7. Publicarlo en Vercel

**Requisitos:** una cuenta en [vercel.com](https://vercel.com) y una en [GitHub](https://github.com) (o GitLab/Bitbucket).

### A. Subir el proyecto a GitHub (una vez)

El proyecto aún **no es un repositorio git**. Desde la carpeta del proyecto:

```bash
git init
git add .
git status          # comprueba que NO aparece .env.local (el .gitignore lo excluye)
git commit -m "PLASTINORTE: versión inicial"
```

Crea un repositorio **privado** vacío en GitHub y sigue sus instrucciones para `git remote add origin …` y `git push`.
Antes de empujar, repasa `git status`: no deben figurar `.env.local`, `.next/` ni `node_modules/`.

### B. Importarlo en Vercel

1. Vercel → **Add New… → Project** → elige el repositorio.
2. *Framework Preset*: Next.js (lo detecta). *Build Command*: el de siempre (`npm run build`). *Node.js Version*: **24.x** (el proyecto lo declara en `package.json`; el validador del catálogo lee TypeScript directamente y necesita Node 22.18 o superior, así que si tu cuenta no ofreciera 24.x, cambia `engines` a `">=22.18.0"`).
3. **Environment Variables:** añade las de la [sección 2](#2-variables-de-entorno) (al menos `ERIZOPLAST_WHATSAPP_NUMBER` y `ERIZOPLAST_RESEND_API_KEY`).
4. **Deploy.** En un par de minutos Vercel da una dirección `*.vercel.app`.

> Alternativa sin GitHub: con la [CLI de Vercel](https://vercel.com/docs/cli) (`npm i -g vercel`, luego `vercel` en la carpeta). La CLI respeta `.gitignore`: `.env.local` no se sube; las variables se cargan en el panel.

### C. Dominio propio

*Project → Settings → Domains → Add*. Vercel indica los registros DNS que debes crear en tu proveedor de dominio (A/CNAME).
Cuando el dominio funcione, **pon `NEXT_PUBLIC_SITE_URL=https://tu-dominio`** y vuelve a desplegar.
Con el dominio, además, puedes verificarlo en Resend y pasar a un correo con dominio propio (ver [CONFIGURACION-FASE-7.md](CONFIGURACION-FASE-7.md)).

### D. Qué ya está resuelto para Vercel

- Node 24 fijado en `package.json` (`engines`); el build valida el catálogo antes de compilar.
- Páginas estáticas (catálogo, fichas, categorías, contacto) servidas desde la red de Vercel; solo `/api/whatsapp` y `/api/novedades` corren como funciones.
- Imágenes optimizadas por Vercel (AVIF/WebP, caché de 31 días); fuentes alojadas por el propio sitio.
- Cabeceras de seguridad, `robots.txt`, `sitemap.xml` y la imagen para compartir se generan solos.
- `/sistema-diseno` (guía interna) responde 404 en producción.

---

## Después de publicar: lista de comprobación

- [ ] Abre la dirección pública y pulsa **Cotizar por WhatsApp**: debe abrir WhatsApp con tu número.
- [ ] Envía el formulario de novedades con tu correo y comprueba que llega el aviso (revisa «no deseado»).
- [ ] `https://tu-dominio/sitemap.xml` y `/robots.txt` muestran **tu dominio**, no `localhost`.
- [ ] Ver el código fuente de la portada (`Ctrl+U`) y buscar tu número: **no debe aparecer**.
- [ ] Alta en **Google Search Console** (verifica el dominio y envía `sitemap.xml`) y en **Google Business Profile** si hay local.
- [ ] Prueba cómo se ve el enlace compartido en WhatsApp (debe salir la tarjeta con el nombre de la marca).
- [ ] Revisa `/privacidad` con un abogado, completa los datos `[Por completar]` y entonces quita el `noindex` (ver [REVISION-LEGAL-FASE-7.md](REVISION-LEGAL-FASE-7.md)).
- [ ] Cuando la empresa confirme sus modelos y precios, actualiza `data/productos.ts` (sección 5).
- [ ] Para medir la velocidad real con tus visitantes: *Vercel → Analytics / Speed Insights* (opcional; hay que activarlo).

## Si algo falla

| Síntoma | Qué mirar |
|---|---|
| El build falla con un mensaje de catálogo | `npm run validar`: dice qué producto y qué campo (es el validador, a propósito) |
| Los botones de WhatsApp llevan al correo | `ERIZOPLAST_WHATSAPP_NUMBER` falta o no tiene entre 8 y 15 dígitos; vuelve a desplegar tras cambiarla |
| El formulario dice «aún no está disponible» | `ERIZOPLAST_RESEND_API_KEY` no está en Vercel (o falta redesplegar) |
| El formulario dice «No pudimos enviar tus datos» | Mira *Vercel → Logs*: se anota el código de Resend (ver CONFIGURACION-FASE-7.md) |
| Sitemap o canónicas con `localhost` | Falta `NEXT_PUBLIC_SITE_URL` fuera de Vercel; en el build sale un aviso `[sitio]` |
| Una foto nueva no cambia | Usa `npm run foto` (nombre de archivo nuevo); las fotos optimizadas se guardan 31 días |
