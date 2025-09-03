// middleware.ts (temporary)
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  console.log("[CANARY]", req.nextUrl.pathname, req.headers.get("user-agent"))
  const url = req.nextUrl.clone()
  url.pathname = "/device-check"
  return NextResponse.redirect(url)
}

export const config = { matcher: ["/((?!_next/|api|favicon.ico).*)"] }
