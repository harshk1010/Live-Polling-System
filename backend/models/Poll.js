import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
});

const pollSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: [optionSchema],

    timeLimit: { type: Number, required: true }, // seconds

    startTime: {
        type: Date,
        default: Date.now, // ✅ authoritative start
    },

    isActive: {
        type: Boolean,
        default: true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("Poll", pollSchema);
