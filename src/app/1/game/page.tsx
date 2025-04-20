"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, SkipForward } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

// Simplified question set
const RAT_QUESTIONS = [
  {
    words: ["CREAM", "SKATE", "WATER"],
    answer: "ICE"
  },
  {
    words: ["FALLING", "ACTOR", "DUST"],
    answer: "STAR"
  },
  {
    words: ["BROKEN", "CLEAR", "EYE"],
    answer: "GLASS"
  },
  {
    words: ["BLUE", "CAKE", "COTTAGE"],
    answer: "CHEESE"
  },
  {
    words: ["PALM", "SHOE", "HOUSE"],
    answer: "TREE"
  },
  {
    words: ["BASKET", "EIGHT", "SNOW"],
    answer: "BALL"
  },
  {
    words: ["CROSS", "RAIN", "TIE"],
    answer: "BOW"
  },
  {
    words: ["SANDWICH", "HOUSE", "GOLF"],
    answer: "CLUB"
  }
]

const GAME_DURATION = 120 // 2 minutes

export default function PrivateGamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userName = searchParams.get("userName") || "Player"
  const inputRef = useRef<HTMLInputElement>(null)
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<null | "correct" | "incorrect">(null)

  // Auto-focus input on mount and when question changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentQuestionIndex])

  // Basic timer
  useEffect(() => {
    console.log("Timer effect running")
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          router.push(`/1/postgame?score=${score}&userName=${encodeURIComponent(userName)}`)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router, userName])

  const handleSkip = () => {
    setScore(prev => Math.max(0, prev - 5)) // Prevent negative scores
    if (currentQuestionIndex < RAT_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setUserInput("")
      setFeedback(null)
    } else {
      router.push(`/1/postgame?score=${Math.max(0, score - 5)}&userName=${encodeURIComponent(userName)}`)
    }
  }

  const handleSubmit = () => {
    const currentQuestion = RAT_QUESTIONS[currentQuestionIndex]
    if (userInput.toLowerCase() === currentQuestion.answer.toLowerCase()) {
      setScore(prev => prev + 20)
      setFeedback("correct")
      setTimeout(() => {
        if (currentQuestionIndex < RAT_QUESTIONS.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1)
          setUserInput("")
          setFeedback(null)
        } else {
          router.push(`/1/postgame?score=${score + 20}&userName=${encodeURIComponent(userName)}`)
        }
      }, 1000)
    } else {
      setFeedback("incorrect")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const currentQuestion = RAT_QUESTIONS[currentQuestionIndex]

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-blue-100">
      <h1 className="mb-8 text-3xl font-bold">Category Story 👀</h1>
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <Badge variant="outline" className="text-lg font-bold">
              {formatTime(timeLeft)}
            </Badge>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">Score:</span>
              <span className="text-2xl font-bold text-black">{score}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6 relative">
          <div className="grid grid-cols-3 gap-4">
            {currentQuestion.words.map((word, index) => (
              <div key={index} className="bg-gray-100 p-3 rounded-lg text-center">
                <span className="font-bold text-lg">{word}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter answer..."
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={
                feedback === "correct" ? "border-green-500" : 
                feedback === "incorrect" ? "border-red-500" : ""
              }
            />
            <Button 
              onClick={handleSubmit}
              className="bg-black hover:bg-black/90 text-white"
            >
              Submit
            </Button>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSkip}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:bg-gray-100"
            >
              <SkipForward className="mr-1 h-4 w-4" />
              Skip (-5 pts)
            </Button>
          </div>

          {feedback && (
            <div className="absolute bottom-2 left-2 flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
              {feedback === "correct" ? (
                <>
                  <CheckCircle2 className="text-green-500" />
                  <span className="text-green-500">Correct!</span>
                </>
              ) : (
                <>
                  <XCircle className="text-red-500" />
                  <span className="text-red-500">Try again!</span>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
} 