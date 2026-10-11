// GENERADO por scripts/agregar-foto.mjs (dimensiones y placeholders reales): no lo edites a mano para añadir o
// sustituir fotos, usa el script (ver DESPLIEGUE.md, «Sustituir fotografías»). /creditos se genera de este fichero.
//
// TODAS son imágenes REFERENCIALES de bancos con licencia de uso comercial (Pexels y Unsplash).
// Ninguna muestra instalaciones, productos ni flota de PLASTINORTE: la interfaz las rotula así
// y ningún texto cercano debe sugerir lo contrario. Sustituir por fotos propias cuando existan.

// "Propia": foto hecha por PLASTINORTE. No lleva el rótulo «Imagen referencial» ni aparece en /creditos.
export type LicenciaFoto = "Pexels" | "Unsplash" | "Propia";

export type Foto = {
  src: string;
  ancho: number;
  alto: number;
  alt: string;
  /** Placeholder diminuto en base64 mientras carga la imagen (vacío = sin placeholder). */
  blur: string;
  autor: string;
  licencia: LicenciaFoto;
  licenciaUrl: string;
  fuenteUrl: string;
};

/** ¿La hizo PLASTINORTE? Recibe el tipo ancho `Foto`: así compila aunque hoy ninguna entrada sea «Propia». */
export const esFotoPropia = (foto: Foto): boolean => foto.licencia === "Propia";

