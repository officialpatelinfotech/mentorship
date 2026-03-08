import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Slot from '@/models/Slot';

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
        const { mentorId, slots } = await req.json();

        if (!mentorId || !slots || !Array.isArray(slots) || slots.length === 0) {
            return NextResponse.json({ success: false, message: 'mentorId and a non-empty slots array are required' }, { status: 400 });
        }

        // Build slot documents, skip duplicates
        const slotDocs = slots.map(s => ({
            mentorId,
            date: s.date,
            time: s.time,
            isBooked: false,
        }));

        // Use insertMany with ordered: false to skip duplicates gracefully
        let inserted = [];
        try {
            inserted = await Slot.insertMany(slotDocs, { ordered: false });
        } catch (err) {
            // Duplicate key errors (code 11000) are expected for already-existing slots
            if (err.code === 11000 || err.writeErrors) {
                inserted = err.insertedDocs || [];
            } else {
                throw err;
            }
        }

        return NextResponse.json({ success: true, message: `${inserted.length} slot(s) saved`, data: inserted }, { status: 201 });
    } catch (error) {
        console.error('Error saving slots:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

// DELETE — Mentor removes an unbooked slot by its ID
export async function DELETE(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const slotId = searchParams.get('id');

        if (!slotId) {
            return NextResponse.json({ success: false, message: 'Slot id is required' }, { status: 400 });
        }

        const slot = await Slot.findById(slotId);
        if (!slot) {
            return NextResponse.json({ success: false, message: 'Slot not found' }, { status: 404 });
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
