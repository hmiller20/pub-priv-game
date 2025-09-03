// middleware.ts at repo root
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ASSET_EXT = /\.(svg|png|jpg|jpeg|gif|webp|ico|mp3|json|css|js|woff2?)$/i

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl

  // Skip APIs/assets/next internals
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    ASSET_EXT.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Always allow the checker page itself
  if (pathname.startsWith("/device-check") || pathname.startsWith("/desktop-only")) {
    return NextResponse.next()
  }

  // Require a cookie that proves client passed a width check
  const ok = req.cookies.get("desktop_ok")?.value === "1"
  if (!ok) {
    const url = req.nextUrl.clone()
    url.pathname = "/device-check"

    // preserve original dest + survey_code
    url.searchParams.set("next", pathname + (req.nextUrl.search || ""))
    const sc = searchParams.get("survey_code")
    if (sc) url.searchParams.set("survey_code", sc)

    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/|api|favicon.ico).*)"], // broad on purpose
}
