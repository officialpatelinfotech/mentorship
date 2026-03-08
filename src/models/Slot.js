import mongoose from 'mongoose';

const SlotSchema = new mongoose.Schema({
    mentorId: {
        type: String,
        required: [true, 'Mentor ID is required'],
        index: true,
    },
    date: {
        type: String,
        required: [true, 'Date is required'], // Format: "YYYY-MM-DD"
    },
    time: {
        type: String,
        required: [true, 'Time is required'], // Format: "10:00 AM"
    },
    isBooked: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Compound index to prevent duplicate slots
SlotSchema.index({ mentorId: 1, date: 1, time: 1 }, { unique: true });

export default mongoose.models.Slot || mongoose.model('Slot', SlotSchema);
