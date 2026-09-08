import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'nexflow-super-secret-key-2026',
  providers: [],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtected = nextUrl.pathname.startsWith('/dashboard') ||
                            nextUrl.pathname.startsWith('/mrwoo') ||
                            nextUrl.pathname.startsWith('/leads') ||
                            nextUrl.pathname.startsWith('/scraper') ||
                            nextUrl.pathname.startsWith('/emails') ||
                            nextUrl.pathname.startsWith('/settings');

      if (isOnProtected) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to /login
      }
      return true;
    },
  },
};