import { NextRequest, NextResponse } from 'next/server'
import { auth } from './auth'
const PUBLIC_ROUTES = ["/"]
// const PUBLIC_APIS = ["/api/auth"]

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl
    if (pathname.startsWith("/next") || pathname.startsWith("logo.jpeg") || /\.(png|jpg|jpeg|gif|svg|ico)$/i.test(pathname)) {
        return NextResponse.next()

    }
    if (PUBLIC_ROUTES.includes(pathname)) {
        return NextResponse.next()
    }
    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next()
    }
    

    const session = await auth()
    if (!session) {
        return NextResponse.redirect(new URL("/", req.url))
    }
    const role = session.user?.role
    if (role === "admin" && pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/", req.url))

    }
    if (role === "partner" && pathname.startsWith("/partner")) {
        if(pathname !== "/partner/onboarding"){
        return NextResponse.next()

        }
        
            return NextResponse.redirect(new URL("/", req.url))

    }
    if (pathname.startsWith("/api") && !session.user) {
        return Response.json({ message: "Unauthorized" }, { status: 401 })
    }

return NextResponse.next()

}



export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}