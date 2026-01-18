'use client';

import { useState, useEffect, useCallback } from 'react';
import { SavedPlan } from '@/types/appConfig';

const STORAGE_KEY = 'you-good-saved-plans';

export function useSavedPlans() {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load plans from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SavedPlan[];
        // Sort by lastUsedAt (most recent first), then by createdAt
        parsed.sort((a, b) => {
          const aTime = a.lastUsedAt || a.createdAt;
          const bTime = b.lastUsedAt || b.createdAt;
          return bTime - aTime;
        });
        setPlans(parsed);
      }
    } catch (error) {
      console.error('Failed to load saved plans:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save plans to localStorage
  const persistPlans = useCallback((updatedPlans: SavedPlan[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));
    } catch (error) {
      console.error('Failed to save plans:', error);
    }
  }, []);

  // Add a new plan
  const savePlan = useCallback((plan: Omit<SavedPlan, 'id' | 'createdAt'>) => {
    const newPlan: SavedPlan = {
      ...plan,
      id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: Date.now(),
    };
    
    setPlans(prev => {
      const updated = [newPlan, ...prev];
      persistPlans(updated);
      return updated;
    });
    
    return newPlan;
  }, [persistPlans]);

  // Update an existing plan
  const updatePlan = useCallback((id: string, updates: Partial<SavedPlan>) => {
    setPlans(prev => {
      const updated = prev.map(plan => 
        plan.id === id ? { ...plan, ...updates } : plan
      );
      persistPlans(updated);
      return updated;
    });
  }, [persistPlans]);

  // Mark a plan as used (updates lastUsedAt)
  const markPlanUsed = useCallback((id: string) => {
    setPlans(prev => {
      const updated = prev.map(plan => 
        plan.id === id ? { ...plan, lastUsedAt: Date.now() } : plan
      );
      // Re-sort by usage
      updated.sort((a, b) => {
        const aTime = a.lastUsedAt || a.createdAt;
        const bTime = b.lastUsedAt || b.createdAt;
        return bTime - aTime;
      });
      persistPlans(updated);
      return updated;
    });
  }, [persistPlans]);

  // Delete a plan
  const deletePlan = useCallback((id: string) => {
    setPlans(prev => {
      const updated = prev.filter(plan => plan.id !== id);
      persistPlans(updated);
      return updated;
    });
  }, [persistPlans]);

  // Clear all plans
  const clearAllPlans = useCallback(() => {
    setPlans([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    plans,
    isLoaded,
    savePlan,
    updatePlan,
    markPlanUsed,
    deletePlan,
    clearAllPlans,
  };
}
