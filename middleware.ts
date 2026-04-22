import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// These paths are fully public — no token needed
const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/courses",   // public catalog + detail
  "/about",
  "/api/",
  "/_next/",
  "/favicon",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("educore_access")?.value;
  const role  = request.cookies.get("educore_role")?.value;

  // Root "/" is the landing page — always public
  if (pathname === "/") return NextResponse.next();

  // Allow all public prefixes
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Payment page — must be logged in as student
  if (pathname.startsWith("/payment")) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    if (role !== "student") return NextResponse.redirect(new URL("/instructor/dashboard", request.url));
    return NextResponse.next();
  }

  // Not authenticated → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin panel — must be logged in with is_staff cookie
  if (pathname.startsWith("/admin-panel")) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    const isStaff = request.cookies.get("educore_is_staff")?.value === "true";
    if (!isStaff) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  // Wrong role guards
  if (pathname.startsWith("/instructor") && role !== "instructor") {
    return NextResponse.redirect(new URL("/student/dashboard", request.url));
  }
  if (pathname.startsWith("/student") && role !== "student") {
    return NextResponse.redirect(new URL("/instructor/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};