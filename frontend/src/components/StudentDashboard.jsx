
import React, { useEffect, useState, useRef } from "react";
import socket from "../socket";
import PollQuestion from "./PollQuestion";
import ChatSidebar from "./ChatSidebar";
import WaitingScreen from "./WaitingScreen";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
    const timerRef = useRef(null);
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [isRegistered, setIsRegistered] = useState(false);

    const [question, setQuestion] = useState(null);
    const [pollActive, setPollActive] = useState(false);

    const [selectedOption, setSelectedOption] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [timer, setTimer] = useState(0);

    /* ---------------- RESET ON LOAD ---------------- */
    useEffect(() => {
        localStorage.removeItem("studentName");
        localStorage.removeItem("userRole");
        setIsRegistered(false);
    }, []);

/* ---------------- KICK HANDLER ---------------- */
useEffect(() => {
    const onKicked = () => {
        localStorage.clear();
        navigate("/kicked"); // ✅ must match route
    };

    socket.on("kicked", onKicked);
    return () => socket.off("kicked", onKicked);
}, [navigate]);


    /* ---------------- REGISTER STUDENT ---------------- */
    const handleRegister = () => {
        if (!name.trim()) return;

        socket.emit("register-student", { name });

        socket.once("registration:success", () => {
            localStorage.setItem("studentName", name);
            localStorage.setItem("userRole", "student");
            setIsRegistered(true);

            // Ask backend for active poll (late join support)
            socket.emit("get-active-poll");
        });
    };

    /* ---------------- SOCKET EVENTS ---------------- */
    useEffect(() => {
        const handlePollStarted = (poll) => {
            if (!poll || !poll._id) {
                setPollActive(false);
                setQuestion(null);
                return;
            }

            setQuestion(poll);
            setPollActive(true);
            setSubmitted(false);
            setSelectedOption("");

            setTimer(
                poll.remainingTime !== undefined
                    ? poll.remainingTime
                    : poll.timeLimit
            );
        };

        const handlePollEnded = () => {
            setPollActive(false);
            setQuestion(null);
            setSubmitted(false);
            setSelectedOption("");
            setTimer(0);
        };

        socket.on("poll-started", handlePollStarted);
        socket.on("poll-ended", handlePollEnded);

        return () => {
            socket.off("poll-started", handlePollStarted);
            socket.off("poll-ended", handlePollEnded);
        };
    }, []);

    /* ---------------- TIMER ---------------- */

useEffect(() => {
    if (!pollActive || submitted) return;

    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
        setTimer((prev) => {
            if (prev <= 1) {
                clearInterval(timerRef.current);
                return 0;
            }
            return prev - 1;
        });
    }, 1000);

    return () => clearInterval(timerRef.current);
}, [pollActive, submitted]);


    /* ---------------- SUBMIT ANSWER ---------------- */
    const handleSubmit = () => {
        if (!selectedOption || !question) return;

        socket.emit("submit-answer", {
            questionId: question._id,
            answer: selectedOption,
        });

        // 🔑 After submit → waiting screen
        setSubmitted(true);
    };

    /* ---------------- UI ---------------- */
    return (
        <div className="min-h-screen bg-white px-6">
            {!isRegistered ? (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="w-full max-w-xl text-center">
                        <h1 className="text-3xl font-semibold mb-4">
                            Enter Your Name
                        </h1>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full p-3 border rounded-full mb-4"
                        />

                        <button
                            onClick={handleRegister}
                            className="w-40 py-3 rounded-full bg-purple-600 text-white font-semibold"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <ChatSidebar />

                    {/* ✅ ONLY WAITING SCREEN AFTER SUBMIT OR WHEN NO POLL */}
                    {!pollActive || submitted || !question ? (
                        <WaitingScreen />
                    ) : (
                        <div className="min-h-screen flex items-center justify-center">
                            <div className="w-full max-w-6xl p-6 rounded-xl shadow bg-white">
                                <PollQuestion
                                    question={question}
                                    selectedOption={selectedOption}
                                    setSelectedOption={setSelectedOption}
                                    handleSubmit={handleSubmit}
                                    timer={timer}
                                />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentDashboard;
