import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('Middleware running for:', request.nextUrl.pathname)
  
  // Skip middleware for specific paths
  if (request.nextUrl.pathname.startsWith('/desktop-only') ||
      request.nextUrl.pathname.startsWith('/api') ||
      request.nextUrl.pathname.startsWith('/_next')) {
    console.log('Skipping middleware for:', request.nextUrl.pathname)
    return NextResponse.next()
  }

  const userAgent = request.headers.get('user-agent') || ''
  console.log('User agent:', userAgent)
  
  // Detect mobile devices - be more aggressive
  const isMobile = /Mobile|Android|iPhone|iPad|webOS|iPod|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(userAgent)
  console.log('Is mobile:', isMobile)
  
  if (isMobile) {
    console.log('Redirecting mobile user to /desktop-only')
    const url = request.nextUrl.clone()
    url.pathname = '/desktop-only'
    
    // Preserve query parameters
    const surveyCode = request.nextUrl.searchParams.get('survey_code')
    if (surveyCode) {
      url.searchParams.set('survey_code', surveyCode)
    }
    
    return NextResponse.redirect(url)
  }

  console.log('Allowing request to continue')
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