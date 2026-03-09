import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Professional from '@/models/Professional';

import User from '@/models/User';

export async function GET() {
    try {
        await dbConnect();

        // Fetch seeded professionals (the ones manually added to DB earlier)
        const seededProfessionals = await Professional.find({}).sort({ createdAt: 1 }).lean();

        // Fetch actual users who registered as "professional"
        const registeredProfessionals = await User.find({ role: 'professional' }).sort({ createdAt: 1 }).lean();

        // Format registered users to match the Professional model structure used by the frontend
        const formattedRegistered = registeredProfessionals.map(user => ({
            _id: user._id,
            mentorId: user.mentorId || user._id.toString(), // Add mentorId fallback if not initially set
            name: user.name,
            email: user.email,
            title: user.profession || 'Professional', // Fallback title
            university: user.latestQualification || user.qualification || 'Alumni',
            profession: user.profession || 'Mentor',
            image: user.professionalPhoto || user.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop', // Provide a fallback avatar
        }));

        // Merge both lists
        const allProfessionals = [...seededProfessionals, ...formattedRegistered];

        return NextResponse.json({ success: true, data: allProfessionals });
    } catch (error) {
        console.error('Failed to fetch professionals:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch professionals', error: error.message }, { status: 500 });
    }
}
