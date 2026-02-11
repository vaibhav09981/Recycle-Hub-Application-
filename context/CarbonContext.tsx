import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CarbonEntry {
  id: string;
  type: 'footprint' | 'savings';
  material: string;
  weight: number;
  quantity: number;
  value: number; // CO2 in kg
  date: Date;
}

interface CarbonContextType {
  totalFootprint: number;
  totalSavings: number;
  carbonHistory: CarbonEntry[];
  addFootprint: (material: string, weight: number, quantity: number, value: number) => void;
  addSavings: (material: string, weight: number, quantity: number, value: number) => void;
  resetCarbonData: () => void;
}

const CarbonContext = createContext<CarbonContextType | undefined>(undefined);

// Mock initial data for demo purposes
const MOCK_INITIAL_HISTORY: CarbonEntry[] = [
  {
    id: '1',
    type: 'savings',
    material: 'PET (Plastic bottles)',
    weight: 0.5,
    quantity: 5,
    value: 1.15,
    date: new Date(Date.now() - 86400000 * 2), // 2 days ago
  },
  {
    id: '2',
    type: 'footprint',
    material: 'Plastic bags',
    weight: 0.2,
    quantity: 2,
    value: 0.8,
    date: new Date(Date.now() - 86400000), // 1 day ago
  },
  {
    id: '3',
    type: 'savings',
    material: 'Aluminum (cans)',
    weight: 0.3,
    quantity: 10,
    value: 2.43,
    date: new Date(), // today
  },
];

export function CarbonProvider({ children }: { children: ReactNode }) {
  const [totalFootprint, setTotalFootprint] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [carbonHistory, setCarbonHistory] = useState<CarbonEntry[]>(MOCK_INITIAL_HISTORY);

  // Calculate totals from history on mount
  useEffect(() => {
    const footprint = carbonHistory
      .filter((entry) => entry.type === 'footprint')
      .reduce((sum, entry) => sum + entry.value, 0);
    
    const savings = carbonHistory
      .filter((entry) => entry.type === 'savings')
      .reduce((sum, entry) => sum + entry.value, 0);
    
    setTotalFootprint(footprint);
    setTotalSavings(savings);
  }, []);

  const addFootprint = (material: string, weight: number, quantity: number, value: number) => {
    const newEntry: CarbonEntry = {
      id: Date.now().toString(),
      type: 'footprint',
      material,
      weight,
      quantity,
      value,
      date: new Date(),
    };

    setCarbonHistory((prev) => [newEntry, ...prev]);
    setTotalFootprint((prev) => prev + value);
  };

  const addSavings = (material: string, weight: number, quantity: number, value: number) => {
    const newEntry: CarbonEntry = {
      id: Date.now().toString(),
      type: 'savings',
      material,
      weight,
      quantity,
      value,
      date: new Date(),
    };

    setCarbonHistory((prev) => [newEntry, ...prev]);
    setTotalSavings((prev) => prev + value);
  };

  const resetCarbonData = () => {
    setTotalFootprint(0);
    setTotalSavings(0);
    setCarbonHistory([]);
  };

  return (
    <CarbonContext.Provider
      value={{
        totalFootprint,
        totalSavings,
        carbonHistory,
        addFootprint,
        addSavings,
        resetCarbonData,
      }}
    >
      {children}
    </CarbonContext.Provider>
  );
}

export function useCarbon() {
  const context = useContext(CarbonContext);
  if (context === undefined) {
    throw new Error('useCarbon must be used within a CarbonProvider');
  }
  return context;
}
