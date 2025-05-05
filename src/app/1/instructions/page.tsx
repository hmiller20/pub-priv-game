"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"

export default function Instructions() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)
  const [isTimerActive, setIsTimerActive] = useState(true)

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

  const handleNext = () => {
    router.replace('/1/importance')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-blue-100">
      <h1 className="mb-8 text-3xl font-bold">Category Story</h1>
      <Card className="w-full max-w-lg bg-white">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            In this task, you will be presented with three words. Your goal is to find a fourth word that is associated with all three words shown. In other words, you will find a <span className="font-bold">story</span> for each grouping!
          </p>
          <p>
            For example, if you see the words:<br />
            <strong>CREAM - SKATE - WATER</strong><br />
            The answer would be: <strong>ICE</strong>
          </p>
          <p>
            You can either submit your answer or skip to the next question. You will have two minutes to answer as many questions as you can. Correct answers <span className="font-bold text-green-600">earn</span> 20 points, while skipping <span className="font-bold text-red-600">deducts</span> 5 points. Incorrect answers do not change your point total.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleNext}
            disabled={countdown > 0}
            className={`${
              countdown > 0
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-black hover:bg-black/90 text-white"
            }`}
          >
            {countdown > 0 ? `You may advance in ${countdown}` : "Next"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
} 