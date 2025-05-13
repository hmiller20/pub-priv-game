"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, ArrowLeft, ArrowUpIcon, ArrowDownIcon, MinusIcon, Clock } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { StartGameButton } from "@/components/ui/send-start-buttons"
import { FloatingBubbles } from "../../floating-bubbles"

declare global {
  interface Window {
    _hasIncrementedLeaderboardViews?: boolean;
  }
}

const LEADERBOARD_DATA = [
  { userName: "Caleb L", score: 125, date: "2025-04-13", trend: "up" },
  { userName: "Samantha P", score: 110, date: "2025-04-12", trend: "neutral" },
  { userName: "Taylor R", score: 95, date: "2025-04-11", trend: "down" },
  { userName: "David B", score: 80, date: "2025-04-10", trend: "up" },
  { userName: "Will S", score: 80, date: "2025-04-09", trend: "down" },
  { userName: "Landon M", score: 75, date: "2025-04-08", trend: "neutral" },
  { userName: "Anna M", score: 70, date: "2025-04-07", trend: "up" },
  { userName: "Kylie C", score: 60, date: "2025-04-06", trend: "neutral" },
  { userName: "Drew N", score: 45, date: "2025-04-05", trend: "neutral" },
  { userName: "Jeff M", score: 30, date: "2025-04-04", trend: "down" },
] as const;

function LeaderboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromPostgame = searchParams.get('from') === 'postgame'
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const hasIncremented = useRef(false)

  // Track leaderboard views
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasIncremented.current) {
      // Increment leaderboard views in localStorage
      const currentViews = parseInt(localStorage.getItem('leaderboardViews') || '0')
      localStorage.setItem('leaderboardViews', (currentViews + 1).toString())
      
      // Increment views in MongoDB
      const userId = localStorage.getItem('ratGameUserId')
      if (userId) {
        fetch(`/api/users/${userId}/leaderboard-view`, {
          method: 'POST',
        }).catch(error => {
          console.error('Failed to increment leaderboard views:', error)
        })
      }

      hasIncremented.current = true
    }
  }, [])

  // Initialize the timer
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get the last update time from localStorage
      const storedLastUpdate = localStorage.getItem('leaderboardLastUpdate')
      if (storedLastUpdate) {
        setLastUpdate(storedLastUpdate)
      } else {
        // If no stored time, set it to now
        const now = new Date().toISOString()
        localStorage.setItem('leaderboardLastUpdate', now)
        setLastUpdate(now)
      }
    }
  }, [])

  // Update current time every minute to show accurate time difference
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const getTimeSinceUpdate = () => {
    if (!lastUpdate) {
      return "just now"
    }

    const lastUpdateDate = new Date(lastUpdate)
    const diffMinutes = Math.floor((currentTime.getTime() - lastUpdateDate.getTime()) / 60000)
    
    if (diffMinutes < 1) return "just now"
    if (diffMinutes === 1) return "1 min ago"
    if (diffMinutes < 60) return `${diffMinutes} mins ago`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours === 1) return "1 hour ago"
    return `${diffHours} hours ago`
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpIcon className="h-5 w-5 text-green-500" />
      case 'down':
        return <ArrowDownIcon className="h-5 w-5 text-red-500" />
      default:
        return <span className="text-gray-400">—</span>
    }
  }

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return "bg-yellow-100 text-yellow-700 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-yellow-200"
      case 1:
        return "bg-gray-100 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-gray-200"
      case 2:
        return "bg-amber-100 text-amber-700 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-amber-200"
      default:
        return "w-8 text-center"
    }
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f6faff 0%, #f8f6ff 100%)",
      }}
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <FloatingBubbles />
      </div>
      <h1
        className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-center leading-[1.1] py-4 mb-4 z-10 relative flex items-center gap-2"
        style={{
          background: "linear-gradient(90deg, #4f46e5 0%, #9333ea 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        <Trophy className="h-8 w-8 text-yellow-500" />
        Category Story Leaderboard
        <Trophy className="h-8 w-8 text-yellow-500" />
      </h1>
      <Card className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-blue-100 p-6 z-10 relative">
        <CardHeader>
          <CardTitle className="text-center flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <span>Top Players</span>
              <Trophy className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Last updated: {getTimeSinceUpdate()}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <div className="grid grid-cols-5 gap-4 px-6 py-3 text-gray-500 border-b">
              <div>Rank</div>
              <div>Player</div>
              <div className="text-right">Score</div>
              <div className="text-right">Date</div>
              <div className="text-center">Trend</div>
            </div>
            {LEADERBOARD_DATA.map((entry, index) => (
              <div
                key={index}
                className="grid grid-cols-5 gap-4 px-6 py-4 border-b hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <div className={getRankStyle(index)}>
                    {index + 1}
                  </div>
                </div>
                <div className="font-medium">{entry.userName}</div>
                <div className="text-right font-bold">{entry.score}</div>
                <div className="text-right text-gray-500">
                  {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex justify-center">{getTrendIcon(entry.trend)}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 mt-4 text-sm">
            Rankings are updated every hour based on player performance
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <StartGameButton
            onClick={() => router.replace(fromPostgame ? '/2/postgame' : '/2/instructions')}
          >
            Return to Game
          </StartGameButton>
        </CardFooter>
      </Card>
    </main>
  )
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LeaderboardContent />
    </Suspense>
  )
}