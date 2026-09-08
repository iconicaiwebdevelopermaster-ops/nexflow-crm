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
      
      // Ensure we only care about protected paths
      const protectedPaths = ['/dashboard', '/mrwoo', '/leads', '/scraper', '/emails', '/settings', '/tasks', '/templates'];
      const isProtected = protectedPaths.some(path => nextUrl.pathname.startsWith(path));

      if (isProtected) {
        if (isLoggedIn) return true;
        return false; // Auth.js will handle redirect to /login
      }
      return true;
    },
  },
};