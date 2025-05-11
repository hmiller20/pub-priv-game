"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"
import FloatingBubbles from "../floating-bubbles"

// Add loading spinner component
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
)

interface ChatMessage {
  id: number
  playerName: string
  message: string
  timestamp: Date
}

interface Player {
  id: number
  name: string
  avatarUrl: string
  joinedAt: Date
}

export default function WaitingRoom() {
  const router = useRouter()
  const [userMessageCount, setUserMessageCount] = useState(0)
  const [alexGreeted, setAlexGreeted] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [currentFirstName] = useLocalStorage('currentFirstName', '')
  const [currentLastInitial] = useLocalStorage('currentLastInitial', '')
  const [currentAvatarUrl] = useLocalStorage('currentAvatarUrl', '')
  const timeoutRefs = useRef<NodeJS.Timeout[]>([])
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  const [botReplyCounts, setBotReplyCounts] = useState({
    "Alex K.": 0,
    "Jordan M.": 0,
    "Taylor R.": 0,
  });

  useEffect(() => {
    // Cleanup: clear all timeouts before running effect
    timeoutRefs.current.forEach(clearTimeout)
    timeoutRefs.current = []

    // Only proceed if user info is set
    if (!currentFirstName || !currentLastInitial || !currentAvatarUrl) return

    const userJoinTime = new Date()
    const firstBotJoinTime = new Date(userJoinTime.getTime() - 20000) // 20 seconds before user

    const simulatedPlayers = [
      {
        id: 1,
        name: "Alex K.",
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=AlexK&body=rounded&clothingColor=456dff&eyes=sunglasses&hair=shortCombover&hairColor=6c4545&mouth=smile&nose=mediumRound&skinColor=d78774&facialHairProbability=0",
        joinedAt: firstBotJoinTime
      },
      {
        id: 2,
        name: "Jordan M.",
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=JordanM&body=rounded&clothingColor=456dff&eyes=open&hair=buzzcut&hairColor=362c47&mouth=smile&nose=mediumRound&skinColor=92594b&facialHairProbability=0",
        joinedAt: new Date()
      },
      {
        id: 3,
        name: "Taylor R.",
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=TaylorR&body=rounded&clothingColor=456dff&eyes=happy&hair=long&hairColor=362c47&mouth=bigSmile&nose=mediumRound&skinColor=eeb4a4&facialHairProbability=0",
        joinedAt: new Date()
      }
    ]

    // Add first bot player immediately
    setPlayers([simulatedPlayers[0]])
    addChatMessage(`${simulatedPlayers[0].name} has joined the group!`)

    // Add current player after a short delay
    const currentPlayer = {
      id: 4,
      name: `${currentFirstName} ${currentLastInitial}.`,
      avatarUrl: currentAvatarUrl,
      joinedAt: userJoinTime
    }

    const userTimeoutId = setTimeout(() => {
      setPlayers(prev => [...prev, currentPlayer])
      addChatMessage(`${currentPlayer.name} has joined the group!`)

      // Add greeting from Alex after a short delay
const alexGreetingTimeout = setTimeout(() => {
  const alexGreeting: ChatMessage = {
    id: Date.now(),
    playerName: "Alex K.",
    message: "Hi i'm alex",
    timestamp: new Date()
  };
  setChatMessages(prev => [...prev, alexGreeting]);
  setAlexGreeted(true)
}, 1000); // 1 second delay to feel natural

timeoutRefs.current.push(alexGreetingTimeout);
    }, 1000)
    timeoutRefs.current.push(userTimeoutId)

    // Simulate remaining players joining with delays
    const addPlayerWithDelay = (player: Player, index: number) => {
      const timeoutId = setTimeout(() => {
        setPlayers(prev => [...prev, player])
        addChatMessage(`${player.name} has joined the group!`)
      }, (index + 2) * 2000) // Start from index + 2 to account for user
      timeoutRefs.current.push(timeoutId)
    }

    // Add remaining simulated players
    simulatedPlayers.slice(1).forEach((player, index) => {
      addPlayerWithDelay(player, index)
    })

    // Cleanup: clear all timeouts
    return () => {
      timeoutRefs.current.forEach(clearTimeout)
      timeoutRefs.current = []
    }
  }, [currentFirstName, currentLastInitial, currentAvatarUrl])

  const addChatMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now(),
      playerName: "System",
      message,
      timestamp: new Date()
    }
    setChatMessages(prev => [...prev, newMessage])
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return

    const newMessage: ChatMessage = {
      id: Date.now(),
      playerName: `${currentFirstName} ${currentLastInitial}.`,
      message: currentMessage,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, newMessage])
    setCurrentMessage("")
    setUserMessageCount(prev => prev + 1)

    // Get responses from AI players
    for (const player of players) {
      if (player.name !== `${currentFirstName} ${currentLastInitial}.`) {
        // Prevent Alex from replying to the user's first message since he already greeted them
        if (player.name === "Alex K." && !alexGreeted && userMessageCount === 0) {
          continue;
        }
        const shouldReply = Math.random() < 0.7; // 70% chance to reply
        if (!shouldReply) continue; // Skip this bot
        try {
          console.log('Sending message to AI player:', player.name);
          
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: currentMessage,
              playerName: player.name,
              chatHistory: chatMessages,
              botReplyCounts: botReplyCounts
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            console.error('AI response error:', {
              status: response.status,
              error: data.error,
              details: data.details
            });
            throw new Error(data.error || 'Failed to get AI response');
          }

          if (data.success) {
            // Add a random delay between 1-3 seconds to make it feel more natural
            const typingSpeed = 40 + Math.random() * 60; // chars per second
            const delay = data.message.length * (1000 / typingSpeed); 
            setTimeout(() => {
              const aiMessage: ChatMessage = {
                id: Date.now(),
                playerName: player.name,
                message: data.message,
                timestamp: new Date()
              };
              setChatMessages(prev => [...prev, aiMessage]);
              // Update bot reply count here, after the bot replies
              setBotReplyCounts(prev => ({
                ...prev,
                [player.name as "Alex K." | "Jordan M." | "Taylor R."]: prev[player.name as "Alex K." | "Jordan M." | "Taylor R."] + 1,
              }));
            }, delay);
          } else {
            console.error('AI response unsuccessful:', data);
          }
        } catch (error) {
          console.error('Failed to get AI response:', error);
          // Add a fallback message if the AI response fails
          const fallbackMessage: ChatMessage = {
            id: Date.now(),
            playerName: player.name,
            message: "Sorry, I'm having trouble responding right now. Let's talk about the game!",
            timestamp: new Date()
          };
          setChatMessages(prev => [...prev, fallbackMessage]);
        }
      }
    }
  }

  const handleStartGame = () => {
    router.replace('/loading')
  }

  // Scroll to bottom when chatMessages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatMessages])

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
        className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-center leading-[1.1] py-4 mb-4 z-10 relative"
        style={{
          background: "linear-gradient(90deg, #4f46e5 0%, #9333ea 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Waiting Room
      </h1>
      <div className="w-full max-w-4xl z-10 relative">
        <Card className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-6">
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {players.map((player) => (
                <div key={player.id} className="flex flex-col items-center space-y-2">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={player.avatarUrl} />
                    <AvatarFallback>{player.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{player.name}</span>
                </div>
              ))}
              {Array(Math.max(0, 4 - players.length)).fill(null).map((_, index) => (
                <div key={`empty-${index}`} className="flex flex-col items-center space-y-2">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                  <span className="text-sm text-gray-500">Looking for another player...</span>
                </div>
              ))}
            </div>
            <div className="border-t border-blue-100 my-4" />
            {/* Group Chat Section */}
            <div>
              <div className="flex items-center mb-4">
                
              </div>
              <ScrollArea className="h-[300px] w-full rounded-md border border-blue-100 p-4 bg-blue-50">
                <div className="space-y-4">
                  {chatMessages.map((msg, idx) => {
                    // Determine message type
                    const isSystem = msg.playerName === "System"
                    const isUser = msg.playerName === `${currentFirstName} ${currentLastInitial}.`
                    return (
                      <div key={msg.id} className={
                        isSystem
                          ? "flex justify-center"
                          : isUser
                          ? "flex justify-end"
                          : "flex justify-start"
                      }>
                        <div className={
                          isSystem
                            ? "bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-xs font-medium max-w-xs"
                            : isUser
                            ? "bg-blue-500 text-white px-4 py-2 rounded-lg rounded-br-none shadow max-w-xs"
                            : "bg-white border border-blue-100 px-4 py-2 rounded-lg rounded-bl-none shadow max-w-xs"
                        }>
                          <div className="flex items-center gap-2 mb-1">
                            {!isSystem && (
                              <span className="font-semibold text-xs truncate">
                                {msg.playerName}
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400 font-normal">
                              {typeof msg.timestamp === 'string' ? new Date(msg.timestamp).toLocaleTimeString() : msg.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-sm break-words">{msg.message}</div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
              <div className="mt-4 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 items-center">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-blue-100 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200"
                />
                <button
                  onClick={handleSendMessage}
                  className="h-10 bg-white text-blue-700 font-semibold min-w-[100px] rounded-2xl border border-blue-100 shadow transition-all duration-200 flex items-center gap-2 group hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:bg-blue-50"
                  style={{ boxShadow: "0 4px 16px 0 rgba(80, 112, 255, 0.08)" }}
                >
                  <span className="transition-all duration-200 mx-auto">Send</span>
                </button>
                <button
                  onClick={handleStartGame}
                  className="h-10 min-w-[120px] bg-white text-blue-700 font-semibold rounded-2xl border border-blue-100 shadow transition-all duration-200 ml-0 md:ml-2 flex items-center gap-2 group hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ boxShadow: "0 4px 16px 0 rgba(80, 112, 255, 0.08)" }}
                  disabled={players.length < 4}
                >
                  <span className="transition-all duration-200 mx-auto">Start Game</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
} 