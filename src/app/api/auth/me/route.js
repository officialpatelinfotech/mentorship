import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req) {
    try {
        const token = req.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: 'Not authenticated', user: null }, { status: 200 });
        }

        // Verify token using jose
        const decoded = await verifyAuth(token);

        await dbConnect();

        // Fetch full user details, excluding password
        const user = await User.findById(decoded.id).select('-password').lean();

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found', user: null }, { status: 200 });
        }

        // Convert _id to string for safe JSON serialization
        const safeUser = {
            ...user,
            _id: user._id.toString(),
        };

        return NextResponse.json({ success: true, user: safeUser }, { status: 200 });

    } catch (error) {
        console.error('Auth verification error:', error);
        return NextResponse.json({ success: false, message: 'Invalid or expired session', user: null }, { status: 200 });
    }
}
