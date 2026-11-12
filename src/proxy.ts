import { NextResponse, type NextRequest } from "next/server";
import { locales } from "@/lib/i18n";

// Aggiunge il prefisso lingua (/it o /en) agli URL che non lo hanno.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;
  const lang = request.headers.get("accept-language")?.toLowerCase().startsWith("en") ? "en" : "it";
  const url = request.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
