"use client"

import { useState, useEffect, Suspense, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Award } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"

function PostGameContent() {
  const router = useRouter()
  const [firstName] = useLocalStorage('avatarFirstName', 'Player')
  const [lastInitial] = useLocalStorage('avatarLastInitial', '')
  const [displayScore, setDisplayScore] = useState(0)
  const [scorePosted, setScorePosted] = useState(false)
  const hasWritten = useRef(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !hasWritten.current) {
      const shouldCreate = sessionStorage.getItem('shouldCreateNewPlay') === 'true';
      let gamePlays = parseInt(localStorage.getItem('gamePlays') || '0');
      const nextPlay = gamePlays + 1;
      let score = parseInt(localStorage.getItem('currentScore') || '0');
      let skips = parseInt(localStorage.getItem('currentGameSkips') || '0');
      if (shouldCreate) {
        if (
          localStorage.getItem(`play${nextPlay}Score`) === null &&
          localStorage.getItem(`play${nextPlay}Skips`) === null
        ) {
          localStorage.setItem('gamePlays', nextPlay.toString());
          localStorage.setItem(`play${nextPlay}Score`, score.toString());
          localStorage.setItem(`play${nextPlay}Skips`, skips.toString());
          localStorage.removeItem('currentScore');
          localStorage.removeItem('currentGameSkips');
        }
        sessionStorage.removeItem('shouldCreateNewPlay');
        setDisplayScore(score); // set the score for this play
      } else {
        // Not a new play, so show the latest playNScore
        const latestPlay = parseInt(localStorage.getItem('gamePlays') || '1');
        const latestScore = parseInt(localStorage.getItem(`play${latestPlay}Score`) || '0');
        setDisplayScore(latestScore);
      }
      hasWritten.current = true;
    }
  }, []);

  // Helper to get the latest play number
  const getLatestPlayNumber = () => {
    if (typeof window === 'undefined') return 1
    return parseInt(localStorage.getItem('gamePlays') || '1')
  }

  const incrementGamePlay = async () => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('ratGameUserId') : null
    if (!userId) return

    try {
      const latestPlay = getLatestPlayNumber()
      const score = parseInt(localStorage.getItem(`play${latestPlay}Score`) || '0')
      const skips = parseInt(localStorage.getItem(`play${latestPlay}Skips`) || '0')
      
      const gamePlay = {
        score: score,
        skips: skips,
        completedAt: new Date()
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
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('fromPostgame', 'true');
    }
    router.replace("/2/instructions")
  }

  // Handle posting score to leaderboard and proceeding to survey
  const postScoreAndContinue = async () => {
    await incrementGamePlay()
    setScorePosted(true)
    // After posting score, redirect to survey
    router.replace('/survey/demographics')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-blue-100">
      <h1 className="mb-8 text-3xl font-bold">Category Story 👀</h1>
      <Card className="w-full max-w-md bg-white">
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4 py-8">
            <h2 className="text-2xl font-bold">Game Over!</h2>
            <p className="text-xl">Great job, {firstName} {lastInitial}!</p>
            <p className="text-3xl font-bold mb-2">Final Score: {displayScore}</p>
            <p className="text-center text-muted-foreground mt-4">
              You can play again to try to improve your score, post your current score to the public leaderboard, or proceed to the next part of the study.
            </p>
            {scorePosted}
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
            onClick={postScoreAndContinue}
            className="w-full bg-black hover:bg-black/90 text-white"
          >
            Post Score and Continue
          </Button>
          <Button
            onClick={() => router.replace("/2/leaderboard?from=postgame")}
            className="w-full bg-black hover:bg-black/90 text-white flex items-center gap-2 cursor-pointer"
          >
            <Award className="h-4 w-4" />
            View Leaderboard
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