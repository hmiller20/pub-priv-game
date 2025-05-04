"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"

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
  const [players, setPlayers] = useState<Player[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [currentFirstName] = useLocalStorage('currentFirstName', '')
  const [currentLastInitial] = useLocalStorage('currentLastInitial', '')
  const [currentAvatarUrl] = useLocalStorage('currentAvatarUrl', '')
  const timeoutRefs = useRef<NodeJS.Timeout[]>([])
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Cleanup: clear all timeouts before running effect
    timeoutRefs.current.forEach(clearTimeout)
    timeoutRefs.current = []

    // Only proceed if user info is set
    if (!currentFirstName || !currentLastInitial || !currentAvatarUrl) return

    const simulatedPlayers = [
      {
        id: 1,
        name: "Alex K.",
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=Alex",
        joinedAt: new Date()
      },
      {
        id: 2,
        name: "Jordan M.",
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=Jordan",
        joinedAt: new Date()
      },
      {
        id: 3,
        name: "Taylor R.",
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=Taylor",
        joinedAt: new Date()
      }
    ]

    // Add current player
    const currentPlayer = {
      id: 4,
      name: `${currentFirstName} ${currentLastInitial}.`,
      avatarUrl: currentAvatarUrl,
      joinedAt: new Date()
    }

    setPlayers([currentPlayer])
    addChatMessage(`${currentPlayer.name} has joined the group!`)

    // Simulate players joining with delays
    const addPlayerWithDelay = (player: Player, index: number) => {
      const timeoutId = setTimeout(() => {
        setPlayers(prev => [...prev, player])
        addChatMessage(`${player.name} has joined the group!`)
      }, index * 2000)
      timeoutRefs.current.push(timeoutId)
    }

    simulatedPlayers.forEach((player, index) => {
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

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return

    const newMessage: ChatMessage = {
      id: Date.now(),
      playerName: `${currentFirstName} ${currentLastInitial}.`,
      message: currentMessage,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, newMessage])
    setCurrentMessage("")

    // Simulate responses
    const responses = [
      "That's interesting!",
      "I agree with you.",
      "What do you think about the game?",
      "I'm excited to start!",
      "This is going to be fun!"
    ]

    setTimeout(() => {
      const randomPlayer = players[Math.floor(Math.random() * players.length)]
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      const responseMessage: ChatMessage = {
        id: Date.now(),
        playerName: randomPlayer.name,
        message: randomResponse,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, responseMessage])
    }, 1000 + Math.random() * 2000)
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
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-blue-100">
      <h1 className="mb-8 text-3xl font-bold">Waiting Room</h1>
      <div className="w-full max-w-4xl space-y-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Group Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4 bg-gray-50">
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
                          : "bg-white border px-4 py-2 rounded-lg rounded-bl-none shadow max-w-xs"
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
            <div className="mt-4 flex space-x-2 items-center">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <Button 
                onClick={handleSendMessage}
                className="h-10 bg-black hover:bg-black/90 text-white min-w-[100px]"
              >
                Send
              </Button>
              <Button
                onClick={handleStartGame}
                className="h-10 min-w-[120px] bg-gray-300 text-gray-500 ml-2 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={players.length < 4}
              >
                Start Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
} 