 import mongoose from "mongoose";

const responseSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },

    pollId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Poll",
        required: true,
    },

    selectedOption: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },

    isCorrect: {
        type: Boolean,
        default: false,
    },

    socketId: {
        type: String,
    },

    submittedAt: {
        type: Date,
        default: Date.now,
    },
});

responseSchema.index(
    { studentId: 1, pollId: 1 },
    { unique: true }
);


export default mongoose.model("Response", responseSchema);
