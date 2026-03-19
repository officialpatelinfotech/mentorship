import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { sendSignupEmails } from '@/lib/mail';

export async function POST(req) {
    try {
        const { name, email, password, role, phone, latestQualification, interest, qualification, profession, photo, professionalPhoto, otpMode, otpVerified } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ success: false, message: 'Please provide all required fields' }, { status: 400 });
        }

        await dbConnect();

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ success: false, message: 'User already exists' }, { status: 400 });
        }

        // OTP Mode: Just validate that user can be created, don't create yet
        if (otpMode) {
            // Also check phone uniqueness
            if (phone) {
                const existingPhone = await User.findOne({ phone });
                if (existingPhone) {
                    return NextResponse.json({ success: false, message: 'Phone number already registered' }, { status: 400 });
                }
            }
            return NextResponse.json({ 
                success: true, 
                message: 'Validation passed. OTP required.' 
            }, { status: 200 });
        }

        // If not OTP verified, reject
        if (!otpVerified) {
            return NextResponse.json({ success: false, message: 'Email verification required' }, { status: 403 });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Limit allowed roles for public registration
        const assignedRole = (role === 'professional') ? 'professional' : 'student';

        // Auto-generate unique mentorId for professionals
        let mentorId = null;
        if (assignedRole === 'professional') {
            // Find the highest existing mentor ID number to ensure uniqueness
            const lastMentor = await User.findOne(
                { role: 'professional', mentorId: { $ne: null } },
                { mentorId: 1 },
                { sort: { mentorId: -1 } }
            );
            let nextNum = 1;
            if (lastMentor && lastMentor.mentorId) {
                const match = lastMentor.mentorId.match(/m_(\d+)/);
                if (match) nextNum = parseInt(match[1], 10) + 1;
            }
            mentorId = `m_${String(nextNum).padStart(3, '0')}`;
        }

        // Create user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: assignedRole,
            mentorId,
            photo: photo || null,
            // Student-specific fields
            ...(assignedRole === 'student' && {
                phone: phone || null,
                latestQualification: latestQualification || null,
                interest: interest || null,
            }),
            // Professional-specific fields
            ...(assignedRole === 'professional' && {
                phone: phone || null,
                qualification: qualification || null,
                profession: profession || null,
                professionalPhoto: professionalPhoto || null,
            }),
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
        
        // Send Welcome & Admin Alert Emails (Async)
        try {
            await sendSignupEmails({
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            });
        } catch (emailError) {
            console.error('Failed to send signup emails:', emailError);
        }

        return response;

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ success: false, message: 'Registration failed', error: error.message }, { status: 500 });
    }
}
