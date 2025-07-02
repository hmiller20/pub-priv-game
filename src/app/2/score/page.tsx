"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"
import { StartGameButton } from "@/components/ui/send-start-buttons"
import { useTextToSpeech } from "@/lib/hooks/useTextToSpeech"
import { Volume2, VolumeX } from "lucide-react"

export default function Score() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)
  const [isTimerActive, setIsTimerActive] = useState(true)
  const [hasReadInstructions, setHasReadInstructions] = useLocalStorage('hasReadInstructions', false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const hasPlayedRef = useRef(false)
  const { playText, stopPlaying, isPlaying, isLoading } = useTextToSpeech();

  const scoreText = "Finally, your name and score will be shared with your group and posted on the public FSU leaderboard, so make sure to give it your best shot!";

  useEffect(() => {
    // Only play once on mount
    if (!hasPlayedRef.current) {
      playText(scoreText);
      hasPlayedRef.current = true;
    }

    return () => {
      stopPlaying();
    }
  }, [playText, stopPlaying]);

  useEffect(() => {
    let timer: NodeJS.Timeout
    
    if (isTimerActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    } else if (countdown === 0) {
      setIsTimerActive(false)
    }

    return () => clearInterval(timer)
  }, [isTimerActive, countdown])

  const handleTextToSpeech = () => {
    if (isPlaying) {
      stopPlaying();
    } else {
      playText(scoreText);
    }
  };

  const handleStartGame = () => {
    setHasReadInstructions(true)
    localStorage.setItem('hasReadInstructions', 'true')
    router.replace('/2/game')
  }

  const handleBack = () => {
    router.replace('/2/importance')
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f6faff 0%, #f8f6ff 100%)",
      }}
    >
      <h1
        className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-center leading-[1.1] py-4 mb-4 z-10 relative"
        style={{
          background: "linear-gradient(90deg, #4f46e5 0%, #9333ea 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Category Story
      </h1>
      <Card className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-blue-100 p-6">
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <p className="text-left text-lg">
              {scoreText.replace('shared with your group and posted on the public FSU leaderboard', '')}
              <span className="underline font-bold">shared with your group and posted on the public FSU leaderboard</span>
              {scoreText.split('shared with your group and posted on the public FSU leaderboard')[1]}
            </p>
            
            {/* Audio control button */}
            <div className="flex justify-center">
              <Button
                variant="ghost"
                onClick={handleTextToSpeech}
                disabled={isLoading}
                className="rounded-full hover:bg-gray-100 transition-colors h-10 w-10 p-0 flex items-center justify-center"
                aria-label={isPlaying ? "Stop audio" : "Play audio"}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : isPlaying ? (
                  <VolumeX className="h-6 w-6" />
                ) : (
                  <Volume2 className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <StartGameButton
            onClick={handleBack}
            className="bg-white text-gray-600 hover:text-gray-900 border border-blue-100 min-w-[100px] px-6 py-2 mr-2"
            style={{ minWidth: 0 }}
          >
            Go Back
          </StartGameButton>
          <StartGameButton
            onClick={handleStartGame}
            disabled={countdown > 0}
            className={countdown > 0 ? "bg-gray-300 text-gray-600 cursor-not-allowed" : ""}
          >
            {countdown > 0 ? `Start in ${countdown}` : "Start Game"}
          </StartGameButton>
        </CardFooter>
      </Card>
    </main>
  )
} 