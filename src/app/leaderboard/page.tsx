"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock leaderboard data
const leaderboardData = [
  { name: "Alex Wilson", score: 120, date: "2025-04-14" },
  { name: "Jordan Samuel", score: 110, date: "2025-04-13" },
  { name: "Taylor Polis", score: 100, date: "2025-04-12" },
  { name: "Casey Mears", score: 90, date: "2025-04-11" },
  { name: "Riley sanderson", score: 80, date: "2025-04-10" },
  { name: "Morgan Williams", score: 70, date: "2025-04-09" },
  { name: "Jamie jackson", score: 60, date: "2025-04-08" },
  { name: "quinn turner", score: 50, date: "2025-04-07" },
  { name: "Avery Anderson", score: 40, date: "2025-04-06" },
  { name: "Dakota Richards", score: 30, date: "2025-04-05" },
]

export default function LeaderboardPage() {
  const router = useRouter()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-blue-100">
      <h1 className="mb-8 text-3xl font-bold">Anagram Glam Leaderboard 🏆</h1>

      <Card className="w-full max-w-2xl bg-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <span>Top Players</span>
            <Trophy className="h-6 w-6 text-yellow-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((entry, index) => (
                <TableRow key={index}>
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
                  <TableCell>{entry.name}</TableCell>
                  <TableCell className="text-right">{entry.score}</TableCell>
                  <TableCell className="text-right">{entry.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push("/")} className="flex items-center gap-2 bg-black hover:bg-black/90 text-white transition-colors cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            Return to Start Menu
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
