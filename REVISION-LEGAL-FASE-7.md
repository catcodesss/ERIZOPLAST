# PLASTINORTE — Puntos a revisar antes de publicar el formulario de novedades

> **Esto no es asesoría legal.** Es la lista de lo que hay que revisar con un abogado (o contra el texto oficial en
> El Peruano) antes de recoger correos reales. La política de `/privacidad` es un **borrador**, marcado como tal en
> pantalla y fuera de los buscadores (`noindex`), con los datos que faltan señalados `[Por completar: …]`.

## Marco que se tuvo en cuenta

| Norma | Qué regula aquí | Cómo se verificó |
|---|---|---|
| **Ley N.° 29733**, Ley de Protección de Datos Personales | Consentimiento, deber de informar, derechos, banco de datos | Conocimiento general; **no** se leyó el texto oficial en esta fase |
| **D. S. N.° 016-2024-JUS**, nuevo reglamento de la Ley 29733 | Detalle de lo anterior, registro, flujo transfronterizo | Búsqueda: publicado el 30/11/2024 y vigente desde el 30/03/2025 según fuentes secundarias (estudios de abogados y prensa). **Verificar en el texto oficial** |
| **Ley N.° 28493** y su reglamento (D. S. 031-2005-MTC) | Correo comercial «no solicitado» (spam) | Búsqueda: fuentes secundarias y resoluciones de Indecopi. **Verificar el texto vigente y modificaciones** |
| Código de Protección y Defensa del Consumidor | Una fuente secundaria menciona una modificación reciente que amplía la prohibición del spam | Sin confirmar número ni alcance |

## Lo que el diseño ya intenta cumplir

- **Consentimiento previo, expreso y libre**: la casilla aparece **sin marcar**, es obligatoria para enviar y no condiciona nada más (cotizar por WhatsApp sigue funcionando sin ella).
- **Finalidad comercial a la vista**: está en la propia frase de la casilla («información comercial sobre su catálogo, nuevos productos y novedades»), no solo en la política.
- **Constancia del consentimiento**: cada aviso guarda fecha y hora (Lima), el texto literal aceptado y su versión (`data/consentimiento.ts`).
- **Minimización**: solo correo (obligatorio) y empresa (opcional). La IP se usa en memoria para el límite de intentos y no se guarda ni viaja en el aviso.
- **Sin registro de datos personales en logs**: el servidor solo anota códigos de estado (comprobado en las pruebas).
- **Cómo darse de baja y cómo ejercer derechos** están explicados en `/privacidad` (apartados 5 y 7).

## Para revisar, por prioridad

### Bloquea la publicación

1. **Titular del banco de datos**: razón social, RUC y domicilio (hoy `null` en `data/empresa.ts`). La política los necesita y no se inventan.
2. **Inscripción del banco de datos** («contactos comerciales») en el Registro Nacional de Protección de Datos Personales: confirmar si corresponde con el reglamento vigente y quién la tramita. La política lo deja como pendiente.
3. **Deber de informar** (la Ley exige informar, entre otras cosas, finalidad, destinatarios, titular del banco, transferencias, consecuencias de dar o negar los datos, plazo de conservación y derechos). Comprobar que `/privacidad` cubre **cada** punto exigido por la norma vigente; yo lo redacté de memoria.
4. **Flujo transfronterizo**: los datos pasan por **Resend** (empresa de EE. UU.), **Microsoft/Outlook** (buzón) y el **hosting** (por definir). Hay que confirmar los países de tratamiento y qué exige el reglamento (nivel adecuado o garantías contractuales, y si hay que comunicarlo a la autoridad).
5. **Encargados de tratamiento**: ¿hace falta un contrato o acuerdo de tratamiento de datos con Resend, Microsoft y el hosting? Resend publica sus términos de tratamiento de datos; revisarlos.
6. **Plazo de conservación**: la política dice «mientras no retires tu consentimiento» y deja pendiente qué se guarda tras la baja (p. ej. constancia mínima del consentimiento). Definirlo.

### Antes del primer envío comercial

7. **Ley 28493 (spam)**: según fuentes secundarias, un correo comercial debe llevar la palabra «PUBLICIDAD» al inicio del asunto, identificar al remitente (nombre y dirección) y ofrecer un mecanismo de baja que se respete en pocos días. Aunque quien se suscribe lo pidió expresamente (lo que, de entrada, lo aleja del correo «no solicitado»), conviene aplicarlo igual. **Confirmar requisitos y plazos exactos.**
8. **Procedimiento de bajas**: hoy la baja es por correo manual. La política promete que cada comunicación comercial indicará cómo darse de baja: **hay que cumplirlo** cuando existan envíos. Definir quién atiende las bajas y en cuánto tiempo (la política deja el plazo pendiente).
9. **Plazos de atención de derechos** (acceso, rectificación, cancelación, oposición): la política dice «dentro de los plazos que fija la norma» sin citar números porque no los verifiqué. Ponerlos tras la revisión.
10. **Indecopi — «Gracias… No insista»**: existe un registro de números y correos excluidos de publicidad. Comprobar si hay que consultarlo antes de enviar.

### Operativos

11. **Correo no corporativo**: los avisos llegan a una cuenta `@outlook.com` y la política la usa como contacto de privacidad. Pasar a un correo con dominio propio, con acceso controlado (los avisos son la prueba del consentimiento y contienen datos personales) y con copia de seguridad.
12. **Procedimiento interno** para atender solicitudes de derechos: registro de quién pidió qué, cuándo y qué se respondió.
13. **Medidas de seguridad documentadas**: el reglamento exige medidas técnicas y organizativas; la política describe solo las del sitio. Falta lo organizativo (accesos al buzón, cambios de clave, etc.).
14. **HTTPS**: la política afirma que la conexión va cifrada. Es cierto en cualquier hosting normal, pero verificar con el sitio publicado.
15. **Cookies y analítica**: la política afirma que no hay cookies de seguimiento ni analítica de terceros. Es cierto hoy en el código; **volver a comprobarlo con el sitio publicado** (y si algún día se añade analítica, cambiar la política y pedir consentimiento antes).
16. **Datos de personas en empresas**: un correo como `nombre.apellido@empresa.com` identifica a una persona y es dato personal aunque se use para fines de empresa. La política lo trata como tal.
17. **Libro de Reclamaciones y otros requisitos del sitio** (ya pendiente en `PLAN-FASE-1.md`): fuera del alcance de esta fase.

## Qué cambiar en el sitio cuando se resuelva

- Completar `razonSocial`, `ruc` y `direccion` en `data/empresa.ts` (la política los toma de ahí).
- Sustituir cada `<Pendiente>` de `app/privacidad/page.tsx` por el dato definitivo.
- Si cambia el texto de la casilla: subir `VERSION_CONSENTIMIENTO` en `data/consentimiento.ts` y revisar el apartado 4 de la política.
- Cuando un abogado dé el visto bueno: quitar `robots: { index: false }` y la etiqueta «Borrador» de `app/privacidad/page.tsx`.
