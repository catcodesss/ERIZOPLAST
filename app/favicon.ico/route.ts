import { NextResponse, type NextRequest } from "next/server";

// Los navegadores y los rastreadores piden /favicon.ico por costumbre aunque la página declare su ícono (aquí,
// /icon.svg): sin esta ruta cada visita deja un 404 en los registros. Se redirige al ícono real.
export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/icon.svg", request.url), 308);
}
