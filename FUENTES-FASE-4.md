# PLASTINORTE — Fuentes del catálogo (Fase 4)

Consultado el **09/10/2026**. Este documento es interno: contiene precios de la competencia y no debe publicarse. Los mismos datos, en forma de código, están en [data/fuentes-productos.ts](data/fuentes-productos.ts), que ningún componente importa (se comprobó que no aparece en el build).

Convención: **[V]** verificado en la página del proveedor · **[1F]** verificado, pero en una sola fuente · **[P]** pendiente de confirmar con PLASTINORTE o con el proveedor.

## 1. Cómo se eligieron los modelos

Se buscaron fichas con medidas publicadas en proveedores peruanos (Grupo Logipack, Envases Industriales, Mallplast, Cilansac, BASA, ReyPlast, Polinplast) y se tomaron los formatos que aparecen repetidos. Es una selección por **oferta visible en el mercado**, no por volumen de ventas: no hay cifras de ventas públicas.

Los nombres de los productos son genéricos (por tipo y medida). No se usaron nombres comerciales ni fotos de ninguna marca.

## 2. Productos y estado de sus datos

| # | Producto | Medidas | Fuentes de las medidas | Estado |
|---|---|---|---|---|
| 1 | Jaba cosechera calada 52×36×31 | 52×36×31 cm; 42 L; 25 kg | Logipack, Envases Industriales, Mallplast (BASA 8954) | **[V]** 3 fuentes (varían ±0,5 cm) |
| 2 | Jaba agrícola caña baja 60×40×21 | 60×40×21 cm | Logipack, Envases Industriales, ReyPlast | **[V]** 3 fuentes. Capacidad no publicada: 34,3 L en dos fuentes (60,2×40,2×21,2) y 36 L en Polinplast; no se muestra |
| 3 | Jaba cosechera cerrada 52×36×31 | 52×36×31 cm | Logipack (variante cerrada) | **[1F]**. El modelo cerrado de Polinplast mide 51,4×34,8×30,4: existe, pero no es equivalente |
| 4 | Jaba para pescado 70×40×24 | 70×40×24 cm; 40 L; 28 kg | Logipack, Cilansac (mod. GB), Mallplast (Zeus II: 70×40,5×24) | **[V]** 3 fuentes |
| 5 | Caja para alimentos con tapa 62×41×22 | 61,7×41,5×22 cm; 38 L | BASA (ficha del fabricante) | **[1F]** |
| 6 | Caja industrial cerrada PP (4 tamaños) | 50×40×20, 50×40×41, 77×47×28, 80×50×32 | Logipack | **[1F]**. Busqué una segunda fuente y no apareció |
| 7 | Caja cerrada con tapa 54×39×31 | 54,3×38,7×31,2 cm | Logipack | **[1F]**. Busqué una segunda fuente y no apareció |

**Lo que NO está verificado en ningún producto [P]:** que PLASTINORTE fabrique ese modelo; su peso, material exacto (virgen/reciclado, aditivo UV) y colores; su disponibilidad. Por eso `confirmacionEmpresa: "pendiente"` en los 7 y la web dice «medidas nominales, se confirman al cotizar». No se afirma en la web que sea virgen, que tenga protección UV ni que sea apto para contacto alimentario.

**No hay jaba panadera.** No encontré ninguna ficha peruana con medidas de una jaba para pan (los resultados eran paneras domésticas, cajas de pan españolas en PP de 60×40×41 y modelos BASA con tapa). La categoría existe en los filtros con el aviso «aún no publicamos un modelo» y botón de WhatsApp. Hace falta que PLASTINORTE diga si fabrica una y con qué medidas.

Tampoco entró la jaba para pollo: BASA la publica a 70,5×41,2×23,6 cm, prácticamente igual a la de pescado, y las demás fichas no traen medidas.

## 3. Precios

> **Estado desde el 09/10/2026: ningún precio está publicado.** Los tres precios de la tabla se calcularon y verificaron, pero no se muestran en el sitio: se desconocen el costo y el margen de PLASTINORTE y los precios de referencia son de un intermediario en línea. Todos los productos dicen «Consultar precio» o «Cotizar por volumen». Para volver a publicar uno, ver el comentario al inicio de `data/productos.ts`: se cambia su `precio` a `referencial` y el validador comprueba que siga entre un 5 % y un 8 % por debajo de la referencia.

Regla del encargo: entre un 5 % y un 8 % por debajo de un producto **realmente equivalente** con precio publicado. El script `npm run validar` falla el build si un precio queda fuera de ese rango o no tiene referencia.

