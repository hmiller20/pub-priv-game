"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"

export default function Importance() {
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
    router.replace('/2/score')
  }

  const handleBack = () => {
    router.replace('/2/instructions')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-blue-100">
      <h1 className="mb-8 text-3xl font-bold">Category Story 👀</h1>
      <Card className="w-full max-w-lg bg-white">
        <CardHeader>
          <CardTitle>Why This Matters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            The task you'll be performing measures mental acuity and the ability to create connections across concepts, which are basic elements of <span className="font-bold">intelligence</span> and <span className="font-bold">creativity</span>. Performance on this task has been shown to predict a number of important outcomes including <span className="font-bold">career success</span>, <span className="font-bold">salary</span>, and even people's ability to form <span className="font-bold">satisfying relationships</span>.
          </p>
          <p>
            Therefore, it is important that you try your best to solve the questions. Your participation will help us better understand how different forms of intelligence and creativity contribute to <span className="font-bold">positive life outcomes</span>.
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