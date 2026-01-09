
// import React, { useEffect, useRef, useState } from 'react';
// import { FiMessageSquare } from 'react-icons/fi';
// import { IoSend } from 'react-icons/io5';
// import socket from '../socket';

// const ChatSidebar = () => {
//     const [open, setOpen] = useState(false);
//     const [tab, setTab] = useState('chat');
//     const [messages, setMessages] = useState([]);
//     const [input, setInput] = useState('');
//     const [participants, setParticipants] = useState([]);

//     const [role, setRole] = useState(null);

// useEffect(() => {
//     setRole(localStorage.getItem("userRole"));
// }, []);

//     const name = localStorage.getItem("studentName");

//     const messagesEndRef = useRef(null);

//     useEffect(() => {
//     if (!role) {
//         localStorage.setItem("userRole", "student");
//     }
// }, []);


//     /* -------------------- SOCKET LISTENERS -------------------- */
//     useEffect(() => {
//         socket.emit("get-all-messages");
//         socket.emit("request-participants");

//         socket.on("chat:messages", (msgs) => {
//             setMessages(msgs);
//             scrollToBottom();
//         });

//         socket.on("chat:message", (msg) => {
//             setMessages(prev => [...prev, msg]);
//             scrollToBottom();
//         });

//         socket.on("participants:update", (data) => {
//             setParticipants(data);
//         });

//         return () => {
//             socket.off("chat:messages");
//             socket.off("chat:message");
//             socket.off("participants:update");
//         };
//     }, []);

//     const scrollToBottom = () => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     };

//     const handleSend = () => {
//         if (!input.trim()) return;

//         socket.emit("chat:message", {
//             sender: role === "teacher" ? "Teacher" : name,
//             text: input.trim(),
//         });

//         setInput('');
//     };

//     const handleKick = (targetName) => {
//         if (role !== 'teacher') return;
//         socket.emit('kick-student', { studentName: targetName });
//     };
//     useEffect(() => {
//     if (open && tab === "participants") {
//         socket.emit("request-participants");
//     }
// }, [open, tab]);


//     return (
//         <>
//             {/* Floating Button */}
//             <div className="fixed bottom-6 right-6 z-50">
//                 <button
//                     className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition"
//                     onClick={() => setOpen(!open)}
//                 >
//                     <FiMessageSquare size={24} />
//                 </button>
//             </div>

//             {open && (
//                 <div className="fixed bottom-20 right-6 w-fit md:w-96 p-3 max-h-[80vh] bg-white rounded-xl shadow-2xl border z-40 flex flex-col animate-slide-in">
//                     {/* Tabs */}
//                     <div className="flex border-b border-gray-300">
//                         {['chat', 'participants'].map((tabName) => (
//                             <button
//                                 key={tabName}
//                                 className={`flex-1 px-4 py-2 text-sm font-medium ${
//                                     tab === tabName
//                                         ? 'bg-purple-100 text-purple-700'
//                                         : 'text-gray-500 hover:bg-gray-100'
//                                 }`}
//                                 onClick={() => setTab(tabName)}
//                             >
//                                 {tabName === 'chat' ? 'Chat' : 'Participants'}
//                             </button>
//                         ))}
//                     </div>

//                     {/* Content */}
//                     <div className="flex-1 flex flex-col p-4 overflow-hidden">
//                         {tab === 'chat' ? (
//                             <>
//                                 <div className="flex-1 overflow-y-auto space-y-2">
//                                     {messages.map((msg, index) => {
//                                         const isOwn =
//                                             msg.sender === name ||
//                                             (role === "teacher" && msg.sender === "Teacher");

//                                         return (
//                                             <div
//                                                 key={index}
//                                                 className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
//                                                     isOwn
//                                                         ? 'bg-purple-600 text-white self-end'
//                                                         : 'bg-gray-100 text-gray-800 self-start'
//                                                 }`}
//                                             >
//                                                 <div className="font-semibold text-xs">
//                                                     {msg.sender}
//                                                 </div>
//                                                 {msg.text}
//                                             </div>
//                                         );
//                                     })}
//                                     <div ref={messagesEndRef} />
//                                 </div>

//                                 <div className="flex gap-2 mt-2">
//                                     <input
//                                         value={input}
//                                         onChange={(e) => setInput(e.target.value)}
//                                         placeholder="Type a message..."
//                                         className="flex-1 px-3 py-2 border rounded-lg"
//                                         onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//                                     />
//                                     <button
//                                         onClick={handleSend}
//                                         className="bg-purple-600 text-white px-4 py-2 rounded-lg"
//                                     >
//                                         <IoSend size={18} />
//                                     </button>
//                                 </div>
//                             </>
//                         ) : (
//                             <table className="w-full text-sm">
//                                 <tbody>
//                                     {participants.map((p, i) => (
//                                         <tr key={i} className="border-b">
//                                             <td className="py-2">{p}</td>
//                                             {role === "teacher" && (
//                                                 <td className="text-right">
//                                                     <button
//                                                         onClick={() => handleKick(p)}
//                                                         className="text-red-500"
//                                                     >
//                                                         Kick
//                                                     </button>
//                                                 </td>
//                                             )}
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         )}
//                     </div>
//                 </div>
//             )}

