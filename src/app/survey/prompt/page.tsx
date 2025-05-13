"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card"
import { StartGameButton } from "@/components/ui/send-start-buttons"
import React from 'react';

export default function SurveyPage2() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(15);

  // Typewriter effect state
  const heading1 = "Please take a moment to think about the activities you care about.";
  const heading2 = "These could include your job, your hobbies, or anything else you spend time on.";
  const heading1Words = heading1.split(" ");
  const heading2Words = heading2.split(" ");
  const [displayedWords1, setDisplayedWords1] = useState(0);
  const [displayedWords2, setDisplayedWords2] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  // Animate words for heading 1, then heading 2
  useEffect(() => {
    let wordTimeout: NodeJS.Timeout;
    if (displayedWords1 < heading1Words.length) {
      wordTimeout = setTimeout(() => setDisplayedWords1(displayedWords1 + 1), 200);
    } else if (displayedWords2 < heading2Words.length) {
      wordTimeout = setTimeout(() => setDisplayedWords2(displayedWords2 + 1), 200);
    }
    return () => clearTimeout(wordTimeout);
  }, [displayedWords1, displayedWords2]);

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => setShowCursor((c) => !c), 500);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    router.replace('/survey/items');
  };

  // Helper to render words with fade-in effect
  const renderWordsSmooth = (words: string[], count: number) => (
    <>
      {words.map((word, i) => (
        <span
          key={i}
          className={`inline-block transition-opacity duration-300 ${i < count ? 'opacity-100' : 'opacity-0'}`}
          style={{ marginRight: i < words.length - 1 ? '0.25em' : 0 }}
        >
          {word}
        </span>
      ))}
      {/* Flashing cursor, only show if not all words are displayed */}
      {count < words.length && (
        <span
          className="inline-block align-baseline animate-blink"
          style={{ color: '#7c3aed', fontWeight: 600, fontSize: '1em', marginLeft: '2px' }}
        >
          |
        </span>
      )}
    </>
  );

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f6faff 0%, #f8f6ff 100%)",
      }}
    >
      <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-center leading-[1.2] mb-4 z-10 relative pb-2 min-h-[3.5em]"
          style={{
            background: "linear-gradient(90deg, #4f46e5 0%, #9333ea 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            transition: 'min-height 0.2s',
          }}
        >
          {renderWordsSmooth(heading1Words, displayedWords1)}
        </h1>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-center leading-[1.2] mb-8 z-10 relative pb-2 min-h-[3.5em]"
          style={{
            background: "linear-gradient(90deg, #4f46e5 0%, #9333ea 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            transition: 'min-height 0.2s',
          }}
        >
          {displayedWords1 === heading1Words.length && renderWordsSmooth(heading2Words, displayedWords2)}
        </h2>
        <StartGameButton
          onClick={handleNext}
          disabled={countdown > 0}
          className={
            countdown > 0
              ? "md:w-1/2 bg-gray-300 text-gray-600"
              : "md:w-1/5"
          }
        >
          {countdown > 0 ? `You may advance in ${countdown}...` : 'Next'}
        </StartGameButton>
      </div>
      {/* Blinking cursor animation */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </main>
  );
}