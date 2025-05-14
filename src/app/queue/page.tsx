"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { FloatingBubbles } from "../floating-bubbles"

export default function QueuePage() {
  const router = useRouter()
  const [queueStatus, setQueueStatus] = useState("initializing")
  const [participantCount, setParticipantCount] = useState(1)

  useEffect(() => {
    // Create user first if not exists
    const createUserIfNeeded = async () => {
      let userId = localStorage.getItem('ratGameUserId');
      
      if (!userId) {
        try {
          // Get all user data from localStorage
          const gamePlays = parseInt(localStorage.getItem('gamePlays') || '0');
          const leaderboardViews = parseInt(localStorage.getItem('leaderboardViews') || '0');
          const assignedCondition = localStorage.getItem('assignedCondition') || '';
          const age = parseInt(localStorage.getItem('age') || '0');
          const gender = parseInt(localStorage.getItem('gender') || '0');
          
          // Get game performance data
          const gamePerformance: Record<string, any> = {};
          for (let i = 1; i <= gamePlays; i++) {
            const score = localStorage.getItem(`play${i}Score`);
            const skips = localStorage.getItem(`play${i}Skips`);
            if (score !== null && skips !== null) {
              gamePerformance[`play${i}`] = {
                score: parseInt(score),
                skips: parseInt(skips),
                completedAt: new Date()
              };
            }
          }

          // Get survey responses if they exist
          const surveyResponses = localStorage.getItem('surveyResponses') 
            ? JSON.parse(localStorage.getItem('surveyResponses') || '{}')
            : undefined;

          const createUserResponse = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              gamePlays,
              leaderboardViews,
              gamePerformance,
              assignedCondition,
              age,
              gender,
              surveyResponses,
              createdAt: new Date(),
              updatedAt: new Date()
            }),
          });

          if (!createUserResponse.ok) {
            throw new Error('Failed to create user');
          }

          const data = await createUserResponse.json();
          if (!data.success) {
            throw new Error('Failed to create user');
          }

          userId = data.userId;
          if (userId) {
            localStorage.setItem('ratGameUserId', userId);
          }
        } catch (error) {
          console.error('Failed to create user:', error);
          return; // Don't proceed with queue sequence if user creation fails
        }
      }

      // Only proceed with queue sequence if we have a userId
      if (userId) {
        runQueueSequence();
      }
    };

    // Sequence of queue states
    const queueSequence = [
      // Initial state: 1 participant
      { count: 1, delay: 2000 },
      // Second state: 2 participants
      { count: 2, delay: 3000 },
      // Third state: 3 participants
      { count: 3, delay: 2000 },
      // Fourth state: back to 2 participants (someone left)
      { count: 2, delay: 2000 },
      // Final state: finding room
      { status: "finding", delay: 2000 }
    ]

    let currentIndex = 0
    const timeouts: NodeJS.Timeout[] = []

    const runQueueSequence = () => {
      if (currentIndex >= queueSequence.length) {
        // Navigate to waiting room after sequence completes
        router.replace('/waitingRoom')
        return
      }

      const currentState = queueSequence[currentIndex]
      const timeout = setTimeout(() => {
        if ('count' in currentState) {
          setParticipantCount(currentState.count as number)
          setQueueStatus("waiting")
        } else {
          setQueueStatus(currentState.status)
        }
        currentIndex++
        runQueueSequence()
      }, currentState.delay)

      timeouts.push(timeout)
    }

    // Start the process by creating user first
    createUserIfNeeded()

    // Cleanup timeouts on unmount
    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [router])

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