//             <style>{`
//                 .animate-slide-in {
//                     animation: slide-in 0.3s ease-out;
//                 }
//                 @keyframes slide-in {
//                     from { transform: translateY(20px); opacity: 0; }
//                     to { transform: translateY(0); opacity: 1; }
//                 }
//             `}</style>
//         </>
//     );
// };

// export default ChatSidebar;


import React, { useEffect, useRef, useState } from 'react';
import { FiMessageSquare } from 'react-icons/fi';
import { IoSend } from 'react-icons/io5';
import socket from '../socket';

const ChatSidebar = () => {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState('chat');
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [participants, setParticipants] = useState([]);
    const [role, setRole] = useState(null);

    const name = localStorage.getItem("studentName");
    const messagesEndRef = useRef(null);

    /* -------------------- LOAD ROLE SAFELY -------------------- */
    useEffect(() => {
        const storedRole = localStorage.getItem("userRole");
        setRole(storedRole);
    }, []);

    /* -------------------- SOCKET LISTENERS -------------------- */
    useEffect(() => {
        socket.emit("get-all-messages");
        socket.emit("request-participants");

        socket.on("chat:messages", (msgs) => {
            setMessages(msgs);
            scrollToBottom();
        });

        socket.on("chat:message", (msg) => {
            setMessages(prev => [...prev, msg]);
            scrollToBottom();
        });

        socket.on("participants:update", (data) => {
            setParticipants(data);
        });

        return () => {
            socket.off("chat:messages");
            socket.off("chat:message");
            socket.off("participants:update");
        };
    }, []);

    /* -------------------- REFRESH PARTICIPANTS ON TAB OPEN -------------------- */
    useEffect(() => {
        if (open && tab === "participants") {
            socket.emit("request-participants");
        }
    }, [open, tab]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = () => {
        if (!input.trim()) return;

        socket.emit("chat:message", {
            sender: role === "teacher" ? "Teacher" : name,
            text: input.trim(),
        });

        setInput('');
    };

    const handleKick = (targetName) => {
        if (role !== "teacher") return;
        if (targetName === "Teacher") return; // safety

        socket.emit("kick-student", { studentName: targetName });
    };

    return (
        <>
            {/* Floating Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition"
                    onClick={() => setOpen(!open)}
                >
                    <FiMessageSquare size={24} />
                </button>
            </div>

            {open && (
                <div className="fixed bottom-20 right-6 w-fit md:w-96 p-3 max-h-[80vh] bg-white rounded-xl shadow-2xl border z-40 flex flex-col animate-slide-in">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-300">
                        {['chat', 'participants'].map((tabName) => (
                            <button
                                key={tabName}
                                className={`flex-1 px-4 py-2 text-sm font-medium ${
                                    tab === tabName
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'text-gray-500 hover:bg-gray-100'
                                }`}
                                onClick={() => setTab(tabName)}
                            >
                                {tabName === 'chat' ? 'Chat' : 'Participants'}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col p-4 overflow-hidden">
                        {tab === 'chat' ? (
                            <>
                                <div className="flex-1 overflow-y-auto space-y-2">
                                    {messages.map((msg, index) => {
                                        const isOwn =
                                            msg.sender === name ||
                                            (role === "teacher" && msg.sender === "Teacher");

                                        return (
                                            <div
                                                key={index}
                                                className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                                                    isOwn
                                                        ? 'bg-purple-600 text-white self-end'
                                                        : 'bg-gray-100 text-gray-800 self-start'
                                                }`}
                                            >
                                                <div className="font-semibold text-xs">
                                                    {msg.sender}
                                                </div>
                                                {msg.text}
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="flex gap-2 mt-2">
                                    <input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 px-3 py-2 border rounded-lg"
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    />
                                    <button
                                        onClick={handleSend}
                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        <IoSend size={18} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <table className="w-full text-sm">
                                <tbody>
                                    {participants.map((p, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="py-2">{p}</td>
                                            {role === "teacher" && p !== "Teacher" && (
                                                <td className="text-right">
                                                    <button
                                                        onClick={() => handleKick(p)}
                                                        className="text-red-500"
                                                    >
                                                        Kick
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
                @keyframes slide-in {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </>
    );
};

export default ChatSidebar;
