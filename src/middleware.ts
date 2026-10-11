import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const protectedPrefixes = [
    "/dashboard",
    "/scraper",
    "/settings",
    "/tasks",
    "/templates",
    "/compose",
    "/emails",
    "/email-history",
    "/pipeline"
  ];

  const isProtected = protectedPrefixes.some((prefix) => path.startsWith(prefix));

  if (isProtected) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || "nexflow_crm_fallback_secret_32chars",
    });

    if (!token && process.env.NODE_ENV === "production") {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/scraper/:path*",
    "/settings/:path*",
    "/tasks/:path*",
    "/templates/:path*",
    "/compose/:path*",
    "/emails/:path*",
    "/email-history/:path*",
    "/pipeline/:path*"
  ],
};