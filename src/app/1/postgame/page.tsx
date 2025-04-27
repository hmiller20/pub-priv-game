"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"
import { useState, useEffect } from "react"

function PostGameContent() {
  const router = useRouter()
  const [userName] = useLocalStorage('currentUserName', 'Player')
  const [score] = useLocalStorage('currentScore', 0)
  const [skips] = useLocalStorage('currentGameSkips', 0)
  const [scorePosted, setScorePosted] = useState(false)

  useEffect(() => {
    // Clear the game-specific localStorage items after retrieving them
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentScore')
      localStorage.removeItem('currentGameSkips')
    }
  }, [])

  const incrementGamePlay = async () => {
    if (typeof window !== 'undefined') {
      // Store score in localStorage
      localStorage.setItem('lastScore', score.toString())

      // Increment gamePlays counter
      const gamePlays = parseInt(localStorage.getItem('gamePlays') || '0')
      localStorage.setItem('gamePlays', (gamePlays + 1).toString())
    }
    
    const userId = typeof window !== 'undefined' ? localStorage.getItem('ratGameUserId') : null
    if (!userId) return

    try {
      const gamePlay = {
        score: score,
        completedAt: new Date(),
        skips: skips
      }

      await fetch(`/api/users/${userId}/gameplay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gamePlay),
      })
    } catch (error) {
      console.error('Failed to submit game results:', error)
    }
  }

  const handlePlayAgain = async () => {
    await incrementGamePlay()
    router.push("/1/pregame")
  }

  // Handle posting score and concluding study
  const postScoreAndConclude = async () => {
    await incrementGamePlay()
    setScorePosted(true)
    alert(`Score of ${score} for ${userName} has been recorded!`)
    // After posting score, redirect to code page
    router.push(`/code?score=${score}&condition=1`)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-blue-100">
      <h1 className="mb-8 text-3xl font-bold">Category Story</h1>
      <Card className="w-full max-w-md bg-white">
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4 py-8">
            <h2 className="text-2xl font-bold">Game Over!</h2>
            <p className="text-xl">Your final score: {score}</p>
            <div className="flex items-center space-x-2">
              <span>Great job, {userName}!</span>
            </div>
            <p className="text-center text-muted-foreground mt-4">
              Your score has been recorded privately for research purposes. You can play again to try to improve your score.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            onClick={handlePlayAgain}
            className="w-full bg-black hover:bg-black/90 text-white cursor-pointer"
          >
            Play Again
          </Button>
          <Button
            onClick={postScoreAndConclude}
            className="w-full bg-black hover:bg-black/90 text-white cursor-pointer"
          >
            Conclude Study
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}

export default function PostGamePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostGameContent />
    </Suspense>
  )
} 