
import Poll from "./models/Poll.js";
import Student from "./models/Student.js";
import Response from "./models/Response.js";
import Message from "./models/Message.js";

let activePollTimeout = null;

export default function socketHandler(socket, io) {
    console.log("Client connected:", socket.id);

    /* -------------------- STUDENT REGISTER -------------------- */
    socket.on("register-student", async ({ name }) => {
        // 🚫 Prevent rejoin if student was kicked
        const existing = await Student.findOne({ name });
        if (existing?.isKicked) {
            socket.emit("kicked");
            return;
        }

        socket.data.name = name;

        await Student.updateOne(
    { name },                          // ✅ match by name
    { $set: { socketId: socket.id, isKicked: false } },
    { upsert: true }
);


        const students = await Student.find({ isKicked: false });
        io.emit("participants:update", students.map(s => s.name));
        socket.emit("registration:success");
    });

    /* -------------------- CHAT -------------------- */
 
socket.on("chat:message", async ({ sender, text }) => {
    // 🚀 Teacher messages are always allowed
    if (sender !== "Teacher") {
        const student = await Student.findOne({ socketId: socket.id });
        if (!student || student.isKicked) return;
    }

    const msg = await Message.create({
        sender,
        text,
    });

    io.emit("chat:message", msg);
});



    socket.on("get-all-messages", async () => {
        const msgs = await Message.find().sort({ createdAt: 1 });
        socket.emit("chat:messages", msgs);
    });

    /* -------------------- KICK STUDENT -------------------- */
    socket.on("kick-student", async ({ studentName }) => {
        const student = await Student.findOne({ name: studentName });
        if (!student) return;

        student.isKicked = true;
        await student.save();

        // 🚫 Notify only that student
        io.to(student.socketId).emit("kicked");

        // 🔄 Update participants list
        const students = await Student.find({ isKicked: false });
        io.emit("participants:update", students.map(s => s.name));

        console.log(`🚫 Student kicked: ${studentName}`);
    });

    /* ==========================================================
       CREATE POLL (UNCHANGED)
    ========================================================== */
    socket.on("create-poll", async ({ text, options, timeLimit }) => {
        const activePoll = await Poll.findOne({ isActive: true });

        if (activePoll) {
            const totalStudents = await Student.countDocuments({ isKicked: false });
            const responses = await Response.countDocuments({
                pollId: activePoll._id,
            });

            if (responses < totalStudents) {
                socket.emit("poll-locked");
                return;
            }

            activePoll.isActive = false;
            await activePoll.save();
        }

        const poll = await Poll.create({
            text,
            options,
            timeLimit,
            startTime: new Date(),
            isActive: true,
        });

        io.emit("poll-started", {
            ...poll.toObject(),
            remainingTime: timeLimit,
        });

        if (activePollTimeout) clearTimeout(activePollTimeout);

        activePollTimeout = setTimeout(async () => {
            await Poll.findByIdAndUpdate(poll._id, { isActive: false });
            await emitFinalResults(io, poll._id);
            io.emit("poll-ended", { pollId: poll._id });
            io.emit("poll-status", { canAskNew: true });  
        }, timeLimit * 1000);
    });

    /* ==========================================================
       SUBMIT ANSWER
    ========================================================== */
    socket.on("submit-answer", async ({ questionId, answer }) => {
        const student = await Student.findOne({ socketId: socket.id });
        if (!student || student.isKicked) return;

        const alreadyAnswered = await Response.findOne({
            pollId: questionId,
            studentId: student._id,
        });
        if (alreadyAnswered) return;

        const poll = await Poll.findById(questionId);
        if (!poll || !poll.isActive) return;

        const option = poll.options.id(answer);

        await Response.create({
            studentId: student._id,
            pollId: questionId,
            selectedOption: answer,
            isCorrect: option?.isCorrect || false,
        });

        emitLiveResults(io, poll._id);
    });

    /* ==========================================================
       STATE RECOVERY
    ========================================================== */
    socket.on("get-active-poll", async () => {
        const poll = await Poll.findOne({ isActive: true });
        if (!poll) return;

        const elapsed = Math.floor(
            (Date.now() - poll.startTime.getTime()) / 1000
        );

        const remainingTime = Math.max(poll.timeLimit - elapsed, 0);

        socket.emit("poll-started", {
            ...poll.toObject(),
            remainingTime,
        });

        emitLiveResults(socket, poll._id);
    });

/* -------------------- REQUEST PARTICIPANTS -------------------- */
socket.on("request-participants", async () => {
    const students = await Student.find({ isKicked: false });
    socket.emit("participants:update", students.map(s => s.name));
});


    /* -------------------- DISCONNECT -------------------- */


socket.on("disconnect", async () => {
    const students = await Student.find({ isKicked: false });
    io.emit("participants:update", students.map(s => s.name));
});
}
/* ================= HELPERS ================= */

async function emitLiveResults(io, pollId) {
    const poll = await Poll.findById(pollId);
    if (!poll) return;

    const responses = await Response.find({ pollId });

    const counts = {};
    poll.options.forEach(opt => (counts[opt._id] = 0));

    responses.forEach(r => {
        counts[r.selectedOption?.toString()]++;
    });

    const totalVotes = responses.length;

    const percentages = {};
    for (const key in counts) {
        percentages[key] = totalVotes
            ? Math.round((counts[key] / totalVotes) * 100)
            : 0;
    }

    io.emit("poll-results", {
        counts,
        percentages,
        totalVotes,
    });
}

async function emitFinalResults(io, pollId) {
    await emitLiveResults(io, pollId);
}


