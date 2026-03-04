import { useState, useCallback, useEffect } from 'react';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { APP_ID } from '../constants/firebase';
import { QUESTIONS } from '../constants/quiz';
import { RESULTS } from '../constants/results';
import { shuffleArray, generateVibeCode, mapAnswers } from '../utils/helpers';
import { getIpLocation } from '../utils/location';
import { calculateQuizResult } from '../utils/scoring';
import { APP_CONFIG } from '../config/app';

/**
 * Custom hook for managing quiz state and logic
 */
export const useQuiz = (user, onQuizComplete = () => { }, eventId = null, demographics = null) => {
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [shuffledQuestions, setShuffledQuestions] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [checkingHistory, setCheckingHistory] = useState(true);
    const [eventData, setEventData] = useState(null);

    // Fetch event data if eventId exists
    useEffect(() => {
        if (APP_CONFIG.enableEvents && eventId && eventId !== APP_CONFIG.defaultEventId) {
            const fetchEventData = async () => {
                try {
                    const eventDoc = await getDoc(
                        doc(db, 'artifacts', APP_ID, 'public', 'data', 'events', eventId)
                    );
                    if (eventDoc.exists()) {
                        setEventData({ id: eventDoc.id, ...eventDoc.data() });
                    }
                } catch (error) {
                    console.error("Error fetching event data:", error);
                }
            };
            fetchEventData().catch((error) => console.error(error));
        } else {
            const fetchVouchers = async () => {
                try {
                    const mpDoc = await getDoc(
                        doc(db, 'artifacts', APP_ID, 'public', 'data')
                    );
                    if (mpDoc.exists()) {
                        setEventData({ id: null, marketplaces: mpDoc.data()?.marketplaces || [] });
                    } else {
                        console.log("No vouchers found");
                    }
                } catch (error) {
                    console.error("Error fetching vouchers:", error);
                }
            };
            fetchVouchers().catch((error) => console.error(error));
        }
    }, [eventId]);

    // Check if user already completed quiz
    const checkQuizHistory = useCallback(async () => {
        try {
            if (!user) {
                setShuffledQuestions(QUESTIONS.map(q => ({
                    ...q,
                    options: shuffleArray(q.options)
                })));
                setCheckingHistory(false);
                return;
            }

            const codesRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'vibe_codes');
            // Check for existing quiz completion for THIS event only
            let q;
            if (APP_CONFIG.enableEvents && eventId && eventId !== APP_CONFIG.defaultEventId) {
                // If eventId exists, check only for this specific event
                q = query(codesRef, where("uid", "==", user.uid), where("eventId", "==", eventId));
            } else {
                // If no eventId, check if user has completed any quiz globally (backward compatibility)
                q = query(codesRef, where("uid", "==", user.uid), where("eventId", "==", null));
            }

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const existingData = querySnapshot.docs[0].data();
                const resultDetails = RESULTS[existingData.result];

                // Fetch event data if eventId exists and not already loaded
                let fetchedEventData = eventData;
                if (existingData.eventId && !eventData) {
                    try {
                        const eventDoc = await getDoc(
                            doc(db, 'artifacts', APP_ID, 'public', 'data', 'events', existingData.eventId)
                        );
                        if (eventDoc.exists()) {
                            fetchedEventData = eventDoc.data();
                        }
                    } catch (error) {
                        console.error("Error fetching event data for existing result:", error);
                    }
                }

                onQuizComplete({
                    result: resultDetails,
                    code: existingData.code,
                    isExisting: true,
                    eventData: fetchedEventData  // Include event data (fetched or pre-loaded)
                });
            } else {
                const randomized = QUESTIONS.map(q => ({
                    ...q,
                    options: shuffleArray(q.options)
                }));
                setShuffledQuestions(randomized);
            }
        } catch (error) {
            console.error("Error checking quiz history:", error);
            setShuffledQuestions(QUESTIONS.map(q => ({
                ...q,
                options: shuffleArray(q.options)
            })));
        } finally {
            setCheckingHistory(false);
        }
    }, [user, onQuizComplete]);

    // Handle answer selection
    const handleAnswer = useCallback((value) => {
        const newAnswers = [...answers];
        newAnswers[currentQ] = value; // Update answer at current position
        setAnswers(newAnswers);

        if (currentQ < QUESTIONS.length - 1) {
            setCurrentQ(currentQ + 1);
        } else {
            calculateResult(newAnswers);
        }
    }, [currentQ, answers]);

    // Navigate to previous question
    const goToPreviousQuestion = useCallback(() => {
        if (currentQ > 0) {
            setCurrentQ(currentQ - 1);
        }
    }, [currentQ]);

    // Navigate to next question
    const goToNextQuestion = useCallback(() => {
        if (currentQ < QUESTIONS.length - 1) {
            setCurrentQ(currentQ + 1);
        } else {
            calculateResult(answers);
        }
    }, [currentQ, answers]);

    // Save result to Firebase
    const saveResultToFirebase = async (finalAnswers, uniqueCode, resultData, demographicsData) => {
        try {
            if (user) {
                const locationData = await getIpLocation();
                const answerMap = mapAnswers(finalAnswers);

                await setDoc(
                    doc(db, 'artifacts', APP_ID, 'public', 'data', 'vibe_codes', uniqueCode),
                    {
                        code: uniqueCode,
                        result: Object.keys(RESULTS).find(key => RESULTS[key].title === resultData.title),
                        answers: answerMap,
                        userLocation: locationData,
                        redeemed: false,
                        createdAt: serverTimestamp(),
                        uid: user.uid,
                        eventId: eventId || null,
                        ageRange: demographicsData?.ageRange || null,
                        gender: demographicsData?.gender || null
                    }
                );
            }
        } catch (error) {
            console.error("Error saving result to Firebase:", error);
        }
    };

    // Calculate result
    const calculateResult = async (finalAnswers) => {
        setIsCalculating(true);

        try {
            const resultData = calculateQuizResult(finalAnswers);
            const uniqueCode = generateVibeCode();

            setTimeout(() => {
                setIsCalculating(false);
                onQuizComplete({
                    result: resultData,
                    code: uniqueCode,
                    isExisting: false,
                    eventData: eventData,
                    saveToFirebase: (demographicsData) => saveResultToFirebase(finalAnswers, uniqueCode, resultData, demographicsData)
                });
            }, 2000);
        } catch (error) {
            console.error("Error calculating result:", error);
            setIsCalculating(false);
        }
    };

    return {
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
    };
};
