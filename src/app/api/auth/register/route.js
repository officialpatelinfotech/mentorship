import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(req) {
    try {
        const { name, email, password, role } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ success: false, message: 'Please provide all required fields' }, { status: 400 });
        }

        await dbConnect();

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ success: false, message: 'User already exists' }, { status: 400 });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Limit allowed roles for public registration
        const assignedRole = (role === 'professional') ? 'professional' : 'student';

        // Auto-generate mentorId for professionals
        let mentorId = null;
        if (assignedRole === 'professional') {
            const count = await User.countDocuments({ role: 'professional' });
            mentorId = `m_${String(count + 1).padStart(3, '0')}`;
        }

        // Create user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: assignedRole,
            mentorId,
        });

        // Generate JWT token using jose
        const token = await signToken({
            id: newUser._id.toString(),
            role: newUser.role,
            email: newUser.email,
        });

        // Create the response
        const response = NextResponse.json(
            { success: true, message: 'Registered successfully', user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } },
            { status: 201 }
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
        console.error('Registration error:', error);
        return NextResponse.json({ success: false, message: 'Registration failed', error: error.message }, { status: 500 });
    }
}
