import { NextResponse, type NextRequest } from "next/server";
import { locales } from "@/lib/i18n";

// Aggiunge il prefisso lingua agli URL che non lo hanno: italiano sempre di default,
// l'inglese si sceglie con il pulsante EN.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;
  const url = request.nextUrl.clone();
  url.pathname = `/it${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
