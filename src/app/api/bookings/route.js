import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Booking from '../../../models/Booking';

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
