import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

// Using require for agora-access-token since it's a CommonJS module
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const channelName = searchParams.get('channelName'); // Using bookingId as channel name
        const uid = 0; // 0 allows Agora to assign a random UID
        const role = RtcRole.PUBLISHER;

        if (!channelName) {
            return NextResponse.json({ success: false, message: 'channelName (bookingId) is required' }, { status: 400 });
        }

        // 1. Verify Authentication
        const authToken = req.cookies.get('token')?.value;
        if (!authToken) {
            return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
        }
        
        const decoded = await verifyAuth(authToken).catch(() => null);
        if (!decoded) {
            return NextResponse.json({ success: false, message: 'Invalid or expired session' }, { status: 401 });
        }

        // 2. Connect DB & Verify Booking exists
        await dbConnect();
        
        // Use try-catch for potential invalid BSON ID
        let booking;
        try {
            booking = await Booking.findById(channelName);
        } catch (e) {
            return NextResponse.json({ success: false, message: 'Invalid booking ID' }, { status: 400 });
        }

        if (!booking) {
            return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
        }

        // TODO: Strict check to ensure the authenticated user is either the student (email) or mentor (mentorId)
        // For MVP, we verify the booking exists.

        // 3. Agora Config
        const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
        const appCertificate = process.env.AGORA_APP_CERTIFICATE;
        
        if (!appId || !appCertificate || appId === 'YOUR_AGORA_APP_ID') {
            return NextResponse.json({ 
                success: false, 
                message: 'Agora NOT configured on server. Please add NEXT_PUBLIC_AGORA_APP_ID and AGORA_APP_CERTIFICATE to .env.local' 
            }, { status: 500 });
        }

        // 4. Generate Token (1 hour validity for the token itself, session is 15 min)
        const expirationTimeInSeconds = 3600; 
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        const agoraToken = RtcTokenBuilder.buildTokenWithUid(
            appId,
            appCertificate,
            channelName,
            uid,
            role,
            privilegeExpiredTs
        );

        return NextResponse.json({ 
            success: true, 
            token: agoraToken, 
            appId,
            channelName
        });

    } catch (error) {
        console.error('Agora Token Error:', error);
        return NextResponse.json({ success: false, message: 'Server error generating token' }, { status: 500 });
    }
}
