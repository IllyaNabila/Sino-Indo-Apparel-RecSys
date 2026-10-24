import { withErrorHandler } from '@/lib/withErrorHandler';
import {NextResponse} from 'next/server'

export const POST = withErrorHandler(async() => {
    const response = NextResponse.json(
        { succses: true, data: { message: "Logged out" } },
        { status: 200 }
    );
    response.cookies.set("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
    });
    return response;
});