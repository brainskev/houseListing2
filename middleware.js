import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPaths = ["/properties/add", "/profile", "/properties/saved", "/messages"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  const isAdminDashboard = pathname.startsWith("/dashboard/admin");
  const isAssistantDashboard = pathname.startsWith("/dashboard/assistant");
  const isUserDashboard = pathname.startsWith("/dashboard/user");
  const isAddProperty = pathname.startsWith("/properties/add");
  const isEditProperty = pathname.match(/^\/properties\/[^/]+\/edit$/);

  const isProtected =
    isAdminDashboard ||
    isAssistantDashboard ||
    isUserDashboard ||
    isEditProperty ||
    protectedPaths.some((path) => pathname.startsWith(path));

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const signInUrl = new URL("/api/auth/signin", req.url);
    // Preserve full path + query so users return exactly to where they were
    const fullUrl = req.nextUrl.href;
    signInUrl.searchParams.set("callbackUrl", fullUrl);
    return NextResponse.redirect(signInUrl);
  }

  if (isAdminDashboard && !["admin", "assistant"].includes(token.role)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isAssistantDashboard && !["admin", "assistant"].includes(token.role)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isAddProperty && !["admin", "assistant"].includes(token.role)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isEditProperty && !["admin", "assistant"].includes(token.role)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/properties/add",
    "/properties/:id/edit",
    "/profile",
    "/properties/saved",
    "/messages",
    "/dashboard/admin/:path*",
    "/dashboard/assistant/:path*",
    "/dashboard/user/:path*",
  ],
};
