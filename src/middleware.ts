import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Allow public routes
  const publicPaths = ["/login", "/api/auth", "/api/scraper", "/api/cron", "/_next", "/favicon"];
  const isPublic = publicPaths.some((p) => path.startsWith(p));
  if (isPublic) return NextResponse.next();

  // Protect dashboard routes
  const protectedPrefixes = [
    "/dashboard", "/scraper", "/settings",
    "/tasks", "/templates", "/compose",
    "/emails", "/email-history", "/pipeline"
  ];
  const isProtected = protectedPrefixes.some((p) => path.startsWith(p));

  if (isProtected) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};