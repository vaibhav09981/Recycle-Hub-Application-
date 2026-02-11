import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ScannedItem {
  id: string;
  productName: string;
  materials: string[];
  brand: string | null;
  recyclability: 'fully' | 'partially' | 'non' | 'unknown';
  estimatedWeight: number;
  category: string;
  recyclingTips: string;
  carbonEmitted: string;
  carbonSaved: string;
  savingsPercent: number;
  waterSaved: string;
  energySaved: string;
  imageUrl: string;
  scannedAt: string; // Store as string for AsyncStorage
  inScannedCart: boolean;
}

interface JournalContextType {
  scannedItems: ScannedItem[];
  addScannedItem: (item: Omit<ScannedItem, 'id' | 'scannedAt' | 'inScannedCart'>) => void;
  removeScannedItem: (id: string) => void;
  toggleScannedCart: (id: string) => void;
  clearJournal: () => void;
  getScannedCartItems: () => ScannedItem[];
  journalCount: number;
  scannedCartCount: number;
  getTotalCarbonSaved: () => number;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export function JournalProvider({ children }: { children: ReactNode }) {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    const loadJournal = async () => {
      try {
        const saved = await AsyncStorage.getItem('recycleHub_journal');
        if (saved) {
          const parsed = JSON.parse(saved);
          setScannedItems(parsed);
        }
      } catch (e) {
        console.error('Failed to load journal:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadJournal();
  }, []);

  // Save to storage on change
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem('recycleHub_journal', JSON.stringify(scannedItems)).catch((e) => {
        console.error('Failed to save journal:', e);
      });
    }
  }, [scannedItems, isLoaded]);

  const addScannedItem = (item: Omit<ScannedItem, 'id' | 'scannedAt' | 'inScannedCart'>) => {
    const newItem: ScannedItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      scannedAt: new Date().toISOString(),
      inScannedCart: false,
    };
    setScannedItems((prev) => [newItem, ...prev]);
  };

  const removeScannedItem = (id: string) => {
    setScannedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleScannedCart = (id: string) => {
    setScannedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, inScannedCart: !item.inScannedCart } : item
      )
    );
  };

  const clearJournal = () => {
    setScannedItems([]);
  };

  const getScannedCartItems = () => {
    return scannedItems.filter((item) => item.inScannedCart);
  };

  const journalCount = scannedItems.length;
  const scannedCartCount = scannedItems.filter((item) => item.inScannedCart).length;

  const getTotalCarbonSaved = () => {
    return scannedItems.reduce((total, item) => {
      const saved = parseFloat(item.carbonSaved) || 0;
      return total + saved;
    }, 0);
  };

  return (
    <JournalContext.Provider
      value={{
        scannedItems,
        addScannedItem,
        removeScannedItem,
        toggleScannedCart,
        clearJournal,
        getScannedCartItems,
        journalCount,
        scannedCartCount,
        getTotalCarbonSaved,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
}
