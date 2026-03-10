import mongoose from 'mongoose';

const ProfessionalSchema = new mongoose.Schema(
    {
        mentorId: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        university: {
            type: String,
            required: true,
        },
        profession: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        about: {
            type: String,
            default: null
        },
        isFeatured: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export default mongoose.models.Professional || mongoose.model('Professional', ProfessionalSchema);
