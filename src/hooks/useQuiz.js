import { useState, useCallback, useEffect } from 'react';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ARTIFACT_ID } from '../constants/firebase';
import { QUESTIONS } from '../constants/quiz';
import { RESULTS } from '../constants/results';
import { shuffleArray, generateVibeCode, mapAnswers } from '../utils/helpers';
import { getIpLocation } from '../utils/location';
import { calculateQuizResult } from '../utils/scoring';
import { APP_CONFIG } from '../config/app';

/**
 * Custom hook for managing quiz state and logic
 */
export const useQuiz = (user, onQuizComplete = () => { }, eventId = 'global', demographics = null) => {
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
                    const [eventDoc, rootDoc] = await Promise.all([
                        getDoc(doc(db, 'artifacts', ARTIFACT_ID, 'public', 'data', 'events', eventId)),
                        getDoc(doc(db, 'artifacts', ARTIFACT_ID, 'public', 'data'))
                    ]);
                    if (eventDoc.exists()) {
                        setEventData({
                            id: eventDoc.id,
                            ...eventDoc.data(),
                            vibeCodeActive: rootDoc.exists() ? (rootDoc.data()?.vibeCodeActive ?? false) : false
                        });
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
                        doc(db, 'artifacts', ARTIFACT_ID, 'public', 'data')
                    );
                    if (mpDoc.exists()) {
                        setEventData({
                            id: null,
                            marketplaces: mpDoc.data()?.marketplaces || [],
                            vibeCodeActive: mpDoc.data()?.vibeCodeActive ?? false
                        });
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
            // Session checker removed - allow multiple quiz submissions per user
            const randomized = QUESTIONS.map(q => ({
                ...q,
                options: shuffleArray(q.options)
            }));
            setShuffledQuestions(randomized);
        } catch (error) {
            console.error("Error initializing quiz:", error);
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
                    doc(db, 'artifacts', ARTIFACT_ID, 'public', 'data', 'vibe_codes', uniqueCode),
                    {
                        code: uniqueCode,
                        result: Object.keys(RESULTS).find(key => RESULTS[key].title === resultData.title),
                        answers: answerMap,
                        userLocation: locationData,
                        redeemed: false,
                        createdAt: serverTimestamp(),
                        uid: user.uid,
                        eventId: eventId || 'global',
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
