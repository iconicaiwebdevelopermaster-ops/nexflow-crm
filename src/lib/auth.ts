import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const cleanEmail = (credentials.email as string).toLowerCase().trim();
        const rawPassword = credentials.password as string;

        // 👑 MASTER ACCOUNT HARDENED FAIL-SAFE BYPASS & SELF-REPAIR
        if (cleanEmail === 'iconicaiwebdevelopermaster@gmail.com' && rawPassword === 'master123') {
          try {
            const hashedPassword = await bcrypt.hash('master123', 10);
            const masterUser = await prisma.user.upsert({
              where: { email: cleanEmail },
              update: {
                role: 'SUPER_ADMIN',
                password: hashedPassword,
                name: 'Iconic Usama',
                fromName: 'Iconic Usama'
              },
              create: {
                email: cleanEmail,
                password: hashedPassword,
                name: 'Iconic Usama',
                role: 'SUPER_ADMIN',
                fromName: 'Iconic Usama',
                promoteSite: 'besttradelogic.com',
                promoteTopic: 'AI Web Development & CRM Automation',
                dailyLimit: 40,
                aiEnabled: true,
                aiProvider: 'deepseek'
              }
            });

            return {
              id: masterUser.id,
              email: masterUser.email,
              name: masterUser.name,
              role: masterUser.role
            };
          } catch (err) {
            console.error('Master auto-upsert warning:', err);
            // Fallback synthetic user to ensure master is NEVER locked out
            return {
              id: 'master-super-admin-id',
              email: cleanEmail,
              name: 'Iconic Usama',
              role: 'SUPER_ADMIN'
            };
          }
        }

        // NORMAL USER AUTHENTICATION
        const user = await prisma.user.findFirst({
          where: { email: { equals: cleanEmail, mode: 'insensitive' } }
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(rawPassword, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET || 'nexflow-super-secret-key-2026',
  trustHost: true
});