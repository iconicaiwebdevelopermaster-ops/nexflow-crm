import { auth } from "@/auth";

export default auth((req) => {
  const path = req.nextUrl.pathname;

  const publicPaths = ["/login", "/api/auth", "/api/scraper", "/api/cron", "/_next", "/favicon"];
  const isPublic = publicPaths.some((p) => path.startsWith(p));
  if (isPublic) return;

  const protectedPrefixes = [
    "/dashboard", "/scraper", "/settings",
    "/tasks", "/templates", "/compose",
    "/emails", "/email-history", "/pipeline"
  ];
  const isProtected = protectedPrefixes.some((p) => path.startsWith(p));

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};