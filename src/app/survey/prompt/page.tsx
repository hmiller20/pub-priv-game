"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function SurveyPage2() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    router.push('/survey/items');
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-blue-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg text-center">
        <p className="mb-6 text-gray-700">Please take a moment to think about the activities you care about. These could include your job, your hobbies, or anything else you spend time on.</p>
        {/* Button styling:
         * Conditional width: 50% during countdown, 20% when ready
         * py-2 - Adds padding of 0.5rem to top and bottom
         * text-md - Sets medium font size
         */}
        <Button
          onClick={handleNext}
          disabled={countdown > 0}
          className={`py-2 text-md ${
            countdown > 0 
              ? 'md:w-1/2 bg-gray-300 text-gray-600' 
              : 'md:w-1/5 bg-black hover:bg-black/90 text-white'
          }`}
        >
          {countdown > 0 ? `You may advance in ${countdown}...` : 'Next'}
        </Button>
      </div>
    </main>
  );
}