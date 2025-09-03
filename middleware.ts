import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip middleware for specific paths
  if (request.nextUrl.pathname.startsWith('/desktop-only') ||
      request.nextUrl.pathname.startsWith('/api') ||
      request.nextUrl.pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  const userAgent = request.headers.get('user-agent') || ''
  
  // Simple but effective mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  
  if (isMobile) {
    const url = request.nextUrl.clone()
    url.pathname = '/desktop-only'
    
    // Preserve query parameters
    const surveyCode = request.nextUrl.searchParams.get('survey_code')
    if (surveyCode) {
      url.searchParams.set('survey_code', surveyCode)
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