import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isPublicPath =
    path === "/auth/login" ||
    path === "/auth/register" ||
    path === "/admin/login" ||
    path === "/";

  const token = request.cookies.get("token")?.value || "";

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.nextUrl));
  }
}

// see "matching paths" below to learn more
export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/auth/login",
    "/auth/register",
    "/chat",
    "/feedback",
    "/products",
    "/profile",
  ],
};
