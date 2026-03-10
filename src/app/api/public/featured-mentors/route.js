import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Professional from '@/models/Professional';
import User from '@/models/User';

export async function GET() {
    try {
        await dbConnect();

        const seededFeatured = await Professional.find({ isFeatured: true }).lean();
        const userFeatured = await User.find({ role: 'professional', isFeatured: true }).lean();

        const formattedUser = userFeatured.map(user => ({
            _id: user._id,
            name: user.name,
            title: user.profession || 'Professional',
            image: user.professionalPhoto || user.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop',
            about: user.about || 'Top B-school alumni and industry expert.'
        }));

        const formattedSeeded = seededFeatured.map(p => ({
            _id: p._id,
            name: p.name,
            title: p.title,
            image: p.image,
            about: p.about || 'Top B-school alumni and industry expert.'
        }));

        const featured = [...formattedSeeded, ...formattedUser].slice(0, 4);

        return NextResponse.json({ success: true, data: featured });
    } catch (error) {
        console.error('Failed to fetch featured mentors:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
