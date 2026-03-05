import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const response = NextResponse.json(
            { success: true, message: 'Logged out successfully' },
            { status: 200 }
        );

        // Clear the HTTP-only cookie
        response.cookies.set({
            name: 'token',
            value: '',
            httpOnly: true,
            expires: new Date(0),
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ success: false, message: 'Logout failed' }, { status: 500 });
    }
}
