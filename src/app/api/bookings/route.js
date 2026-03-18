import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Booking from '../../../models/Booking';
import Slot from '../../../models/Slot';
import mongoose from 'mongoose';
import User from '@/models/User';
import Professional from '@/models/Professional';
import { sendBookingEmails } from '@/lib/mail';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
    try {
        await dbConnect();

        // Get authenticated user from token
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }

        const decoded = await verifyAuth(token);
        const user = await User.findById(decoded.id).lean();

        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        let query = {};

        if (user.role === 'student') {
            // Students only see their own bookings mapped by email
            query = { email: user.email };
        } else if (user.role === 'professional') {
            // Professionals only see bookings for their mentorId
            if (user.mentorId) {
                query = { mentorId: user.mentorId };
            } else {
                // If professional has no mentorId yet, return empty
                return NextResponse.json({ success: true, data: [] }, { status: 200 });
            }
        } else if (user.role === 'admin') {
            // Admins can see all, but they usually use /api/admin/bookings
            // For safety, let's allow it but we could also restrict it here
            query = {};
        } else {
            // Unknown role should return nothing
            return NextResponse.json({ success: true, data: [] }, { status: 200 });
        }

        const bookings = await Booking.find(query).sort({ sessionDate: -1, sessionTime: -1 }).lean();
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

        // Send Booking Confirmation Emails (Async)
        try {
            // Fetch mentor's email from User model
            const mentorUser = await User.findOne({ mentorId: body.mentorId });
            
            if (mentorUser) {
                await sendBookingEmails({
                    candidateName: body.name,
                    candidateEmail: body.email,
                    mentorName: body.mentorName,
                    mentorEmail: mentorUser.email,
                    sessionDate: body.sessionDate?.split('T')[0],
                    sessionTime: body.sessionTime,
                    sessionReason: body.sessionFor
                });
            }
        } catch (emailError) {
            console.error('Failed to send booking emails:', emailError);
        }

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
