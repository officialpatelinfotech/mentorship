import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Professional from '@/models/Professional';

const initialProfessors = [
    {
        mentorId: "m_001",
        name: "Dr. Ananya Sharma",
        title: "Strategy & Consulting",
        university: "IIM Ahmedabad",
        profession: "Consultant",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop"
    },
    {
        mentorId: "m_002",
        name: "Rajiv Mehta",
        title: "Investment Banking",
        university: "ISB Hyderabad",
        profession: "Finance",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop"
    },
    {
        mentorId: "m_003",
        name: "Priya Kapoor",
        title: "Product Management",
        university: "IIM Bangalore",
        profession: "Technology",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop"
    },
    {
        mentorId: "m_004",
        name: "Arjun Reddy",
        title: "Entrepreneurship",
        university: "IIM Calcutta",
        profession: "Entrepreneur",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1974&auto=format&fit=crop"
    },
    {
        mentorId: "m_005",
        name: "Sneha Patel",
        title: "Marketing & Brand Strategy",
        university: "XLRI Jamshedpur",
        profession: "Marketing",
        image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?q=80&w=1974&auto=format&fit=crop"
    },
    {
        mentorId: "m_006",
        name: "Vikram Singh",
        title: "Operations Management",
        university: "IIM Ahmedabad",
        profession: "Operations",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
    },
    {
        mentorId: "m_007",
        name: "Kavita Nair",
        title: "Human Resources",
        university: "IIM Bangalore",
        profession: "Consultant",
        image: "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?q=80&w=1972&auto=format&fit=crop"
    },
    {
        mentorId: "m_008",
        name: "Rohan Desai",
        title: "Private Equity",
        university: "ISB Hyderabad",
        profession: "Finance",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop"
    },
    {
        mentorId: "m_009",
        name: "Meera Joshi",
        title: "Data Analytics",
        university: "IIM Calcutta",
        profession: "Technology",
        image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?q=80&w=1974&auto=format&fit=crop"
    },
    {
        mentorId: "m_010",
        name: "Amit Verma",
        title: "Supply Chain & Logistics",
        university: "XLRI Jamshedpur",
        profession: "Operations",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop"
    }
];

export async function GET() {
    try {
        await dbConnect();

        // Clear existing data (optional, but good for a seed script if running multiple times)
        await Professional.deleteMany({});

        // Insert new data
        const inserted = await Professional.insertMany(initialProfessors);

        return NextResponse.json({ success: true, message: 'Professionals seeded successfully', count: inserted.length });
    } catch (error) {
        console.error('Failed to seed professionals:', error);
        return NextResponse.json({ success: false, message: 'Failed to seed professionals', error: error.message }, { status: 500 });
    }
}
