"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"
import { StartGameButton } from "@/components/ui/send-start-buttons"

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
          <StartGameButton
            onClick={handleBack}
            className="bg-white text-gray-600 hover:text-gray-900 border border-blue-100 min-w-[100px] px-6 py-2 mr-2"
            style={{ minWidth: 0 }}
          >
            Go Back
          </StartGameButton>
          <StartGameButton
            onClick={handleNext}
            disabled={countdown > 0}
            className={countdown > 0 ? "bg-gray-300 text-gray-600 cursor-not-allowed" : ""}
          >
            {countdown > 0 ? `You may advance in ${countdown}` : "Next"}
          </StartGameButton>
        </CardFooter>
      </Card>
    </main>
  )
} 