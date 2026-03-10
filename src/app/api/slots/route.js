import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Slot from '@/models/Slot';
import { verifyAuth } from '@/lib/auth';
import User from '@/models/User';

// GET — Fetch slots for a mentor, optionally filtered by date
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const mentorId = searchParams.get('mentorId');
        const date = searchParams.get('date');

        if (!mentorId) {
            return NextResponse.json({ success: false, message: 'mentorId is required' }, { status: 400 });
        }

        const query = { mentorId };
        if (date) {
            query.date = date;
        }

        const slots = await Slot.find(query).sort({ date: 1, time: 1 }).lean();
        const safeSlots = slots.map(s => ({ ...s, _id: s._id.toString() }));

        return NextResponse.json({ success: true, data: safeSlots }, { status: 200 });
    } catch (error) {
        console.error('Error fetching slots:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

// POST — Mentor creates slots (accepts an array of { date, time })
export async function POST(req) {
    try {
        await dbConnect();

        // Authentication check
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const decoded = await verifyAuth(token);
        const user = await User.findById(decoded.id).lean();

        if (!user || user.role !== 'professional' || !user.mentorId) {
            return NextResponse.json({ success: false, message: 'Unauthorized. Only professionals with a Mentor ID can open slots.' }, { status: 403 });
        }

        const { mentorId, slots } = await req.json();

        // Safety check: Ensure the mentorId in the body matches the user's mentorId
        if (mentorId !== user.mentorId) {
            return NextResponse.json({ success: false, message: 'Unauthorized. You can only manage your own slots.' }, { status: 403 });
        }

        if (!slots || !Array.isArray(slots) || slots.length === 0) {
            return NextResponse.json({ success: false, message: 'A non-empty slots array is required' }, { status: 400 });
        }

        // Build slot documents, skip duplicates
        const slotDocs = slots.map(s => ({
            mentorId: user.mentorId, // Use fixed mentorId from user account for safety
            date: s.date,
            time: s.time,
            isBooked: false,
        }));

        // Use insertMany with ordered: false to skip duplicates gracefully
        let inserted = [];
        try {
            inserted = await Slot.insertMany(slotDocs, { ordered: false });
        } catch (err) {
            if (err.code === 11000 || err.writeErrors) {
                inserted = err.insertedDocs || [];
            } else {
                throw err;
            }
        }

        return NextResponse.json({ success: true, message: `${inserted.length} slot(s) opened` }, { status: 201 });
    } catch (error) {
        console.error('Error saving slots:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

// DELETE — Mentor removes an unbooked slot by its ID
export async function DELETE(req) {
    try {
        await dbConnect();

        // Authentication check
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const decoded = await verifyAuth(token);
        const user = await User.findById(decoded.id).lean();

        const { searchParams } = new URL(req.url);
        const slotId = searchParams.get('id');

        if (!slotId) {
            return NextResponse.json({ success: false, message: 'Slot id is required' }, { status: 400 });
        }

        const slot = await Slot.findById(slotId);
        if (!slot) {
            return NextResponse.json({ success: false, message: 'Slot not found' }, { status: 404 });
        }

        // Authorization check: User must be professional AND own this slot (matching mentorId)
        if (user.role !== 'professional' || slot.mentorId !== user.mentorId) {
            return NextResponse.json({ success: false, message: 'Unauthorized. You can only delete your own slots.' }, { status: 403 });
        }

        if (slot.isBooked) {
            return NextResponse.json({ success: false, message: 'Cannot delete a booked slot' }, { status: 400 });
        }

        await Slot.findByIdAndDelete(slotId);
        return NextResponse.json({ success: true, message: 'Slot deleted' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting slot:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
