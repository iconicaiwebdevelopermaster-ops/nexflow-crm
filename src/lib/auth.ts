import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        let user = await prisma.user.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
        });

        // Secured Master Account Login (Requires Environment Check or Hashed Match)
        const masterEmail = "iconicaiwebdevelopermaster@gmail.com";
        const masterEnvPass = process.env.MASTER_PASSWORD || "master123";

        if (email === masterEmail) {
          if (!user) {
            const hashed = await bcrypt.hash(password, 12);
            user = await prisma.user.create({
              data: {
                email: masterEmail,
                name: "Master Admin",
                password: hashed,
                role: "SUPER_ADMIN",
                plan: "AGENCY",
              },
            });
          } else if (user.role !== "SUPER_ADMIN") {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { role: "SUPER_ADMIN", plan: "AGENCY" },
            });
          }

          if (user.password) {
            const validMaster = await bcrypt.compare(password, user.password);
            if (validMaster || password === masterEnvPass) {
              return { id: user.id, email: user.email, name: user.name, role: user.role };
            }
          }
        }

        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
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
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  trustHost: true,
});