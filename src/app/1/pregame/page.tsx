"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Condition1Pregame() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [hasReadInstructions, setHasReadInstructions] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalPage, setModalPage] = useState(1)
  const [countdown, setCountdown] = useState(10)
  const [isTimerActive, setIsTimerActive] = useState(false)

  // Handle countdown timer
  useEffect(() => {
    if (showModal && !isTimerActive) { // if modal is open and timer is not active, start timer
      setIsTimerActive(true)
      setCountdown(10)
    }
  }, [showModal, modalPage])

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
    if (!userName.trim()) {
      alert("Please enter your name before starting the game")
      return
    }
    router.push(`/1/game?userName=${encodeURIComponent(userName)}`)
  }

  const handleGoBack = () => {
    setModalPage(1)
    setIsTimerActive(false)
    setCountdown(0)
  }

  const handleModalNext = () => {
    if (modalPage === 1) {
      setModalPage(2)
      setIsTimerActive(true)
      setCountdown(10)
    } else {
      setShowModal(false)
      setHasReadInstructions(true)
      setModalPage(1)
      setCountdown(10)
    }
  }

  const modalContent = {
    1: {
      title: "Instructions",
      content: (
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
            You can either submit your answer or skip to the next question. Correct answers <span className="font-bold text-green-600">earn</span> points, while skipping <span className="font-bold text-red-600">deducts</span> points.
          </p>
        </CardContent>
      )
    },
    2: {
      title: "Why This Matters",
      content: (
        <CardContent className="space-y-4">
          <p>
            Versions of this exercise have been used in psychological research for decades to predict performance in a number of domains, from career success to relationship satisfaction.
          </p>
          <p>
            Therefore, it is important that you try your best to solve the questions. Your participation will help us better understand how people solve these kinds of cognitive challenges.
          </p>
          <p className="text-blue-600 font-large font-bold">
            Finally, your score will be kept private and used only for research purposes, so make sure to give it your best shot!
          </p>
        </CardContent>
      )
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-blue-100">
      <h1 className="mb-8 text-3xl font-bold">Category Story</h1>
      <Card className="w-full max-w-md bg-white">
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="w-full space-y-2 mb-4">
              <label htmlFor="userName" className="text-sm font-medium">
                Enter Your Name
              </label>
              <Input
                id="userName"
                type="text"
                placeholder="Your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              onClick={() => setShowModal(true)}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 hover:bg-blue-50"
            >
              <BookOpen className="h-4 w-4" />
              Read Me
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={handleStartGame} 
            disabled={!hasReadInstructions}
            className={`w-full ${
              hasReadInstructions 
                ? "bg-green-100 hover:bg-green-200 text-green-800 cursor-pointer" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Start Game
          </Button>
        </CardFooter>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white">
            <CardHeader>
              <CardTitle>{modalContent[modalPage as 1 | 2].title}</CardTitle>
            </CardHeader>
            {modalContent[modalPage as 1 | 2].content}
            <CardFooter className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">
                  Page {modalPage} of 2
                </div>
                {modalPage === 2 && (
                  <Button
                    onClick={handleGoBack}
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Go Back
                  </Button>
                )}
              </div>
              <Button
                onClick={handleModalNext}
                disabled={countdown > 0}
                className={`${
                  countdown > 0
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-black hover:bg-black/90 text-white"
                }`}
              >
                {countdown > 0 ? `You may advance in ${countdown}` : modalPage === 1 ? "Next" : "I Understand"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </main>
  )
} 