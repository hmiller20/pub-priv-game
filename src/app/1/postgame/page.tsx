"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export default function PrivatePostgamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const score = parseInt(searchParams.get("score") || "0")
  const userName = searchParams.get("userName") || "Player"

  const handleConclude = () => {
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
            onClick={() => router.push("/1/pregame")}
            className="w-full bg-black hover:bg-black/90 text-white cursor-pointer"
          >
            Play Again
          </Button>
          <Button
            onClick={handleConclude}
            className="w-full bg-black hover:bg-black/90 text-white cursor-pointer"
          >
            Conclude Study
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
} 