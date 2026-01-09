
import React from "react";

const PollQuestion = ({
    question,
    selectedOption,
    setSelectedOption,
    handleSubmit,
    timer,
    submitted,
    result,
}) => {
    /* ---------------- SAFETY GUARD ---------------- */
    if (!question || !Array.isArray(question.options)) {
        return (
            <div className="text-center text-gray-500 py-10">
                Loading question...
            </div>
        );
    }

//    const timeLimit = question.timeLimit || 60;

    return (
        <div className="m-auto max-w-6xl w-full bg-white px-4">
            <div className="p-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-bold text-black">Question</h2>
                    <span className="text-sm font-semibold text-red-500">
                        ⏱ {timer < 10 ? `0${timer}` : timer}
                    </span>
                </div>

                {/* Question */}
                <div className="rounded-t-md bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-2 font-medium">
                    {question.text}
                </div>

                {/* Options */}
                <div className="border border-purple-300 border-t-0 rounded-b-md p-4 space-y-3">
                    {question.options.map((opt, index) => {
                        const votes = result?.answers?.[opt._id] || 0;

                        const totalVotes = Object.values(
                            result?.answers || {}
                        ).reduce((acc, c) => acc + c, 0);

                        const percentage =
                            totalVotes > 0
                                ? Math.round((votes / totalVotes) * 100)
                                : 0;

                        const isSelected = selectedOption === opt._id;

                        return (
                            <label
                                key={opt._id}
                                className={`relative flex items-center justify-between px-4 py-2 rounded-md transition-all text-left
                                ${
                                    submitted
                                        ? "bg-gray-100"
                                        : isSelected
                                        ? "border-2 border-purple-500 bg-purple-50"
                                        : "hover:bg-gray-50 border"
                                }`}
                            >
                                {/* Option text */}
                                <div className="flex items-center space-x-3 z-10">
                                    <span className="w-6 h-6 flex items-center justify-center text-sm rounded-full border font-bold">
                                        {index + 1}
                                    </span>
                                    <span className="text-sm font-medium">
                                        {opt.text}
                                    </span>
                                </div>

                                {/* Result bar */}
                                {submitted && (
                                    <>
                                        <div
                                            className="absolute top-0 left-0 h-full bg-purple-500 opacity-20 rounded-md"
                                            style={{ width: `${percentage}%` }}
                                        />
                                        <span className="z-10 font-semibold text-sm">
                                            {percentage}%
                                        </span>
                                    </>
                                )}

                                {/* Hidden radio */}
                                {!submitted && (
                                    <input
                                        type="radio"
                                        name="poll"
                                        checked={isSelected}
                                        onChange={() =>
                                            setSelectedOption(opt._id)
                                        }
                                        className="hidden"
                                    />
                                )}
                            </label>
                        );
                    })}
                </div>

                {/* Submit */}
                {!submitted && (
                    <div className="flex justify-center mt-5">
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedOption}
                            className="bg-purple-600 text-white px-6 py-2 rounded-full disabled:opacity-50"
                        >
                            Submit
                        </button>
                    </div>
                )}

                {/* After submit */}
                {submitted && (
                    <p className="text-center mt-6 font-medium text-purple-600">
                        Wait for the teacher to ask a new question...
                    </p>
                )}
            </div>
        </div>
    );
};

export default PollQuestion;
