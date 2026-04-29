import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/cart", "/orders", "/checkout"];
const authRoutes = ["/login", "/register"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 🔒 Block unauthenticated users
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 🔁 Prevent logged-in users from visiting auth pages
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cart", "/orders", "/checkout", "/login", "/register"],
};