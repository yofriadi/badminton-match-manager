import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPath = pathname.startsWith("/admin");
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  try {
    const res = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
      headers: { cookie: request.headers.get("cookie") || "" },
    });
    const session = await res.json();

    const isVerified = Boolean(session?.user?.emailVerified);

    // Redirect verified users away from auth pages; allow pending users to stay
    if (isAuthPage && session && isVerified) {
      return NextResponse.redirect(new URL("/schedules", request.url));
    }

    // Allow auth routes and public assets
    if (
      isAuthPage ||
      pathname.startsWith("/api/auth") ||
      pathname === "/favicon.ico"
    ) {
      return NextResponse.next();
    }

    // Require auth beyond this point
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isAdminPath) {
      const role = session?.user?.role;
      if (role !== "admin") {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  } catch (_e) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
