
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket";
import ChatSidebar from "./ChatSidebar";

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [questionText, setQuestionText] = useState("");
    const [options, setOptions] = useState([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
    ]);
    const [pollTime, setPollTime] = useState(60);

    const handleOptionChange = (index, value) => {
        const updated = [...options];
        updated[index].text = value;
        setOptions(updated);
    };

    const handleCorrectToggle = (index, value) => {
        const updated = options.map((opt, i) => ({
            ...opt,
            isCorrect: i === index ? value : opt.isCorrect,
        }));
        setOptions(updated);
    };

    const addOptionField = () => {
        if (options.length < 5) {
            setOptions([...options, { text: "", isCorrect: false }]);
        }
    };

    const createPoll = () => {
        const cleanOptions = options.filter(opt => opt.text.trim() !== "");
        if (!questionText || cleanOptions.length < 2 || pollTime <= 0) return;

        sessionStorage.removeItem("teacher_poll_navigated");
        sessionStorage.removeItem("poll_expiry_time");

        socket.emit("create-poll", {
            text: questionText,
            options: cleanOptions,
            timeLimit: pollTime,
        });

        // Reset local UI state
        setQuestionText("");
        setOptions([
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
        ]);
        setPollTime(60);
    };

    const [socketReady, setSocketReady] = useState(false);

useEffect(() => {
    localStorage.setItem("userRole", "teacher");

    // ✅ Register teacher like a participant
    socket.emit("register-student", { name: "Teacher" });
}, []);


useEffect(() => {
    socket.on("connect", () => {
        console.log("✅ Teacher socket connected:", socket.id);
        setSocketReady(true);
    });

    return () => {
        socket.off("connect");
    };
}, []);

    useEffect(() => {
        const onPollStarted = (poll) => {
             console.log("📢 poll-started received:", poll);
            if (!poll) return;

            // 1. Check if we already handled this specific poll
            const alreadyNavigated = sessionStorage.getItem("teacher_poll_navigated");
            if (alreadyNavigated) return;

            // 2. CALCULATE ABSOLUTE EXPIRY (Key Fix)
            // Current Time + (Duration in seconds * 1000)
            const expiryTime = Date.now() + poll.timeLimit * 1000;
            
            // 3. Store in SessionStorage so it persists during navigation
            sessionStorage.setItem("poll_expiry_time", expiryTime.toString());
            sessionStorage.setItem("teacher_poll_navigated", "true");

            navigate("/live-results", {
                state: { 
                    poll: {
                        ...poll,
                        expiryTime // Pass the fixed timestamp to the next page
                    } 
                },
            });
        };

        socket.on("poll-started", onPollStarted);

        return () => {
            socket.off("poll-started", onPollStarted);
        };
    }, [navigate]);

    useEffect(() => {
        const onPollEnded = () => {
            // Clean up storage when the poll is finished
            sessionStorage.removeItem("teacher_poll_navigated");
            sessionStorage.removeItem("poll_expiry_time");
        };

        socket.on("poll-ended", onPollEnded);

        return () => {
            socket.off("poll-ended", onPollEnded);
        };
    }, []);

    return (
        <>
            <ChatSidebar />
            <div className="min-h-screen bg-white p-6 text-dark">
                <div className="max-w-6xl mx-auto p-8 bg-white rounded-xl shadow border border-gray-200">
                    <div className="mb-6">
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary text-white mb-4">
                            ✨ Intervue Poll
                        </span>
                        <h2 className="text-3xl font-bold mt-3">
                            Let’s <span className="text-primary">Get Started</span>
                        </h2>
                        <p className="text-gray-500 mt-2">
                            You’ll have the ability to create and manage polls, ask questions,
                            and monitor your students’ responses in real-time.
                        </p>
                    </div>

                    <div className="mb-4 flex justify-between items-center max-w-lg">
                        <label className="block font-medium text-gray-800 text-sm">
                            Enter your question
                        </label>
                        <select
                            value={pollTime}
                            onChange={(e) => setPollTime(Number(e.target.value))}
                            className="border border-gray-300 rounded px-3 py-1 text-sm bg-gray-50"
                        >
                            {[15, 30, 45, 60, 90, 120].map(sec => (
                                <option key={sec} value={sec}>
                                    {sec} seconds
                                </option>
                            ))}
                        </select>
                    </div>

                    <textarea
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value.slice(0, 100))}
                        placeholder="Type your question here..."
                        className="w-full max-w-lg border rounded-md p-3 h-24"
                    />

                    <div className="mt-6">
                        {options.map((opt, index) => (
                            <div key={index} className="grid grid-cols-2 gap-2 mt-2">
                                <input
                                    value={opt.text}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                    className="border p-2 rounded"
                                />
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`correct-${index}`}
                                            checked={opt.isCorrect}
                                            onChange={() => handleCorrectToggle(index, true)}
                                        /> Yes
                                    </label>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`correct-${index}`}
                                            checked={!opt.isCorrect}
                                            onChange={() => handleCorrectToggle(index, false)}
                                        /> No
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={addOptionField} 
                        className="mt-3 text-primary font-medium hover:underline"
                    >
                        + Add More option
                    </button>

                    <div className="flex justify-end mt-4">
                        <button onClick={createPoll} className="bg-primary text-white px-6 py-2 rounded font-bold hover:bg-opacity-90">
                            Ask Question
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TeacherDashboard;