| Producto | Referencia usada (precio publicado) | Medidas de la referencia | Precio PLASTINORTE | Descuento |
|---|---|---|---|---|
| Cosechera calada 52×36×31 | BASA «Caja cosechera blindada (PEAD)» cód. 8954, en Mallplast: **S/ 35,52** | 52,2×36,2×31,8 | **S/ 33,20** | 6,5 % |
| Caña baja 60×40×21 | Polinplast «Caja agrícola caña baja piso cal. P21 100 % virgen» cód. T0068200T, en Mallplast: **S/ 29,28** | 60×40×21 (36 L) | **S/ 27,40** | 6,4 % |
| Pescado 70×40×24 | Polinplast «Caja de pescado Zeus II s/hueco» cód. T0679000T, en Mallplast: **S/ 45,91** | 70×40,5×24 (40 L) | **S/ 42,90** | 6,6 % |

Los otros cuatro productos salen como **«Consultar precio»** o **«Cotizar por volumen»**, porque no hallé un producto equivalente con precio:

- Cosechera cerrada: el único precio visible (Polinplast S/ 39,50) es de un modelo 1,2 cm más pequeño.
- Caja para alimentos con tapa (BASA): Mallplast la vende a S/ 79,90 el cuerpo y S/ 45,90 la tapa, pero la ficha de Mallplast no trae el largo, y no puedo asegurar que sea el mismo conjunto.
- Caja industrial PP y caja con tapa precintable: sin precio publicado de medidas equivalentes.

**Advertencias sobre los precios [P]**

1. **Los precios de referencia son de un intermediario en línea (Mallplast), por unidad.** Mallplast no indica si incluyen IGV ni a partir de qué cantidad rige cada uno; los precios de ReyPlast/Urpi en la misma web traen escalas por volumen y los de estos tres no. La web de PLASTINORTE dice «por unidad, referencial, el IGV se confirma en la cotización».
2. **La equivalencia es por medidas y tipo, no por diseño.** No pude comprobar peso, espesor ni refuerzos. La «blindada» de BASA es una versión reforzada; si la de PLASTINORTE es más liviana, S/ 33,20 podría quedar por encima de lo que vale.
3. **El mercado es amplio.** Para 52×36×31 virgen hay precios desde S/ 29,40 (Urpi, 52,5×31,5×36, otra proporción) hasta S/ 45,50 (ReyPlast premium). Se tomó el modelo de medidas más parecidas, no el más barato ni el más caro.
4. **Un fabricante directo (Polinplast, en su propia tienda) pide más** por la Zeus II: S/ 49,90 frente a los S/ 45,91 de Mallplast. Se usó el valor más bajo para que el 5–8 % sea cierto contra ambos.
5. **Los precios de tiendas en línea cambian.** Revisar las tres referencias antes de publicar.
6. **Son precios de mercado, no de costo.** No sé el costo de PLASTINORTE: hay que confirmar que cada precio deja margen antes de publicar. Mientras tanto se puede poner cualquier producto en «Consultar precio» cambiando una línea.

## 4. Fotos

Ningún producto tiene foto propia. Estado en la web:

| Producto | Foto mostrada |
|---|---|
| Cosechera calada | Foto de banco (Pexels, Hami Durgut) rotulada «Imagen referencial» |
| Caña baja | Foto de banco (Unsplash, Romain Huneau) rotulada «Imagen referencial» |
| Pescado | Foto de banco (Unsplash, Ervins Ellins) rotulada «Imagen referencial» |
| Cosechera cerrada, caja con tapa, industrial PP, cerrada con tapa | Marcador «Foto pendiente» (no hay una foto de banco adecuada) |

Las fotos de banco son las ya registradas en [data/fotos.ts](data/fotos.ts) (licencias de Pexels y Unsplash, aptas para uso comercial) y salen en `/creditos`. Muestran jabas de tipo parecido, **no** los modelos con esas medidas; por eso el rótulo y el texto «Fotografía referencial» en la ficha. **Antes de publicar hay que fotografiar cada modelo** (fondo neutro, un ejemplar, 4:3). No se descargaron fotos de ningún proveedor: sus imágenes son de sus marcas.

## 5. Cómo editar

Todo está en [data/productos.ts](data/productos.ts), un bloque por producto: `nombre`, `categorias`, `precio`, `imagenes` (fotos propias en `public/productos/<slug>/`), `medidas`, `caracteristicas` y `disponibilidad`. Después, `npm run validar`. Para publicar solo los confirmados, `publicado: false` oculta un producto sin borrarlo.
