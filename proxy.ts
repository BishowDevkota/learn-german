import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const USER_PROTECTED = ["/dashboard", "/profile", "/settings"];
const ADMIN_PREFIX = "/admin";

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session;
  const role = session?.user?.role;
  const { pathname } = nextUrl;

  const needsUser = USER_PROTECTED.some((p) => pathname.startsWith(p));
  const needsAdmin = pathname.startsWith(ADMIN_PREFIX);

  if ((needsUser || needsAdmin) && !isLoggedIn) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (needsAdmin && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Authenticated users shouldn't see auth pages.
  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
