export type EnlaceNav = { etiqueta: string; href: string };

// Los anclajes (#nosotros, #fabricacion) apuntan a secciones de la portada.
export const navegacion: EnlaceNav[] = [
  { etiqueta: "Catálogo", href: "/catalogo" },
  { etiqueta: "Nosotros", href: "/#nosotros" },
  { etiqueta: "Fabricación", href: "/#fabricacion" },
  { etiqueta: "Contacto", href: "/contacto" },
];

export const navegacionLegal: EnlaceNav[] = [
  { etiqueta: "Política de privacidad", href: "/privacidad" },
  { etiqueta: "Créditos de imágenes", href: "/creditos" },
];
