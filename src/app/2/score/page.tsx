"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"
import { StartGameButton } from "@/components/ui/send-start-buttons"

export default function Score() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)
  const [isTimerActive, setIsTimerActive] = useState(true)
  const [hasReadInstructions, setHasReadInstructions] = useLocalStorage('hasReadInstructions', false)

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
        <CardHeader>
          <CardTitle>Your Score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-blue-600 font-large font-bold">
            Finally, your name and score will be shared with your group and posted on the public leaderboard, so make sure to give it your best shot!
          </p>
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
            {countdown > 0 ? `You may start in ${countdown}` : "Start Game"}
          </StartGameButton>
        </CardFooter>
      </Card>
    </main>
  )
} 