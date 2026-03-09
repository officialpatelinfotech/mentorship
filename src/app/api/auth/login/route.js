import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(req) {
    try {
        const { identifier, password } = await req.json();

        if (!identifier || !password) {
            return NextResponse.json({ success: false, message: 'Please provide email/phone and password' }, { status: 400 });
        }

        await dbConnect();

        // Find user by email OR phone
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { phone: identifier }
            ]
        }).select('+password');

        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
        }

        // Compare entered password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
        }

        // Generate JWT token
        const token = await signToken({
            id: user._id.toString(),
            role: user.role,
            email: user.email,
        });

        // Create the response
        const response = NextResponse.json(
            { success: true, message: 'Logged in successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role } },
            { status: 200 }
        );

        // Set the HTTP-only cookie
        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 2, // 2 days
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, message: 'Login failed', error: error.message }, { status: 500 });
    }
}
