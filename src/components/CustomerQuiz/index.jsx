import React, { useEffect } from 'react';
import { Activity, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuiz } from '../../hooks/useQuiz';

export const CustomerQuiz = ({
    currentQ,
    answers,
    shuffledQuestions,
    isCalculating,
    checkingHistory,
    handleAnswer,
    goToPreviousQuestion,
    goToNextQuestion
}) => {

    if (checkingHistory || isCalculating || !shuffledQuestions) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 relative z-10">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <Activity className="relative w-24 h-24 text-white animate-spin drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black italic text-white tracking-tighter uppercase animate-bounce drop-shadow-[4px_4px_0px_#f58362]">
                    {checkingHistory ? "Checking Status..." : "Analyzing Your Vibes..."}
                </h2>
            </div>
        );
    }

    const progress = ((currentQ + 1) / shuffledQuestions.length) * 100;
    const currentQuestionData = shuffledQuestions[currentQ];
    const visualLetters = ["A", "B", "C", "D", "E"];
    const currentAnswer = answers[currentQ]; // Get previously selected answer

    return (
        <div className="max-w-lg mx-auto px-4 py-8 relative z-10">
            <div className="w-full bg-black/20 backdrop-blur-md rounded-full h-4 mb-8 border-2 border-white overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                <div className="bg-[#f4b337] h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[10px_10px_0px_rgba(0,0,0,0.2)] border-4 border-white p-6 transform transition-all animate-fade-in relative overflow-hidden">

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <span className="bg-[#1d248a] text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-widest shadow-[3px_3px_0px_#f58362] border border-white/20">
                        Step {currentQ + 1} / {shuffledQuestions.length}
                    </span>
                    <div className="bg-[#f4b337] p-1.5 rounded-full shadow-[2px_2px_0px_#000000]">
                        <Sparkles className="text-white w-5 h-5 animate-pulse" />
                    </div>
                </div>

                {/* Question Image */}
                {currentQuestionData.image && (
                    <div className="mb-4 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md">
                        <img
                            src={currentQuestionData.image}
                            alt="Question illustration"
                            className="w-full h-48 object-cover"
                        />
                    </div>
                )}

                <h2 className={`text-lg md:text-xl font-black text-[#1d248a] mb-6 leading-tight uppercase italic tracking-tight relative z-10 drop-shadow-sm ${currentQuestionData.isImportant ? 'text-[#db2777]' : ''
                    }`}>
                    {currentQuestionData.text}
                    {currentQuestionData.isImportant && <span className="text-[#f58362] ml-2">✨</span>}
                </h2>

                <div className="space-y-3 relative z-10">
                    {currentQuestionData.options.map((option, idx) => {
                        const isSelected = currentAnswer === option.value;
                        return (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(option.value)}
                                className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 group flex items-center active:scale-95 active:shadow-none active:translate-y-0 ${isSelected
                                    ? 'bg-[#f4b337] border-[#f58362] shadow-[4px_4px_0px_#f58362]'
                                    : 'bg-white border-transparent shadow-[3px_3px_0px_rgba(0,0,0,0.1)] hover:shadow-[4px_4px_0px_#f58362] hover:border-[#f58362] hover:-translate-y-0.5'
                                    }`}
                            >
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full text-white font-black text-xs flex items-center justify-center mr-3 transition-colors duration-200 shadow-inner border-2 border-white ${isSelected
                                    ? 'bg-[#f58362]'
                                    : 'bg-[#1d248a] group-hover:bg-[#f58362]'
                                    }`}>
                                    {visualLetters[idx]}
                                </div>
                                <span className={`font-bold text-sm leading-tight uppercase tracking-tight ${isSelected ? 'text-[#1d248a]' : 'text-gray-800'
                                    }`}>
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4 mt-8 relative z-10">
                    <button
                        onClick={goToPreviousQuestion}
                        disabled={currentQ === 0}
                        className="flex-1 bg-white text-[#1d248a] font-black uppercase tracking-widest py-3 rounded-xl border-2 border-[#1d248a] hover:bg-[#1d248a] hover:text-white transition-all shadow-[4px_4px_0px_#1d248a] active:shadow-none active:translate-y-1 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#1d248a] flex items-center justify-center gap-2 text-sm"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back
                    </button>

                    <button
                        onClick={goToNextQuestion}
                        disabled={!currentAnswer}
                        className="flex-1 bg-[#f58362] text-white font-black uppercase tracking-widest py-3 rounded-xl border-2 border-transparent hover:bg-[#e06d4d] transition-all shadow-[4px_4px_0px_#000] active:shadow-none active:translate-y-1 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#f58362] flex items-center justify-center gap-2 text-sm"
                    >
                        {currentQ === shuffledQuestions.length - 1 ? (
                            <>
                                Finish <ChevronRight className="w-5 h-5" />
                            </>
                        ) : (
                            <>
                                Next <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
