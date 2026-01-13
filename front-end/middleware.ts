import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Where each role should land
const ROLE_HOME: Record<string, string> = {
  admin: "/admin",
  user: "/dashboard",
};

// Define allowed areas (edit these to match your app)
const ADMIN_PREFIXES = ["/admin"];
const USER_PREFIXES = ["/dashboard", "/chat", "/feedback", "/products", "/profile"];

// Public pages (no login needed)
function isPublicPath(path: string) {
  return (
    path === "/" ||
    path.startsWith("/auth") || // /auth/login, /auth/register, /auth/forgot-password, /auth/reset-password
    path === "/admin/login"
  );
}

async function getPayload(token: string) {
  const secret = new TextEncoder().encode(process.env.TOKEN_SECRET || "");
  return (await jwtVerify(token, secret)).payload;
}

function startsWithAny(path: string, prefixes: string[]) {
  return prefixes.some((p) => path === p || path.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value || "";


  // 1) Public routes
  if (isPublicPath(path)) {
    // If logged in, redirect to correct home (prevents admin staying on user login, etc.)
    if (token) {
      try {
        const payload = await getPayload(token);
        const role = String(payload.role || "user");
        const home = ROLE_HOME[role] || "/dashboard";

        // let them open reset page only if you want; otherwise redirect too
        {/**const allowResetEvenIfLoggedIn = path.startsWith("/auth/reset-password");
        if (!allowResetEvenIfLoggedIn) return NextResponse.redirect(new URL(home, request.nextUrl));*/}
      } catch {
        // invalid token -> treat as logged out
        return NextResponse.redirect(new URL("/", request.nextUrl));
      }
    }
    return NextResponse.next();
  }

  // 2) Protected routes require token
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.nextUrl));
  }

  // 3) Decode role
  let role = "user";
  try {
    const payload = await getPayload(token);
    role = String(payload.role || "user");
  } catch {
    // bad token -> send to login
    return NextResponse.redirect(new URL("/auth/login", request.nextUrl));
  }

  const home = ROLE_HOME[role] || "/dashboard";

  // 4) Enforce access boundaries
  if (role === "admin") {
    // Admin can ONLY be in /admin (strict)
    if (!startsWithAny(path, ADMIN_PREFIXES)) {
      return NextResponse.redirect(new URL("/admin", request.nextUrl));
    }
  } else {
    // User can ONLY be in user pages (strict)
    if (startsWithAny(path, ADMIN_PREFIXES)) {
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }
    if (!startsWithAny(path, USER_PREFIXES)) {
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }
  }

  if (role !== "admin") {
    const payload = await getPayload(token);
    const isVerified = Boolean(payload.verified) || false;
    const isLicenseUploaded = Boolean(payload.licenseUploaded) || false;
    const businessId = String(payload.businessId || "");
    // IMPORTANT: use "/products" and "/chat" (with slash)
    if (!isVerified && startsWithAny(path, ["/products", "/chat"])) {
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }
    if (!businessId && startsWithAny(path, USER_PREFIXES)) {
      return NextResponse.redirect(new URL("/auth/business-details", request.nextUrl));
    }
    if (!isLicenseUploaded && startsWithAny(path, USER_PREFIXES)) {
      return NextResponse.redirect(new URL("/auth/license-upload", request.nextUrl));
    }
    
  }

  // 5) Optional: if they hit "/" while logged in, send to role home
  if (path === "/") {
    return NextResponse.redirect(new URL(home, request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/auth/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
    "/chat/:path*",
    "/feedback/:path*",
    "/products/:path*",
    "/profile/:path*",
  ],
};
