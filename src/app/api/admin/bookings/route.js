import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Booking from '../../../../models/Booking';
import { verifyAuth } from '../../../../lib/auth';
import { cookies } from 'next/headers';

export async function GET(req) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const decoded = await verifyAuth(token);

        // Authorization check: ONLY admin role is allowed
        if (decoded.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });
        }

        await dbConnect();

        // Fetch all bookings from the database
        const bookings = await Booking.find({}).sort({ sessionDate: -1 }).lean();

        const safeBookings = bookings.map(b => ({ ...b, _id: b._id.toString() }));

        return NextResponse.json({ success: true, data: safeBookings }, { status: 200 });
    } catch (error) {
        console.error('Admin API Error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
