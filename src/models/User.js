import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email address'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please fill a valid email address',
        ],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        select: false, // Don't return password by default
    },
    role: {
        type: String,
        enum: ['student', 'professional', 'admin'],
        default: 'student',
    },
    // Optional: Only relevant if the user is a 'professional'
    mentorId: {
        type: String,
        default: null
    }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
