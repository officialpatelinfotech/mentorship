import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Professional from '@/models/Professional';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const decoded = await verifyAuth(token).catch(() => null);
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();

        const seededProfessionals = await Professional.find({}).sort({ createdAt: 1 }).lean();
        const registeredProfessionals = await User.find({ role: 'professional' }).sort({ createdAt: 1 }).lean();

        const formattedRegistered = registeredProfessionals.map(user => ({
            _id: user._id.toString(),
            mentorId: user.mentorId || user._id.toString(),
            name: user.name,
            email: user.email,
            title: user.profession || 'Professional',
            university: user.latestQualification || user.qualification || 'Alumni',
            profession: user.profession || 'Mentor',
            image: user.professionalPhoto || user.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop',
            isFeatured: user.isFeatured || false,
            about: user.about || ''
        }));

        const formattedSeeded = seededProfessionals.map(p => ({
            ...p,
            _id: p._id.toString(),
            isFeatured: p.isFeatured || false,
            about: p.about || ''
        }));

        const allMentors = [...formattedSeeded, ...formattedRegistered];

        return NextResponse.json({ success: true, data: allMentors });
    } catch (error) {
        console.error('Failed to fetch mentors for admin:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
