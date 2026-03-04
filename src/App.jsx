import React, { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { ArrowRight } from 'lucide-react';
import { HashRouter, Routes, Route } from 'react-router-dom';

// Firebase & Config
import { auth } from './config/firebase';
import { ADIDAS_LOGO } from './constants/assets';

// Components
import { EventSelectionPortal } from './components/EventSelectionPortal';
import { LandingPage } from './components/LandingPage';
import { DemographicsForm } from './components/DemographicsForm';
import { CustomerQuiz } from './components/CustomerQuiz';
import { CustomerResult } from './components/CustomerResult';
import { StaffDashboard } from './components/StaffDashboard';

// Pages
import { InsightsDashboard } from './pages/InsightsPage';
import { EventPage } from './pages/EventPage';
import { getParameterByName } from './utils/helpers';
import { APP_CONFIG } from './config/app';
import { useQuiz } from './hooks/useQuiz';

// --- ROUTER FLOW COMPONENTS ---

const ClientFlow = ({ user }) => {
    const [currentResult, setCurrentResult] = useState(null);
    const [generatedCode, setGeneratedCode] = useState("");
    const [eventId, setEventId] = useState(getParameterByName('eventId') || APP_CONFIG.defaultEventId);
    const [view, setView] = useState(APP_CONFIG.enableEvents && !eventId ? 'event-selection' : 'home');
    const [demographics, setDemographics] = useState(null);
    const [scrollY, setScrollY] = useState(0);
    const [quizData, setQuizData] = useState(null);

    const handleQuizComplete = (result) => {
        setCurrentResult(result.result);
        setGeneratedCode(result.code);
        if (result.eventData) {
            setEventData(result.eventData);
        }
        if (result.isExisting) {
            setView('result');
        } else {
            setQuizData(result);
            setView('demographics');
        }
    };

    const {
        currentQ,
        answers,
        shuffledQuestions,
        isCalculating,
        checkingHistory,
        handleAnswer,
        goToPreviousQuestion,
        goToNextQuestion,
        checkQuizHistory,
        eventData,
        setEventData
    } = useQuiz(user, handleQuizComplete, eventId, demographics);

    useEffect(() => {
        checkQuizHistory();
    }, [user, view]);

    // Get eventId from URL params on mount
    useEffect(() => {
        if (APP_CONFIG.enableEvents && eventId) {
            eventId !== APP_CONFIG.defaultEventId && setEventId(eventId);
            setView('home');
        }
    }, [eventId]);

    // Handle scroll blur effect
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSelectEvent = (id) => {
        setEventId(id);
        setView('home');
    };

    const handleStartQuiz = () => {
        setView('quiz');
    };

    const handleDemographicsSubmit = async (data) => {
        setDemographics(data);
        if (quizData) {
            await quizData.saveToFirebase(data);
        }
        setView('result');
    };

    return (
        <>
            <nav className={`fixed w-full z-50 top-0 transition-all duration-300 ${scrollY > 50
                ? 'backdrop-blur-xl shadow-lg'
                : 'backdrop-blur-sm bg-transparent'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className={`flex justify-between items-center transition-all duration-300 ${scrollY > 50 ? 'h-16' : 'h-20'}`}>
                        <div className="flex items-center cursor-pointer gap-3 group" onClick={() => setView(APP_CONFIG.enableEvents && !eventId ? 'event-selection' : 'home')}>
                            <div className={`bg-white/10 backdrop-blur-sm p-1.5 rounded-lg border-2 border-white/20 group-hover:scale-105 transition-transform shadow-lg group-hover:rotate-3 ${scrollY > 50 ? 'scale-90' : 'scale-100'}`}>
                                <img src={ADIDAS_LOGO} alt="Adidas" className="h-6 w-auto brightness-0 invert" />
                            </div>
                            <span className={`font-black italic tracking-tighter text-white drop-shadow-[2px_2px_0px_#1d248a] group-hover:scale-105 transition-all ${scrollY > 50 ? 'text-lg' : 'text-3xl'}`}>
                                <span className="text-[#f4b337]">ADIDAS VIBES</span>
                            </span>
                        </div>
                        <div className={`hidden md:flex space-x-2 transition-opacity ${scrollY > 50 ? 'opacity-0' : 'opacity-100'}`}>
                            <span className="w-2.5 h-2.5 rounded-full bg-white border border-white/50 animate-bounce"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-white/50 border border-white/50 animate-bounce delay-100"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-white/30 border border-white/50 animate-bounce delay-200"></span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-24 pb-20 relative w-full">
                {view === 'event-selection' && APP_CONFIG.enableEvents && <EventSelectionPortal onSelectEvent={handleSelectEvent} />}
                {view === 'home' && <LandingPage startQuiz={handleStartQuiz} eventId={APP_CONFIG.enableEvents && eventId !== APP_CONFIG.defaultEventId ? eventId : null} />}
                {view === 'demographics' && <DemographicsForm onSubmit={handleDemographicsSubmit} eventData={eventData} />}
                {view === 'quiz' && (
                    <CustomerQuiz
                        currentQ={currentQ}
                        answers={answers}
                        shuffledQuestions={shuffledQuestions}
                        isCalculating={isCalculating}
                        checkingHistory={checkingHistory}
                        handleAnswer={handleAnswer}
                        goToPreviousQuestion={goToPreviousQuestion}
                        goToNextQuestion={goToNextQuestion}
                    />
                )}
                {view === 'result' && currentResult && (
                    <CustomerResult result={currentResult} code={generatedCode} eventData={eventData} />
                )}
            </main>

            <footer className="fixed bottom-0 w-full py-4 text-center z-40 pointer-events-none">
                <div className="inline-block bg-black/30 backdrop-blur-md rounded-full px-6 py-2 pointer-events-auto border border-white/10 shadow-lg relative">
                    <div className="flex justify-center items-center gap-4">
                        <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">© 2026 Adidas</p>
                    </div>
                </div>
            </footer>
        </>
    );
};

const StaffFlow = ({ user }) => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <nav className={`fixed w-full z-50 top-0 transition-all duration-300 ${scrollY > 50
                ? 'backdrop-blur-xl bg-black/40 shadow-lg'
                : 'backdrop-blur-sm bg-transparent'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className={`flex justify-between items-center transition-all duration-300 ${scrollY > 50 ? 'h-16' : 'h-20'}`}>
                        <div className="flex items-center cursor-pointer gap-3 group" onClick={() => window.location.hash = '#/'}>
                            <div className={`bg-white/10 backdrop-blur-sm p-1.5 rounded-lg border-2 border-white/20 group-hover:scale-105 transition-transform shadow-lg group-hover:rotate-3 ${scrollY > 50 ? 'scale-90' : 'scale-100'}`}>
                                <img src={ADIDAS_LOGO} alt="Adidas" className="h-6 w-auto brightness-0 invert" />
                            </div>
                            <span className={`font-black italic tracking-tighter text-white drop-shadow-[2px_2px_0px_#1d248a] group-hover:scale-105 transition-all ${scrollY > 50 ? 'text-lg' : 'text-3xl'}`}>
                                <span className="text-[#f4b337]">ADIDAS VIBES</span>
                            </span>
                        </div>
                        <div className={`hidden md:flex space-x-2 transition-opacity ${scrollY > 50 ? 'opacity-0' : 'opacity-100'}`}>
                            <span className="w-2.5 h-2.5 rounded-full bg-white border border-white/50 animate-bounce"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-white/50 border border-white/50 animate-bounce delay-100"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-white/30 border border-white/50 animate-bounce delay-200"></span>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="pt-24 pb-20 relative w-full">
                <StaffDashboard user={user} />
            </main>
        </>
    );
};

// --- MAIN APP COMPONENT ---
export default function AdidasVibesApp() {

    const [user, setUser] = useState(null);

    useEffect(() => {
        const initAuth = async () => {
            await signInAnonymously(auth);
        };
        initAuth();

        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) setUser(u);
        });
        return () => unsubscribe();
    }, []);

    return (
        <HashRouter>
            <div className="min-h-screen font-sans text-gray-900 overflow-hidden selection:bg-[#a3e635] selection:text-[#1d248a] relative bg-[#4338ca]">

                <div className="fixed inset-0 four-point-gradient"></div>
                <div className="fixed inset-0 pointer-events-none opacity-[0.1]"></div>

                <style>{`
                    @keyframes float {
                        0% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-12px) rotate(3deg); }
                        100% { transform: translateY(0px) rotate(0deg); }
                    }
                    @keyframes gradient-xy {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    @keyframes float-fade {
                        0% {
                            opacity: 0;
                            transform: translateY(10px);
                        }

                        25% {
                            opacity: 1;
                        }

                        50% {
                            opacity: 1;
                            transform: translateY(-15px);
                        }

                        75% {
                            opacity: 1;
                        }

                        100% {
                            opacity: 0;
                            transform: translateY(10px);
                        }
                    }
                    .animate-float-fade {
                        animation: float-fade 5s ease-in-out infinite;
                    }
                    .animate-gradient-xy {
                        background-size: 200% 200%;
                        animation: gradient-xy 10s ease infinite;
                    }
                    .animate-fade-in {
                        animation: fadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(20px) scale(0.95); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }

                    .four-point-gradient {
                        background:
                            radial-gradient(ellipse at 20% 0%, #db2777 0%, transparent 50%),
                            radial-gradient(ellipse at 120% 0%, #4338ca 0%, transparent 50%),
                            radial-gradient(ellipse at 80% 100%, #f4b337 0%, transparent 50%),
                            radial-gradient(ellipse at -20% 100%, #a3e635 0%, transparent 50%);
                        background-size: 100% 100%;
                        animation: gradient-rotate 5s ease-in-out infinite;
                    }
                    @keyframes gradient-rotate {
                        0% { filter: hue-rotate(0deg); transform: scale(1) rotate(0deg); }
                        50% { filter: hue-rotate(25deg); transform: scale(1.5) rotate(3deg); }
                        100% { filter: hue-rotate(0deg); transform: scale(1) rotate(0deg); }
                    }
                `}</style>

                <Routes basename="/AdidasVibes/">
                    <Route path="/" element={<ClientFlow user={user} />} />
                    <Route path="/staff" element={<StaffFlow user={user} />} />
                    <Route path="/insights" element={<InsightsDashboard />} />
                    {APP_CONFIG.enableEvents && <Route path="/event/:eventId" element={<EventPage />} />}
                </Routes>

            </div>
        </HashRouter>
    );
}
