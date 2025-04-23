"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { AlertCircle, Trophy, Award } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export default function PublicPostgamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const score = parseInt(searchParams.get("score") || "0")
  const userName = searchParams.get("userName") || "Player"
  const [scorePosted, setScorePosted] = useState(false)

  // Handle posting score to leaderboard and concluding study
  const postScoreAndConclude = () => {
    // This would normally connect to a backend API
    // For now, we'll just simulate a successful post
    setScorePosted(true)
    alert(`Score of ${score} for ${userName} has been posted to the leaderboard!`)
    // After posting score, redirect to code page
    router.push(`/code?score=${score}&condition=2`)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-blue-100">
      <h1 className="mb-8 text-3xl font-bold">Category Story 👀</h1>
      <Card className="w-full max-w-md bg-white">
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4 py-8">
            <h2 className="text-2xl font-bold">Game Over!</h2>
            <p className="text-xl">Your final score: {score}</p>
            <div className="flex items-center space-x-2">
              <span>Great job, {userName}!</span>
            </div>
            <p className="text-center text-muted-foreground mt-4">
              You can play again to try to improve your score, or you can post your current score to the public leaderboard.
            </p>
            {scorePosted && (
              <div className="flex items-center space-x-2 text-green-500">
                <Trophy size={18} />
                <span>Your score has been posted to the leaderboard!</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            onClick={() => router.push("/2/pregame")}
            className="w-full bg-black hover:bg-black/90 text-white cursor-pointer"
          >
            Play Again
          </Button>
          <Button
            onClick={postScoreAndConclude}
            className="w-full bg-black hover:bg-black/90 text-white cursor-pointer"
            disabled={scorePosted}
          >
            {scorePosted ? "Score Posted" : "Post My Score and Conclude Study"}
          </Button>
          <Button
            onClick={() => router.push("/2/leaderboard?from=postgame")}
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