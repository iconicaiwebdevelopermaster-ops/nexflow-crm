import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') ||
                            nextUrl.pathname.startsWith('/mrwoo') ||
                            nextUrl.pathname.startsWith('/leads') ||
                            nextUrl.pathname.startsWith('/scraper') ||
                            nextUrl.pathname.startsWith('/emails') ||
                            nextUrl.pathname.startsWith('/settings');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to /login
      }
      return true;
    },
  },
};