import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const isRestrictedRoute = req.nextUrl.pathname.startsWith('/missions') || req.nextUrl.pathname.startsWith('/sandbox');
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.startsWith('/admin-login');

  // Admin Route Protection
  if (isAdminRoute) {
    const isProduction = process.env.NODE_ENV === "production";
    const cookieName = isProduction ? "__Secure-admin-next-auth.session-token" : "admin-next-auth.session-token";
    
    const adminToken = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: cookieName
    });

    if (!adminToken || adminToken.type !== 'admin' || adminToken.isActive === false) {
      return NextResponse.redirect(new URL('/admin-login', req.url));
    }

    // Role-based access control for Teachers
    if (adminToken.role === 'TEACHER') {
      const superAdminOnlyPaths = ['/admin/teachers', '/admin/shop', '/admin/achievements', '/admin/aptitude', '/admin/logs'];
      const isSuperAdminPath = superAdminOnlyPaths.some(path => req.nextUrl.pathname.startsWith(path));
      if (isSuperAdminPath) {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }
    
    return NextResponse.next();
  }

  // Normal Protected Routes
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') || 
                           req.nextUrl.pathname.startsWith('/profile') || 
                           isRestrictedRoute;
                           
  if (isProtectedRoute) {
    const studentToken = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!studentToken || !studentToken.id) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (studentToken.isBanned) {
      return NextResponse.redirect(new URL('/login?error=suspended', req.url));
    }

    // Unverified protection
    if (!studentToken.isVerified && isRestrictedRoute) {
      return NextResponse.redirect(new URL('/dashboard?error=unverified', req.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/sandbox/:path*', '/missions/:path*', '/profile/:path*', '/admin/:path*'],
};
