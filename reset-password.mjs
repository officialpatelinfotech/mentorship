// Quick script to reset password for a user
// Run with: node reset-password.mjs

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = "mongodb://127.0.0.1:27017/mba_mentorship";

await mongoose.connect(MONGODB_URI);
console.log("Connected to MongoDB");

const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash("Test1234", salt);

const result = await mongoose.connection.db.collection('users').updateOne(
    { email: "amitverma@gmail.com" },
    { $set: { password: hashedPassword } }
);

console.log("Updated:", result.modifiedCount, "document(s)");
console.log("New password: Test1234");

await mongoose.disconnect();
process.exit(0);
