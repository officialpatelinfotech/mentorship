import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PUT(req) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        const { name, email } = await req.json();

        if (!name || !email) {
            return NextResponse.json({ success: false, message: 'Name and email are required' }, { status: 400 });
        }

        await dbConnect();

        // Check if new email is already taken by another user
        const existingUser = await User.findOne({ email, _id: { $ne: decoded.id } });
        if (existingUser) {
            return NextResponse.json({ success: false, message: 'Email is already in use' }, { status: 400 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            decoded.id,
            { name, email },
            { new: true, runValidators: true }
        ).lean().select('-password');

        if (!updatedUser) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        updatedUser._id = updatedUser._id.toString();

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser,
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ success: false, message: 'Failed to update profile' }, { status: 500 });
    }
}
