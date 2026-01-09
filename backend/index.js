
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import socketHandler from "./socket.js";
import Poll from "./models/Poll.js";
import Response from "./models/Response.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

/* -------------------- CORS -------------------- */
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
];


app.use(
    cors({
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
    })
);

app.use(express.json());

/* -------------------- SOCKET.IO SETUP -------------------- */
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

/* -------------------- MONGODB CONNECTION -------------------- */
if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI missing in .env");
    process.exit(1);
}

mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("✅ MongoDB connected successfully");

        // 🔥 RESET STATE ON EVERY SERVER RESTART
        await Poll.updateMany(
            { isActive: true },
            { $set: { isActive: false } }
        );

        await Response.deleteMany({});

        console.log("🧹 Cleared active polls and responses on restart");
    })
    .catch((err) => {
        console.error("❌ MongoDB error:", err);
        process.exit(1);
    });

/* -------------------- SOCKET HANDLER -------------------- */
io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);
    socketHandler(socket, io);
});

/* -------------------- ROUTES -------------------- */
app.get("/", (req, res) => {
    res.send("🎉 Polling server is running!");
});

app.get("/api/polls/history", async (req, res) => {
    try {
        const polls = await Poll.find().sort({ createdAt: -1 });
        const responses = await Response.find();

        const history = polls.map((poll) => {
            const pollResponses = responses.filter(
                (r) => r.pollId?.toString() === poll._id.toString()
            );

            const totalVotes = pollResponses.length;

            const options = poll.options.map((option) => {
                const count = pollResponses.filter(
                    (r) =>
                        r.selectedOption &&
                        r.selectedOption.toString() === option._id.toString()
                ).length;

                return {
                    _id: option._id,
                    text: option.text,
                    isCorrect: option.isCorrect,
                    count,
                    percentage: totalVotes
                        ? Math.round((count / totalVotes) * 100)
                        : 0,
                };
            });

            return {
                _id: poll._id,
                question: poll.text,
                totalVotes,
                options,
                createdAt: poll.createdAt,
            };
        });

        res.json(history);
    } catch (err) {
        console.error("❌ Poll history error:", err);
        res.status(500).json({ error: "Failed to fetch poll history" });
    }
});

/* -------------------- START SERVER -------------------- */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
