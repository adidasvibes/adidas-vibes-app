import { RESULTS } from '../constants/results';

/**
 * Calculate quiz result based on answers
 */
export const calculateQuizResult = (finalAnswers) => {
    let scores = { ED: 0, SU: 0, FR: 0, CZ: 0, GC: 0 };

    finalAnswers.forEach((ans, index) => {
        const points = (index === 2) ? 3 : 1; // Question 3 is weighted 3x to minimize ties

        if (ans === "A") scores.ED += points;
        else if (ans === "B") scores.SU += points;
        else if (ans === "C") scores.FR += points;
        else if (ans === "D") scores.CZ += points;
        else if (ans === "E") scores.GC += points;
    });

    let maxScore = Math.max(scores.ED, scores.SU, scores.FR, scores.CZ, scores.GC);
    let resultKey = "";

    if (scores.ED === maxScore) resultKey = "Energy Drive";
    else if (scores.SU === maxScore) resultKey = "Spark Up";
    else if (scores.FR === maxScore) resultKey = "Full Recharge";
    else if (scores.CZ === maxScore) resultKey = "Chill Zone";
    else if (scores.GC === maxScore) resultKey = "Get Comfy";

    // Handle tie: use third question answer
    const isTie = Object.values(scores).filter(s => s === maxScore).length > 1;
    if (isTie) {
        const q3 = finalAnswers[2];
        if (q3 === "A") resultKey = "Energy Drive";
        else if (q3 === "B") resultKey = "Spark Up";
        else if (q3 === "C") resultKey = "Full Recharge";
        else if (q3 === "D") resultKey = "Chill Zone";
        else if (q3 === "E") resultKey = "Get Comfy";
    }

    return RESULTS[resultKey];
};
