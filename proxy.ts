import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
   function middleware(req) {
    const { pathname } = req.nextUrl
    const isAuth = !!req.nextauth.token

    // ✅ logged-in user should not visit login/signup
    if (
      isAuth &&
      (pathname.startsWith("/login") ||
        pathname.startsWith("/signup"))
    ) {
      return NextResponse.redirect(
        new URL("/dashboard", req.url)
      )
    }

    if (!isAuth && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // otherwise continue
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*",  "/login",
    "/signup",],
};