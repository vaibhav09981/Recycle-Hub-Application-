import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CreditsContextType {
  greenCredits: number;
  addCredits: (amount: number) => void;
  gradualAddCredits: (amount: number, durationMs?: number) => void;
  spendCredits: (amount: number) => Promise<boolean>;
  resetCredits: () => void;
  gcToKgConversion: number; // 1000 GC = 1kg CO2
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

const STORAGE_KEY = 'recycleHub_greenCredits';

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [greenCredits, setGreenCredits] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const gcToKgConversion = 1000;

  // Load credits from storage
  useEffect(() => {
    const loadCredits = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        // FORCE REFRESH: Reset to 0 as per user request for this update
        setGreenCredits(0);
        await AsyncStorage.setItem(STORAGE_KEY, '0');
      } catch (e) {
        console.error('Failed to load green credits:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadCredits();
  }, []);

  // Save credits to storage
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(STORAGE_KEY, greenCredits.toString()).catch((e) => {
        console.error('Failed to save green credits:', e);
      });
    }
  }, [greenCredits, isLoaded]);

  const resetCredits = () => {
    setGreenCredits(0);
  };

  const addCredits = (amount: number) => {
    // Round to nearest integer as GC is like currency
    const roundedAmount = Math.round(amount);
    if (roundedAmount > 0) {
      setGreenCredits((prev) => prev + roundedAmount);
    }
  };

  const gradualAddCredits = (amount: number, durationMs: number = 3000) => {
    const roundedAmount = Math.round(amount);
    if (roundedAmount <= 0) return;

    const steps = 30; // Number of increments
    const increment = Math.ceil(roundedAmount / steps);
    const stepDuration = durationMs / steps;
    let currentAdded = 0;

    const interval = setInterval(() => {
      setGreenCredits((prev) => {
        const remaining = roundedAmount - currentAdded;
        const nextAdd = Math.min(increment, remaining);
        
        if (nextAdd <= 0) {
          clearInterval(interval);
          return prev;
        }

        currentAdded += nextAdd;
        return prev + nextAdd;
      });
    }, stepDuration);
  };

  const spendCredits = async (amount: number): Promise<boolean> => {
    if (greenCredits >= amount) {
      setGreenCredits((prev) => prev - amount);
      return true;
    }
    return false;
  };

  return (
    <CreditsContext.Provider
      value={{
        greenCredits,
        addCredits,
        gradualAddCredits,
        spendCredits,
        resetCredits,
        gcToKgConversion,
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
}
