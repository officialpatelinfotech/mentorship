// Script to set admin credentials
// Run with: node setup-admin.mjs

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = "mongodb://127.0.0.1:27017/mba_mentorship";

async function setupAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const email = "admin@gmail.com";
        const password = "Admin@1234";
        const role = "admin";

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const usersCollection = mongoose.connection.db.collection('users');

        const existingAdmin = await usersCollection.findOne({ email });

        if (existingAdmin) {
            const result = await usersCollection.updateOne(
                { email },
                { $set: { password: hashedPassword, role: role } }
            );
            console.log(`Updated existing admin: ${result.modifiedCount} document(s)`);
        } else {
            const result = await usersCollection.insertOne({
                name: "Admin User",
                email,
                password: hashedPassword,
                role,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`Created new admin user with ID: ${result.insertedId}`);
        }

        console.log(`Admin email: ${email}`);
        console.log(`Admin password set to: ${password}`);

    } catch (error) {
        console.error("Error setting up admin:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

setupAdmin();
