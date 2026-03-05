import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Professional from '@/models/Professional';

export async function GET() {
    try {
        await dbConnect();
        const professionals = await Professional.find({}).sort({ createdAt: 1 });
        return NextResponse.json({ success: true, data: professionals });
    } catch (error) {
        console.error('Failed to fetch professionals:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch professionals', error: error.message }, { status: 500 });
    }
}
