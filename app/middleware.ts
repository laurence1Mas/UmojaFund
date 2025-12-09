import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// JWT secret pour vérifier les tokens (devrait être dans .env)
const JWT_SECRET = process.env.JWT_SECRET || 'umojafund-secret-key-change-in-production';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('umoja_token')?.value;
  const { pathname } = request.nextUrl;

  // Routes protégées
  const protectedRoutes = ['/dashboard', '/profile', '/settings', '/projects/create', '/wallet'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Routes d'authentification (quand on est déjà connecté)
  const authRoutes = ['/auth/login', '/auth/register'];
  const isAuthRoute = authRoutes.includes(pathname);

  // Headers de sécurité (à conserver)
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CORS pour développement
  const origin = request.headers.get('origin');
  if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Redirection si non authentifié sur une route protégée
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirection si déjà authentifié sur une route d'authentification
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/auth/login',
    '/auth/register',
    '/api/auth/:path*',
    '/projects/create',
    '/wallet/:path*',
  ],
};