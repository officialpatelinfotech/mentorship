import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
    mentorName: {
        type: String,
        required: [true, 'Mentor name is required.'],
    },
    candidateName: {
        type: String,
        required: [true, 'Candidate name is required.'],
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required.'],
    },
    email: {
        type: String,
        required: [true, 'Email address is required.'],
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
    },
    qualification: {
        type: String,
        required: [true, 'Qualification is required.'],
    },
    sessionReason: {
        type: String,
        required: [true, 'Session reason is required.'],
    },
    sessionDate: {
        type: String,
        required: [true, 'Session date is required.'],
    },
    sessionTime: {
        type: String,
        required: [true, 'Session time is required.'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Avoid OverwriteModelError in Next.js development when hot reloading
export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
