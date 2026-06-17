import { NextRequest, NextResponse } from "next/server";

export const config = {
    matcher: [
        /**
         * Match all paths except for the ones starting with:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico, /robots.txt, etc.)
         */
        "/((?!api/|_next/|_static/|_vercel|media/|[\\w-]+\\.\\w+).*)",
    ]
};

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl; // Get the URL of the incoming request
    // Extract the hostname (e.g., "khai.funroad.com" or "john.localhost:3000") from the request headers
    const hostname = req.headers.get("host") || "";

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "";

    if(hostname.endsWith(`.${rootDomain}`)) {
        const tenantSlug = hostname.replace(`.${rootDomain}`, ""); // Extract the tenant slug (e.g., "khai" from "khai.funroad.com")
        return NextResponse.rewrite(new URL(`/tenants/${tenantSlug}${url.pathname}`, req.url)); // Rewrite the request to include the tenant slug (e.g., "/khai/products")
    }

    return NextResponse.next(); // Continue with the normal request processing for non-tenant requests
};
