"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, ArrowLeft, ArrowUp, ArrowDown, Minus, Clock, Award } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"

// Enhanced leaderboard data with position changes
const leaderboardData = [
  { name: "Alex Wilson", score: 125, date: "2025-04-14", trend: "up" },
  { name: "Jordan Samuel", score: 110, date: "2025-04-13", trend: "same" },
  { name: "Taylor Polis", score: 100, date: "2025-04-12", trend: "down" },
  { name: "Casey Mears", score: 85, date: "2025-04-11", trend: "up" },
  { name: "Riley Sanderson", score: 80, date: "2025-04-10", trend: "down" },
  { name: "Morgan Williams", score: 70, date: "2025-04-09", trend: "same" },
  { name: "Jamie Jackson", score: 65, date: "2025-04-08", trend: "up" },
  { name: "Quinn Turner", score: 55, date: "2025-04-07", trend: "down" },
  { name: "Avery Anderson", score: 45, date: "2025-04-06", trend: "same" },
  { name: "Dakota Richards", score: 30, date: "2025-04-05", trend: "down" },
]

export default function PublicLeaderboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get("from")
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const hasIncrementedViews = useRef(false)

  // Increment leaderboard views when component mounts
  useEffect(() => {    
    if (hasIncrementedViews.current) return;
    hasIncrementedViews.current = true;
    
    const incrementViews = async () => {
      const userId = localStorage.getItem('ratGameUserId');
      if (!userId) return;

      try {
        await fetch(`/api/users/${userId}/leaderboard-view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
      } catch (error) {
        console.error('Failed to increment leaderboard views:', error);
      }
    };

    incrementViews();
  }, []);

  // Update the timestamp every second
  useEffect(() => {
    // Get initial timer value
    const timerStart = parseInt(localStorage.getItem('leaderboardTimer') || Date.now().toString());
    setLastUpdated(timerStart);

    const timer = setInterval(() => {
      setLastUpdated(timerStart);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleBack = () => {
    if (from === "postgame") {
      router.back()
    } else {
      router.push("/2/pregame")
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUp className="h-4 w-4 text-green-500" />
      case "down":
        return <ArrowDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const formatLastUpdated = (timestamp: number | null) => {
    if (!timestamp) return "Just now";
    
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000);
    
    if (diff < 60) return "Just now";
    if (diff < 3600) {
      const mins = Math.floor(diff / 60);
      return `${mins} ${mins === 1 ? 'min' : 'mins'} ago`;
    }
    if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    return new Date(timestamp).toLocaleDateString();
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-blue-100">
      <h1 className="mb-8 text-3xl font-bold">🏆 Category Story Leaderboard 🏆</h1>

      <Card className="w-full max-w-2xl bg-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <span>Top Players</span>
            <Trophy className="h-6 w-6 text-yellow-500" />
          </CardTitle>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-2">
            <Clock className="h-4 w-4" />
            <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Date</TableHead>
                <TableHead className="w-16 text-center">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((entry, index) => (
                <TableRow key={index} className="transition-colors duration-200">
                  <TableCell className="text-center font-medium">
                    {index === 0 ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-white">
                        1
                      </span>
                    ) : index === 1 ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-white">
                        2
                      </span>
                    ) : index === 2 ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-white">
                        3
                      </span>
                    ) : (
                      index + 1
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{entry.name}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {entry.score}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDate(entry.date)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center items-center">
                      {getTrendIcon(entry.trend)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground text-center">
            Rankings are updated automatically based on player performance
          </p>
          <Button 
            onClick={handleBack}
            className="flex items-center gap-2 bg-black hover:bg-black/90 text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            {from === "postgame" ? "Back to Results" : "Return to Game"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
} 