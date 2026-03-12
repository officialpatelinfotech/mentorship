import { NextResponse } from 'next/server';
import { sendContactEmails } from '@/lib/mail';

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, email, subject, message, phone } = body;

        if (!name || !email || !message) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        // Send Emails using centralized utility
        await sendContactEmails({ name, email, phone, subject, message });

        return NextResponse.json({ success: true, message: 'Message sent successfully!' });

    } catch (error) {
        console.error('SMTP Error:', error);
        return NextResponse.json({ success: false, message: 'Failed to send message. Please try again later.' }, { status: 500 });
    }
}
