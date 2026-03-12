import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        await dbConnect();

        const adminEmail = "contact@patelinfotech.online";
        const adminPass = "Contact@Pi";

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPass, salt);

        // Try to find existing admin user
        let user = await User.findOne({ email: adminEmail });

        if (user) {
            // Update existing user to be admin and reset password
            user.role = 'admin';
            user.password = hashedPassword;
            user.name = "Dishanta Admin";
            await user.save();
            return NextResponse.json({ 
                success: true, 
                message: 'Admin account updated successfully!',
                email: adminEmail
            });
        } else {
            // Create new admin user
            await User.create({
                name: "Dishanta Admin",
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });
            return NextResponse.json({ 
                success: true, 
                message: 'Admin account created successfully!',
                email: adminEmail
            });
        }

    } catch (error) {
        console.error('Admin Setup Error:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Setup failed', 
            error: error.message 
        }, { status: 500 });
    }
}
