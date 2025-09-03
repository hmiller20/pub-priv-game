import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Enhanced mobile detection regex that's more comprehensive
const MOBILE_REGEX = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i

const MOBILE_REGEX_SHORT = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl
  
  // Only guard study pages - allow API routes, static assets, etc.
  const isStudyPage = 
    pathname === "/" ||
    pathname.startsWith("/survey") ||
    pathname.startsWith("/queue") ||
    pathname.startsWith("/waitingRoom") ||
    pathname.startsWith("/loading") ||
    pathname.startsWith("/1/") ||
    pathname.startsWith("/2/") ||
    pathname.startsWith("/code") ||
    pathname.startsWith("/avatar")

  // Don't guard the desktop-only page itself or non-study pages
  if (!isStudyPage || pathname.startsWith("/desktop-only")) {
    return NextResponse.next()
  }

  const ua = req.headers.get("user-agent") || ""
  
  // More comprehensive mobile detection
  const isMobile = /Mobile|Android|iP(hone|od|ad)|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)

  // Check if it's a mobile device
  if (isMobile || MOBILE_REGEX.test(ua) || MOBILE_REGEX_SHORT.test(ua.substr(0, 4))) {
    const url = req.nextUrl.clone()
    url.pathname = "/desktop-only"
    
    // Preserve survey_code if present for when they return on desktop
    const surveyCode = searchParams.get("survey_code")
    if (surveyCode) {
      url.searchParams.set("survey_code", surveyCode)
    }
    
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|json)$).*)",
  ],
}