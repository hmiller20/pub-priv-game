import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Check if we are on the client side before accessing localStorage
  const isClient = typeof window !== 'undefined';

  useEffect(() => {
    if (isClient) {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.log(error);
        return initialValue;
      }
    }
  }, [key, isClient, initialValue]);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T) => {
    try {
      // Save state
      setStoredValue(value);
      // Save to localStorage if on client side
      if (isClient) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
} 