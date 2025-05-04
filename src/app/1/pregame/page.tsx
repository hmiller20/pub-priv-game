"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"

export default function PublicPregame() {
  const router = useRouter()
  const [firstName, setFirstName] = useLocalStorage('currentFirstName', '')
  const [lastInitial, setLastInitial] = useLocalStorage('currentLastInitial', '')
  const [lastScore, setLastScore] = useLocalStorage('lastScore', null)
  const [hasReadInstructions, setHasReadInstructions] = useLocalStorage('hasReadInstructions', false)
  const [showModal, setShowModal] = useState(false)
  const [modalPage, setModalPage] = useState(1)
  const [countdown, setCountdown] = useState(10)
  const [isTimerActive, setIsTimerActive] = useState(false)

  // Initialize localStorage counters if they don't exist
  useEffect(() => {
    const isClient = typeof window !== 'undefined';
    if (isClient) {
      if (!localStorage.getItem('gamePlays')) {
        localStorage.setItem('gamePlays', '0')
      }
      if (!localStorage.getItem('leaderboardViews')) {
        localStorage.setItem('leaderboardViews', '0')
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
  }, [isTimerActive, countdown]) //this is important; without it, the timer does not run

  const handleStartGame = () => {
    if (!firstName.trim() || !lastInitial.trim()) {
      alert("Please enter both your first name and last initial before starting the game")
      return
    }
    setFirstName(firstName)
    setLastInitial(lastInitial)
    router.replace('/1/game')
  }

  const handleGoBack = () => {
    setModalPage(prev => prev - 1)
    if (!hasReadInstructions) {
      setIsTimerActive(true)
      setCountdown(10)
    }
  }

  const handleModalNext = () => {
    if (modalPage < 3) {
      setModalPage(prev => prev + 1)
      if (!hasReadInstructions) {
        setIsTimerActive(true)
        setCountdown(10)
      }
    } else {
      setShowModal(false)
      setHasReadInstructions(true)
      // Store that user has read instructions
      localStorage.setItem('hasReadInstructions', 'true')
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
            In this task, you will be presented with three words. Your goal is to find a fourth word that is associated with all three words shown. In other words, you will find a <span className="font-bold">story</span> for each grouping!
          </p>
          <p>
            For example, if you see the words:<br />
            <strong>CREAM - SKATE - WATER</strong><br />
            The answer would be: <strong>ICE</strong>
          </p>
          <p>
            You can either submit your answer or skip to the next question. Correct answers <span className="font-bold text-green-600">earn</span> 20 points, while skipping <span className="font-bold text-red-600">deducts</span> 5 points. Incorrect answers do not change your point total.
          </p>
        </CardContent>
      )
    },
    2: {
      title: "Why This Matters",
      content: (
        <CardContent className="space-y-4">
          <p>
            The task you'll be performing measures mental acuity and the ability to create connections across concepts, which are basic elements of <span className="font-bold">intelligence</span> and <span className="font-bold">creativity</span>. Performance on this task has been shown to predict a number of important outcomes including <span className="font-bold">career success</span>, <span className="font-bold">salary</span>, and even people's ability to form <span className="font-bold">satisfying relationships</span>.
          </p>
          <p>
            Therefore, it is important that you try your best to solve the questions. Your participation will help us better understand how different forms of intelligence and creativity contribute to <span className="font-bold">positive life outcomes</span>.
          </p>
        </CardContent>
      )
    },
    3: {
      title: "Your Score",
      content: (
        <CardContent className="space-y-4">
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
            <div className="w-full space-y-4 mb-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  Enter Your First Name
                </label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Your first name"
                  value={firstName}
                  onChange={(e) => {
                    if (!lastScore) {
                      setFirstName(e.target.value)
                    }
                  }}
                  disabled={!!lastScore}
                  className={`w-full ${lastScore ? 'bg-gray-100' : ''}`}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastInitial" className="text-sm font-medium">
                  Enter Your Last Initial
                </label>
                <Input
                  id="lastInitial"
                  type="text"
                  placeholder="Your last initial"
                  value={lastInitial}
                  onChange={(e) => {
                    if (!lastScore) {
                      // Only allow a single character
                      const value = e.target.value.slice(0, 1).toUpperCase()
                      setLastInitial(value)
                    }
                  }}
                  disabled={!!lastScore}
                  className={`w-full ${lastScore ? 'bg-gray-100' : ''}`}
                  maxLength={1}
                />
              </div>
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
              <CardTitle>{modalContent[modalPage as 1 | 2 | 3].title}</CardTitle>
            </CardHeader>
            {modalContent[modalPage as 1 | 2 | 3].content}
            <CardFooter className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">
                  Page {modalPage} of 3
                </div>
                {modalPage > 1 && (
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
                {countdown > 0 ? `You may advance in ${countdown}` : "Next"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </main>
  )
} 