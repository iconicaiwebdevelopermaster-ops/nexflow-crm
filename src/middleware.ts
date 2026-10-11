import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;

  const protectedPrefixes = [
    "/dashboard",
    "/leads",
    "/settings",
    "/compose",
    "/scraper",
    "/templates",
    "/tasks",
    "/email-history",
    "/onboarding",
    "/mrwoo",
  ];

  const isProtected = protectedPrefixes.some((p) => path.startsWith(p));

  if (isProtected && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};