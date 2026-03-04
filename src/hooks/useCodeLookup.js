import { useState, useCallback } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { APP_ID } from '../constants/firebase';
import { RESULTS } from '../constants/results';
import { getIpLocation } from '../utils/location';

/**
 * Custom hook for staff code lookup and redemption
 */
export const useCodeLookup = (user) => {
  const [inputCode, setInputCode] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkCode = useCallback(async () => {
    if (!inputCode) return;
    
    setLoading(true);
    setError("");
    setLookupResult(null);

    try {
      const docRef = doc(
        db,
        'artifacts',
        APP_ID,
        'public',
        'data',
        'vibe_codes',
        inputCode.trim().toUpperCase()
      );
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const resultDetails = RESULTS[data.result];
        
        if (data.redeemed) {
          setError("⚠️ THIS CODE HAS ALREADY BEEN REDEEMED!");
        }

        setLookupResult({ ...data, details: resultDetails });
      } else {
        setError("Invalid Code. Please check spelling.");
      }
    } catch (err) {
      console.error(err);
      setError("System error.");
    } finally {
      setLoading(false);
    }
  }, [inputCode]);

  const redeemCode = useCallback(async () => {
    if (!lookupResult || !user) return;
    
    setLoading(true);
    try {
      const staffLocationData = await getIpLocation();
      const docRef = doc(
        db,
        'artifacts',
        APP_ID,
        'public',
        'data',
        'vibe_codes',
        lookupResult.code
      );
      
      await updateDoc(docRef, {
        redeemed: true,
        redeemedAt: serverTimestamp(),
        redeemedBy: user.uid,
        redeemLocation: staffLocationData
      });
      
      setLookupResult(prev => ({ ...prev, redeemed: true }));
    } catch (err) {
      console.error(err);
      setError("Failed to redeem.");
    } finally {
      setLoading(false);
    }
  }, [lookupResult, user]);

  return {
    inputCode,
    setInputCode,
    lookupResult,
    error,
    loading,
    checkCode,
    redeemCode
  };
};
