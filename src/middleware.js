import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function middleware(req) {
    const token = req.cookies.get('token')?.value;

    const { pathname } = req.nextUrl;

    // Define protected routes that require a valid token
    const protectedRoutes = ['/profile', '/book-session'];

    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

    if (isProtectedRoute) {
        if (!token) {
            // Unauthenticated: Redirect to login
            return NextResponse.redirect(new URL('/auth', req.url));
        }

        try {
            const verifiedToken = await verifyAuth(token);
            if (!verifiedToken) {
                return NextResponse.redirect(new URL('/auth', req.url));
            }
        } catch (error) {
            // Token verification failed or expired
            return NextResponse.redirect(new URL('/auth', req.url));
        }
    }

    // Allow access to other routes
    return NextResponse.next();
}

export const config = {
    // Matcher config to optimize middleware performance
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
