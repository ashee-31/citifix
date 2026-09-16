import { NextResponse } from "next/server";

export function middleware(request: Request) {
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204 });
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
