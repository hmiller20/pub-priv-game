"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { FloatingBubbles } from "../floating-bubbles"
import { Button } from "@/components/ui/button"

export default function QueuePage() {
  const router = useRouter()
  const [queueStatus, setQueueStatus] = useState("initializing")
  const [participantCount, setParticipantCount] = useState(1)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const timeouts: NodeJS.Timeout[] = []

    // Create user first if not exists
    const createUserIfNeeded = async () => {
      try {
        let userId = localStorage.getItem('ratGameUserId')
        
        if (!userId) {
          // Batch localStorage reads
          const localStorageData = {
            gamePlays: parseInt(localStorage.getItem('gamePlays') || '0'),
            leaderboardViews: parseInt(localStorage.getItem('leaderboardViews') || '0'),
            assignedCondition: localStorage.getItem('assignedCondition') || '',
            age: parseInt(localStorage.getItem('age') || '0'),
            gender: parseInt(localStorage.getItem('gender') || '0'),
            surveyResponses: localStorage.getItem('surveyResponses') 
              ? JSON.parse(localStorage.getItem('surveyResponses') || '{}')
              : undefined
          }

          // Get game performance data in a single loop
          const gamePerformance: Record<string, any> = {}
          for (let i = 1; i <= localStorageData.gamePlays; i++) {
            const score = localStorage.getItem(`play${i}Score`)
            const skips = localStorage.getItem(`play${i}Skips`)
            if (score !== null && skips !== null) {
              gamePerformance[`play${i}`] = {
                score: parseInt(score),
                skips: parseInt(skips),
                completedAt: new Date()
              }
            }
          }

          const createUserResponse = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...localStorageData,
              gamePerformance,
              createdAt: new Date(),
              updatedAt: new Date()
            }),
          })

          if (!createUserResponse.ok) {
            throw new Error('Failed to create user')
          }

          const data = await createUserResponse.json()
          if (!data.success || !data.userId) {
            throw new Error('Failed to create user')
          }

          userId = data.userId
          if (typeof userId === 'string') {
            localStorage.setItem('ratGameUserId', userId)
          }
        }

        if (userId && isMounted) {
          runQueueSequence()
        }
      } catch (error) {
        console.error('Failed to create user:', error)
        if (isMounted) {
          setError('Failed to initialize queue. Please refresh the page.')
        }
      }
    }

    // Simplified queue sequence with shorter delays
    const queueSequence = [
      { count: 56, delay: 1000 },
      { count: 78, delay: 1500 },
      { count: 77, delay: 1000 },
      { count: 94, delay: 1000 },
      { status: "finding", delay: 1000 }
    ] as const

    let currentIndex = 0

    const runQueueSequence = () => {
      if (!isMounted || currentIndex >= queueSequence.length) {
        if (isMounted) {
          router.replace('/waitingRoom')
        }
        return
      }

      const currentState = queueSequence[currentIndex]
      const timeout = setTimeout(() => {
        if (isMounted) {
          if ('count' in currentState) {
            setParticipantCount(currentState.count)
            setQueueStatus("waiting")
          } else {
            setQueueStatus(currentState.status)
          }
          currentIndex++
          runQueueSequence()
        }
      }, currentState.delay)

      timeouts.push(timeout)
    }

    createUserIfNeeded()

    return () => {
      isMounted = false
      timeouts.forEach(clearTimeout)
    }
  }, [router])

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-red-100 shadow-xl">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <p className="text-lg text-red-600">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    )
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

      <div className="flex flex-col items-center space-y-8 z-10">
        {/* Loading Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse' }} />
          </div>
        </div>

        {/* Status Card */}
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-blue-100 shadow-xl">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              {queueStatus === "initializing" && (
                <p className="text-lg text-gray-700">Initializing queue...</p>
              )}
              {queueStatus === "waiting" && (
                <p className="text-lg text-gray-700">
                  There {participantCount === 1 ? 'is' : 'are'} {participantCount} {participantCount === 1 ? 'participant' : 'participants'} in the queue...
                </p>
              )}
              {queueStatus === "finding" && (
                <p className="text-lg text-gray-700">Finding a waiting room...</p>
              )}
              <div className="flex justify-center space-x-2 mt-4">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
} 