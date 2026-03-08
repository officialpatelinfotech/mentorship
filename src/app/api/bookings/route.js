import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Booking from '../../../models/Booking';
import Slot from '../../../models/Slot';
import mongoose from 'mongoose';
import User from '@/models/User';
import Professional from '@/models/Professional';

export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');
        const email = searchParams.get('email');
        const mentorId = searchParams.get('mentorId'); // If passed explicitly

        let query = {};

        if (role === 'student' && email) {
            query = { email: email };
        } else if (role === 'professional') {
            // Mentor can be looked up by mentorName or mentorId if passed
            // In a real app we'd attach mentorId directly to the booked session from the logged in user
            if (mentorId) {
                query = { mentorId: mentorId };
            } else if (email) {
                // Look up the professional's mentorId from their User account.
                const user = await User.findOne({ email });
                if (user && user.mentorId) {
                    query = { mentorId: user.mentorId };
                } else {
                    return NextResponse.json({ success: true, data: [] }, { status: 200 });
                }
            }
        }

        const bookings = await Booking.find(query).sort({ sessionDate: 1 }).lean();
        const safeBookings = bookings.map(b => ({ ...b, _id: b._id.toString() }));

        return NextResponse.json({ success: true, data: safeBookings }, { status: 200 });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();

        // Connect to database
        await dbConnect();

        // Create new booking document based on the Booking model
        const newBooking = new Booking({
            mentorId: body.mentorId,
            mentorName: body.mentorName,
            candidateName: body.name, // mapped from frontend form
            phone: body.phone,
            email: body.email,
            qualification: body.qualification,
            sessionReason: body.sessionFor, // mapped from frontend form
            sessionDate: body.sessionDate,
            sessionTime: body.sessionTime,
        });

        // Save to the database
        await newBooking.save();

        // Mark the corresponding slot as booked
        await Slot.findOneAndUpdate(
            { mentorId: body.mentorId, date: body.sessionDate?.split('T')[0], time: body.sessionTime, isBooked: false },
            { isBooked: true }
        );

        return NextResponse.json(
            { success: true, message: 'Booking successfully saved!', bookingId: newBooking._id },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error saving booking:', error);

        // Handle Mongoose validation errors gracefully
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return NextResponse.json(
                { success: false, message: 'Validation failed', errors: messages },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'Server error while saving booking' },
            { status: 500 }
        );
    }
}
