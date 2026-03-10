import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Professional from '@/models/Professional';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req) {
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

        const { mentorId, isFeatured, type } = await req.json();

        await dbConnect();

        if (isFeatured) {
            // Count current featured
            const seededCount = await Professional.countDocuments({ isFeatured: true });
            const userCount = await User.countDocuments({ role: 'professional', isFeatured: true });

            if (seededCount + userCount >= 4) {
                return NextResponse.json({ success: false, message: 'Maximum 4 mentors can be featured.' }, { status: 400 });
            }
        }

        if (type === 'seeded') {
            await Professional.findByIdAndUpdate(mentorId, { isFeatured });
        } else {
            await User.findByIdAndUpdate(mentorId, { isFeatured });
        }

        return NextResponse.json({ success: true, message: 'Mentor updated successfully' });
    } catch (error) {
        console.error('Failed to update featured status:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
