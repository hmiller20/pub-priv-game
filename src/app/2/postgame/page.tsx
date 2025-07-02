"use client"

import { useState, useEffect, Suspense, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Award } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"
import { StartGameButton } from "@/components/ui/send-start-buttons"

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
      let questionsAnswered = parseInt(localStorage.getItem('currentGameQuestionsAnswered') || '0');
      if (shouldCreate) {
        if (
          localStorage.getItem(`play${nextPlay}Score`) === null &&
          localStorage.getItem(`play${nextPlay}Skips`) === null
        ) {
          localStorage.setItem('gamePlays', nextPlay.toString());
          localStorage.setItem(`play${nextPlay}Score`, score.toString());
          localStorage.setItem(`play${nextPlay}Skips`, skips.toString());
          localStorage.setItem(`play${nextPlay}QuestionsAnswered`, questionsAnswered.toString());
          localStorage.removeItem('currentScore');
          localStorage.removeItem('currentGameSkips');
          localStorage.removeItem('currentGameQuestionsAnswered');
          localStorage.removeItem('currentGameStartTime');
          localStorage.removeItem('currentGameDuration');
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
      const questionsAnswered = parseInt(localStorage.getItem(`play${latestPlay}QuestionsAnswered`) || '0')
      
      const duration = parseInt(localStorage.getItem('currentGameDuration') || '0')
      
      const gamePlay = {
        score: score,
        skips: skips,
        duration: duration,
        questions_answered: questionsAnswered,
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
      // Clear timing data for new game session
      localStorage.removeItem('currentGameStartTime');
      localStorage.removeItem('currentGameDuration');
    }
    router.replace("/2/game")
  }

  // Handle posting score to leaderboard and proceeding to survey
  const postScoreAndContinue = async () => {
    await incrementGamePlay()
    setScorePosted(true)
    // After posting score, redirect to survey
    router.replace('/survey/prompt')
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
      <Card className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-blue-100 p-6">
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4 py-8">
            <h2 className="text-2xl font-bold">Game Over</h2>
            <p className="text-3xl font-bold mb-2">Final Score: {displayScore}</p>
            <p className="text-center text-muted-foreground mt-4">
              You can play again to try to improve your score, view the leaderboard, or post your current score and continue.
            </p>
            {scorePosted}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <StartGameButton
            onClick={handlePlayAgain}
            className="w-full"
          >
            Play Again
          </StartGameButton>
          <StartGameButton
            onClick={postScoreAndContinue}
            className="w-full"
          >
            Post Score and Continue
          </StartGameButton>
          {/* <StartGameButton
            onClick={() => router.replace("/2/leaderboard?from=postgame")}
            className="w-full flex items-center gap-2"
          >
            View Leaderboard
          </StartGameButton> */}
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