"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"

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
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-blue-100">
      <h1 className="mb-8 text-3xl font-bold">Category Story 👀</h1>
      <Card className="w-full max-w-lg bg-white">
        <CardHeader>
          <CardTitle>Your Score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-blue-600 font-large font-bold">
            Finally, your name and score will be shared with your group and posted on the public leaderboard, so make sure to give it your best shot!
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="text-gray-600 hover:text-gray-900"
          >
            Go Back
          </Button>
          <Button
            onClick={handleStartGame}
            disabled={countdown > 0}
            className={`${
              countdown > 0
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-green-100 hover:bg-green-200 text-green-800"
            }`}
          >
            {countdown > 0 ? `You may start in ${countdown}` : "Start Game"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
} 