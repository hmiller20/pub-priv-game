"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"

export default function PublicPregame() {
  const router = useRouter()
  const [userName, setUserName] = useLocalStorage('currentUserName', '')
  const [lastScore, setLastScore] = useLocalStorage('lastScore', null)
  const [hasReadInstructions, setHasReadInstructions] = useLocalStorage('hasReadInstructions', false)
  const [showModal, setShowModal] = useState(false)
  const [modalPage, setModalPage] = useState(1)
  const [countdown, setCountdown] = useState(10)
  const [isTimerActive, setIsTimerActive] = useState(false)
  
  // Initialize localStorage counters if they don't exist
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!window.localStorage.getItem('gamePlays')) {
        window.localStorage.setItem('gamePlays', '0')
      }
      if (!window.localStorage.getItem('leaderboardViews')) {
        window.localStorage.setItem('leaderboardViews', '0')
      }
      // Only set the leaderboard timer if it hasn't been set yet
      if (!window.localStorage.getItem('leaderboardLastUpdate')) {
        window.localStorage.setItem('leaderboardLastUpdate', new Date().toISOString())
      }
    }
  }, [])

  // Handle countdown timer
  useEffect(() => {
    if (showModal && !hasReadInstructions) {
      setIsTimerActive(true)
      setCountdown(10)
    } else if (hasReadInstructions) {
      setIsTimerActive(false)
      setCountdown(0)
    }
  }, [showModal, hasReadInstructions])

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
      alert("Please enter your username before starting the game")
      return
    }
    setUserName(userName)
    router.push('/2/game')
  }

  const handleGoBack = () => {
    setModalPage(1)
    if (!hasReadInstructions) {
      setIsTimerActive(true)
      setCountdown(10)
    }
  }

  const handleModalNext = () => {
    if (modalPage === 1) {
      setModalPage(2)
      if (!hasReadInstructions) {
        setIsTimerActive(true)
        setCountdown(10)
      }
    } else {
      setShowModal(false)
      setHasReadInstructions(true)
      setModalPage(1)
      setIsTimerActive(false)
      setCountdown(0)
    }
  }

  const modalContent = {
    1: {
      title: "Instructions",
      content: (
        <CardContent className="space-y-4">
          <p>
            In this task, you will be presented with three words. Your goal is to find a fourth word that is associated with all three words shown. In other words, you will find a <span className="font-bold">story</span> for each grouping!          </p>
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
            Finally, your name and score will be posted on the public leaderboard, so make sure to give it your best shot!
          </p>
        </CardContent>
      )
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-blue-100">
      <h1 className="mb-8 text-3xl font-bold">Category Story 👀</h1>
      <Card className="w-full max-w-md bg-white">
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="w-full space-y-2 mb-4">
              <label htmlFor="userName" className="text-sm font-medium">
                Enter Your Username
              </label>
              <Input
                id="userName"
                type="text"
                placeholder="Your username"
                value={userName}
                onChange={(e) => {
                  if (!lastScore) {
                    setUserName(e.target.value)
                  }
                }}
                disabled={!!lastScore}
                className={`w-full ${lastScore ? 'bg-gray-100' : ''}`}
              />
            </div>
            <Button
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-black hover:bg-black/90 text-white"
            >
              <BookOpen className="h-4 w-4" />
              Read Me
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 pt-0">
          <Button 
            onClick={() => router.push("/2/leaderboard")} 
            disabled={!hasReadInstructions} // disabled until they read the instructions
            variant="outline" 
            className="w-full flex items-center gap-2 hover:bg-blue-50 hover:text-yellow-700 transition-colors cursor-pointer"
          >
            <Award className="h-4 w-4" />
            View Leaderboard
          </Button>
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