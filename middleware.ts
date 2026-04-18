// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// function generateObfuscatedPath() {
//   const random = Math.random().toString(36).substring(2, 10); // random string
//   const encoded = Buffer.from(random).toString("base64"); // encode (Node/Edge safe)

//   // make it URL safe
//   return encoded.replace(/=/g, "").replace(/\+/g, "").replace(/\//g, "");
// }

// export function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   if (pathname.startsWith("/api")) {
//     const dest = req.headers.get("sec-fetch-dest");
//     const accept = req.headers.get("accept") || "";

//     if (dest === "document" || accept.includes("text/html")) {
//       const obfuscated = generateObfuscatedPath();

//       return NextResponse.redirect(new URL(`/${obfuscated}`, req.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/api/:path*"],
// };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function generateObfuscatedPath() {
  const random = Math.random().toString(36).substring(2, 10);
  const encoded = Buffer.from(random).toString("base64");

  return encoded.replace(/=/g, "").replace(/\+/g, "").replace(/\//g, "");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/exit-leader")) {
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.delete("leader");
    return res;
  }

  const isLeader = req.cookies.get("leader")?.value === "true";

  // 🔒 Lock leaders inside /leaders
  if (isLeader) {
    if (!pathname.startsWith("/leaders")) {
      return NextResponse.redirect(new URL("/leaders", req.url));
    }
  }

  // 🔐 Protect API routes (except leader-access)
  if (
    pathname.startsWith("/api") &&
    !pathname.startsWith("/api/leader-access")
  ) {
    const dest = req.headers.get("sec-fetch-dest");
    const accept = req.headers.get("accept") || "";

    if (dest === "document" || accept.includes("text/html")) {
      const obfuscated = generateObfuscatedPath();
      return NextResponse.redirect(new URL(`/${obfuscated}`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
