
import { useState, useEffect, useCallback } from "react";
import { Timer } from "../types";

export const useTimers = () => {
  const [timers, setTimers] = useState<Timer[]>([]);

  // Load timers from localStorage on initial render
  useEffect(() => {
    const savedTimers = localStorage.getItem("timers");
    if (savedTimers) {
      try {
        const parsedTimers = JSON.parse(savedTimers).map((timer: Timer) => ({
          ...timer,
          createdAt: new Date(timer.createdAt),
        }));
        setTimers(parsedTimers);
      } catch (error) {
        console.error("Error parsing timers from localStorage:", error);
      }
    }
  }, []);

  // Save timers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("timers", JSON.stringify(timers));
  }, [timers]);

  // Update running timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((currentTimers) =>
        currentTimers.map((timer) => {
          if (timer.isRunning) {
            return {
              ...timer,
              elapsedTime: timer.elapsedTime + 1000, // add one second
            };
          }
          return timer;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addTimer = useCallback((name: string, category?: string) => {
    const newTimer: Timer = {
      id: Date.now().toString(),
      name,
      elapsedTime: 0,
      isRunning: false, // Changed to false so timer doesn't start until confirmed
      createdAt: new Date(),
      category,
    };
    setTimers((prev) => [...prev, newTimer]);
    return newTimer.id; // Return the ID of the new timer
  }, []);

  const toggleTimer = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id
          ? { ...timer, isRunning: !timer.isRunning }
          : timer
      )
    );
  }, []);

  const resetTimer = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id
          ? { ...timer, elapsedTime: 0, isRunning: false }
          : timer
      )
    );
  }, []);

  const deleteTimer = useCallback((id: string) => {
    setTimers((prev) => prev.filter((timer) => timer.id !== id));
  }, []);

  const renameTimer = useCallback((id: string, newName: string, category?: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id
          ? { 
              ...timer, 
              name: newName, 
              isRunning: true,  // Start timer when confirmed
              category: category !== undefined ? category : timer.category // Only update category if provided
            }
          : timer
      )
    );
  }, []);

  return {
    timers,
    addTimer,
    toggleTimer,
    resetTimer,
    deleteTimer,
    renameTimer,
  };
};
