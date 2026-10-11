// Datos estructurados (JSON-LD) para buscadores. Solo declara lo que el sitio ya muestra al público: nombre,
// descripción, correo, zona y cobertura. No lleva teléfono (el número no se publica), precios ni certificaciones.

export function DatosEstructurados({ datos }: { datos: Record<string, unknown> }) {
  // `<` escapado: un dato con «</script>» no puede cerrar la etiqueta ni inyectar HTML.
  const json = JSON.stringify(datos).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