export const fotos = {
  "hero-pasillo-jabas": {
    "src": "/fotos/hero-pasillo-jabas.jpg",
    "ancho": 2560,
    "alto": 1706,
    "alt": "Pasillo entre pilas de jabas plásticas de colores en un almacén",
    "blur": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAQABgDASIAAhEBAxEB/8QAGAAAAgMAAAAAAAAAAAAAAAAAAAUDBAb/xAAfEAACAgMAAgMAAAAAAAAAAAABAgMRAAQhEnEiQtH/xAAVAQEBAAAAAAAAAAAAAAAAAAADAP/EABoRAAICAwAAAAAAAAAAAAAAAAABERICA0H/2gAMAwEAAhEDEQA/AGcWtFuarLIFZZB8heZrb15tSVoLDBTQYnrD1hpbTSh41C0osdqyKrLMunSebyOznvO9w8ddelaRa8HksZegA1e8Mg2GZCAV8u/b8wxkE5P/2Q==",
    "autor": "Bence Szemerey",
    "licencia": "Pexels",
    "licenciaUrl": "https://www.pexels.com/license/",
    "fuenteUrl": "https://www.pexels.com/photo/corridor-between-piles-of-containers-in-storehouse-7513430/"
  },
  "agricola-jabas-caladas": {
    "src": "/fotos/agricola-jabas-caladas.jpg",
    "ancho": 1600,
    "alto": 2404,
    "alt": "Pila de jabas plásticas caladas amarillas, verdes y azules",
    "blur": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAkABgDASIAAhEBAxEB/8QAGgAAAgMBAQAAAAAAAAAAAAAAAAUCAwQBBv/EACcQAAICAQQABAcAAAAAAAAAAAECAAMRBBIhMQVBQnETUWKBktHh/8QAGAEAAwEBAAAAAAAAAAAAAAAAAQIDBAD/xAAfEQACAgEEAwAAAAAAAAAAAAAAAgEDERIhMVEiQVL/2gAMAwEAAhEDEQA/AEY0tg5+Ax9mElXUtuVsLV7Tkhj37R3mkqc4I2/UYmo1RS24AIQW9TYxgSC2M8TgLVIswWPc7WKKhciV8ZHO4QmhdU3kafzhKa7PkXCdm2lmyg2oPLofuJaKbGuuKOqg2YORmQXU28ZvaNfDbtANLWLjmzkNlM55P8nV0PXmZ3C1qvtwc0mmvscqtyjBx0ITZVqdHWxcZCknDbT9oSmG6E8OzzC9yzSk8c+owhNXuDPPEl6FtoO4/PoQhCGYEzuf/9k=",
    "autor": "Romain Huneau",
    "licencia": "Unsplash",
    "licenciaUrl": "https://unsplash.com/license",
    "fuenteUrl": "https://unsplash.com/photos/yellow-and-blue-plastic-crates-LsgJpG-gbAY"
  },
  "pesca-jabas-verdes": {
    "src": "/fotos/pesca-jabas-verdes.jpg",
    "ancho": 1600,
    "alto": 2400,
    "alt": "Pila de jabas plásticas verdes junto a una puerta azul",
    "blur": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAkABgDASIAAhEBAxEB/8QAGQABAQEBAQEAAAAAAAAAAAAAAAUDBAEG/8QAJhAAAQQBBAEDBQAAAAAAAAAAAQACAxEEEiExURQjMjRCcXLB4f/EABcBAAMBAAAAAAAAAAAAAAAAAAMEBQL/xAAcEQACAwADAQAAAAAAAAAAAAAAAgEDERMUMSH/2gAMAwEAAhEDEQA/AMm4TpbAlquwuaUGKV0ZNlpq+1YxzKXOrJlGw+r+KRmk+bNqcXHVyTdpmixnbGJ71qsfJ0z1HtF5aJsAW8fZztzwFHzvnTfkr8DMcl3qPbxy1R86BvmzFji4F3VKfS8LOybrrZpnDkBRati33FD7omudAvXc+hxQyUvuNoqvbY/akZtebLQoatgiKcvoeiI9M2tGtEREGT//2Q==",
    "autor": "Carsten Ruthemann",
    "licencia": "Pexels",
    "licenciaUrl": "https://www.pexels.com/license/",
    "fuenteUrl": "https://www.pexels.com/photo/colorful-stack-of-fishing-crates-by-blue-door-32367333/"
  },
  "industrial-cerrada-azul": {
    "src": "/fotos/industrial-cerrada-azul.jpg",
    "ancho": 2000,
    "alto": 1333,
    "alt": "Detalle de jabas plásticas azules apiladas",
    "blur": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAQABgDASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAAAwAEBf/EACIQAAEEAgIBBQAAAAAAAAAAAAECAxESACEEMSIzQVFhcf/EABYBAQEBAAAAAAAAAAAAAAAAAAQAAf/EABcRAQEBAQAAAAAAAAAAAAAAAAABIRH/2gAMAwEAAhEDEQA/AObw2kO3SukSPJftrF5LDbTTla6IEpzKyp1QVRykEEiszjuF0NrK3Lb2I7PzjOaBaAI9IKE9SCPvLETJUwgGsxuP3LNV1//Z",
    "autor": "Jan van der Wolf",
    "licencia": "Pexels",
    "licenciaUrl": "https://www.pexels.com/license/",
    "fuenteUrl": "https://www.pexels.com/photo/close-up-of-blue-crates-24517725/"
  },
  "catalogo-jabas-encajables": {
    "src": "/fotos/catalogo-jabas-encajables.jpg",
    "ancho": 1600,
    "alto": 2400,
    "alt": "Contenedores plásticos rojos, azules y amarillos encajados en fila",
    "blur": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAkABgDASIAAhEBAxEB/8QAGAABAQEBAQAAAAAAAAAAAAAAAAQFAQP/xAAmEAACAQQABAcBAAAAAAAAAAABAgMABBEhEhMiMQUyQWFxgcGR/8QAFwEBAQEBAAAAAAAAAAAAAAAABAMFBv/EAB4RAAICAgMBAQAAAAAAAAAAAAECAAMEIRESMYGR/9oADAMBAAIRAxEAPwDFXxBOeMR776fINdN9EZkBhMZPfqzj6qazEVxcNxRgE+VQdZqyK2jmlAkixg4B4jnFKrqJPdNSdmRwvR9gSpCkt0rcvDE582jSqobZYpk5MaCE9u5IP9pWXdkqrkMNxFdZZQQdTFFtAi5hkJwdnBP5V0FyiRPK8YlZR1MpwT71nxrKGaIBuIHagetVQo8enTTZBB9RSFyHQ6ixgV3Ag/J7r42IFWVYH4T2yy7+qVm3dgwkUxEcD9snH180qlgS09mAMzFqNPKbH7NCDqngc+Z48t87H5VlyAYj7bpSiN7Oho8ElUCQrG20fRH780pSqISBI5aguCRP/9k=",
    "autor": "Ervins Ellins",
    "licencia": "Unsplash",
    "licenciaUrl": "https://unsplash.com/license",
    "fuenteUrl": "https://unsplash.com/photos/a-row-of-plastic-bins-sitting-next-to-each-other-FoVgLfLHcng"
  },
  "sobre-almacen-soleado": {
    "src": "/fotos/sobre-almacen-soleado.jpg",
    "ancho": 2400,
    "alto": 1500,
    "alt": "Jabas plásticas apiladas en un almacén con luz de sol",
    "blur": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAPABgDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAMEBf/EACAQAAICAgICAwAAAAAAAAAAAAECAxEABBIxBVEUIUH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABYRAQEBAAAAAAAAAAAAAAAAAAARAf/aAAwDAQACEQMRAD8Ahh0pNsmKIc0IpiGANfXvIZdeTUcxTqVu6vHLtxbE3Lcd1B7ZFF46d/Hoo+JNNK3qSMccUmax50br0f3DLdkvtVwiijI74CrwxUmv/9k=",
    "autor": "Marek Piwnicki",
    "licencia": "Pexels",
    "licenciaUrl": "https://www.pexels.com/license/",
    "fuenteUrl": "https://www.pexels.com/photo/sunlit-storage-crates-in-industrial-warehouse-33149702/"
  },
  "transporte-camion-ruta": {
    "src": "/fotos/transporte-camion-ruta.jpg",
    "ancho": 2400,
    "alto": 1657,
    "alt": "Camión de carga blanco circulando por una carretera al atardecer",
    "blur": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAARABgDASIAAhEBAxEB/8QAGQABAQADAQAAAAAAAAAAAAAAAAUBAwYE/8QAJhAAAQQBAgQHAAAAAAAAAAAAAgABAxEEBRITIUJxFDEyM0FScv/EABcBAAMBAAAAAAAAAAAAAAAAAAIDBAH/xAAaEQEBAAIDAAAAAAAAAAAAAAAAAQMxERIh/9oADAMBAAIRAxEAPwDoAmjkHcJM7LzvqeIMhBJM0bt9mq+ykx5EADy43L4JvNYlz4HG3xYD/W5KmS3fDbIpPrenbq8UPenpFz0zYk8jnUcV9AjbMiLvQ+KPWS0ZXtmiKGbMRz9aIiqKf//Z",
    "autor": "Artem Balashevsky",
    "licencia": "Unsplash",
    "licenciaUrl": "https://unsplash.com/license",
    "fuenteUrl": "https://unsplash.com/photos/a-white-semi-truck-driving-down-a-rural-road-ZhNYKwjRMh4"
  },
  "transporte-camion-atardecer": {
    "src": "/fotos/transporte-camion-atardecer.jpg",
    "ancho": 1600,
    "alto": 2399,
    "alt": "Camión de carga blanco en carretera con el cielo del atardecer",
    "blur": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAkABgDASIAAhEBAxEB/8QAGAABAQEBAQAAAAAAAAAAAAAAAAUEAgP/xAAjEAABBAEEAQUAAAAAAAAAAAABAAIDEXEEEiExBQZCYaHC/8QAFwEBAQEBAAAAAAAAAAAAAAAAAgABA//EABkRAQEBAAMAAAAAAAAAAAAAAAABEgIDEf/aAAwDAQACEQMRAD8ApPg2MLttrHJAbs9kqtrAN2naPdJ+SvGSMfaW5QnX4hyw95Rbpo+8lFaixUk+V1DZBqJAHOa7kNHxS7PqKxZpuQVKddEWQcrO9jzVkcIXjHXViw7zIkFCRgOCiiNaWus8orLN1pJ4C4JREhrhyIi0X//Z",
    "autor": "Caleb Ruiter",
    "licencia": "Unsplash",
    "licenciaUrl": "https://unsplash.com/license",
    "fuenteUrl": "https://unsplash.com/photos/white-freight-truck-on-road-during-daytime-EmEQ6kK_5P0"
  },
  "distribucion-almacen": {
    "src": "/fotos/distribucion-almacen.jpg",
    "ancho": 2400,
    "alto": 1600,
    "alt": "Gran centro de distribución con estanterías y mercadería",
    "blur": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAQABgDASIAAhEBAxEB/8QAGAAAAgMAAAAAAAAAAAAAAAAAAAQBAwX/xAAjEAACAQMEAQUAAAAAAAAAAAABAgMAERIhMUGRBAUTImFx/8QAFwEAAwEAAAAAAAAAAAAAAAAAAAECA//EABkRAAMBAQEAAAAAAAAAAAAAAAABAhEDMf/aAAwDAQACEQMRAD8Ag+nxR42YXF9WHXNL+7KHKvM4CnZTa3VXrK0DYS4kafPi1MPg0ZZsMCdNibflYV1x5hcyZrqjgl5r/dtqKbm8WGOF5Jo1UcYMb7dUU1e+A0kf/9k=",
    "autor": "Adrian Sulyok",
    "licencia": "Unsplash",
    "licenciaUrl": "https://unsplash.com/license",
    "fuenteUrl": "https://unsplash.com/photos/yellow-and-white-plastic-box-lot-sczNLg6rrhQ"
  },
  "cta-jabas-naranjas": {
    "src": "/fotos/cta-jabas-naranjas.jpg",
    "ancho": 1600,
    "alto": 2400,
    "alt": "Pared de jabas plásticas naranjas apiladas",
    "blur": "data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAkABgDASIAAhEBAxEB/8QAGAABAQEBAQAAAAAAAAAAAAAAAAIDAQT/xAAiEAACAgICAQUBAAAAAAAAAAABAgARAxIhQQQTJDFRcYH/xAAYAQACAwAAAAAAAAAAAAAAAAAAAQIDBf/EABoRAAIDAQEAAAAAAAAAAAAAAAABAhExEiH/2gAMAwEAAhEDEQA/APDmIKrXPIlequ+oI2FWL/JmxXVdaq+pZVNyyhb++5m0attYZ4nrO3zYqJzCyjymDEVxEUtwOgzKyKVIIvqDjQZS4FEzMuCFr7lUFyFgzc9E8SdENJxAHzWHwDUTPG3u3/kRTXuhGzjsSo/ZzdlzFdrBF0eoiXIrkRiN+U0REckhRbP/2Q==",
    "autor": "Hami Durgut",
    "licencia": "Pexels",
    "licenciaUrl": "https://www.pexels.com/license/",
    "fuenteUrl": "https://www.pexels.com/photo/stacked-orange-plastic-crates-in-warehouse-33906404/"
  }
} satisfies Record<string, Foto>;

export type IdFoto = keyof typeof fotos;
