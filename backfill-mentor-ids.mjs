// One-time script to backfill mentorId for existing professionals who don't have one.
// Run with: node backfill-mentor-ids.mjs

import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read .env.local manually
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    // Remove surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
    }
    envVars[key] = val;
}

const MONGODB_URI = envVars.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
}

async function backfill() {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.connection.collection('users');

    // Find the highest existing mentor ID number
    const allMentors = await User.find(
        { role: 'professional', mentorId: { $ne: null } },
        { projection: { mentorId: 1 } }
    ).toArray();

    let maxNum = 0;
    for (const m of allMentors) {
        const match = m.mentorId?.match(/m_(\d+)/);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
        }
    }

    // Find professionals without a mentor ID
    const professionalsWithoutId = await User.find(
        { role: 'professional', $or: [{ mentorId: null }, { mentorId: { $exists: false } }] }
    ).toArray();

    if (professionalsWithoutId.length === 0) {
        console.log('✅ All professionals already have a mentorId. Nothing to do.');
    } else {
        console.log(`Found ${professionalsWithoutId.length} professional(s) without mentorId. Assigning...`);

        for (const prof of professionalsWithoutId) {
            maxNum++;
            const newId = `m_${String(maxNum).padStart(3, '0')}`;
            await User.updateOne({ _id: prof._id }, { $set: { mentorId: newId } });
            console.log(`  → ${prof.name} (${prof.email}) → ${newId}`);
        }

        console.log(`✅ Done! Assigned mentorId to ${professionalsWithoutId.length} professional(s).`);
    }

    await mongoose.disconnect();
}

backfill().catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
});
