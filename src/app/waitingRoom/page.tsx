"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"
import FloatingBubbles from "../floating-bubbles"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { SendButton, StartGameButton } from "@/components/ui/send-start-buttons"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import confetti from "canvas-confetti"

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
  const [currentStep, setCurrentStep] = useState(1)
  const [canProceed, setCanProceed] = useState(false)
  const [stepCountdown, setStepCountdown] = useState(3)
  const totalSteps = 2
  const [showMessageWarning, setShowMessageWarning] = useState(false)
  const initialGreetingsSent = useRef(false)

  const GROUP_NAMES = ["The Puzzlers", "Fightin' Zebras", "Rattlesnakes"] as const
  const [selectedGroup, setSelectedGroup] = useState<string>("")
  const [voteSubmitted, setVoteSubmitted] = useState(false)
  const [totalVotes, setTotalVotes] = useState(0)
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false)
  const [showVotingComplete, setShowVotingComplete] = useState(false)
  const [votingCountdown, setVotingCountdown] = useState<number | null>(null)

  // Move this function outside the useEffect:
  const handleVote = () => {
    if (!selectedGroup) return
    setVoteSubmitted(true)
    setTotalVotes(1) // User's vote counts as the first vote
    
    // Trigger confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4f46e5', '#9333ea', '#06b6d4', '#10b981', '#f59e0b']
    })
    
    try {
      localStorage.setItem("groupNameVote", selectedGroup)
      localStorage.setItem("selectedTeamName", selectedGroup)
    } catch (e) {
      console.warn("Unable to save vote:", e)
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem("chatMessages");
    if (stored) setChatMessages(JSON.parse(stored));
  }, []);
  
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(chatMessages));
  
    const waitingRoomMessages = chatMessages.map(msg => ({
      name: msg.playerName,
      role: msg.playerName === `${currentFirstName} ${currentLastInitial}.` ? "user" : "system",
      message: msg.message,
      timestamp: new Date(msg.timestamp).toISOString()
    }));
  
    const userId = localStorage.getItem("ratGameUserId");
    if (!userId) {
      console.error("No user ID found in localStorage");
      return;
    }

    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        messages: waitingRoomMessages
      })
    });
  }, [chatMessages, currentFirstName, currentLastInitial]);
  

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
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=AlexK&body=rounded&clothingColor=722F37&eyes=sunglasses&hair=shortCombover&hairColor=6c4545&mouth=smile&nose=mediumRound&skinColor=d78774&facialHairProbability=0",
        joinedAt: firstBotJoinTime
      },
      {
        id: 2,
        name: "Jordan M.",
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=JordanM&body=rounded&clothingColor=722F37&eyes=open&hair=buzzcut&hairColor=362c47&mouth=smile&nose=mediumRound&skinColor=92594b&facialHairProbability=0",
        joinedAt: new Date()
      },
      {
        id: 3,
        name: "Taylor R.",
        avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=TaylorR&body=rounded&clothingColor=722F37&eyes=happy&hair=long&hairColor=362c47&mouth=bigSmile&nose=mediumRound&skinColor=eeb4a4&facialHairProbability=0",
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

      // Add greeting from Jordan after 5 seconds
      const jordanGreetingTimeout = setTimeout(() => {
        const jordanGreeting: ChatMessage = {
          id: Date.now(),
          playerName: "Jordan M.",
          message: "yo",
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, jordanGreeting]);
      }, 5000);

      // Add greeting from Taylor after 8 seconds
      const taylorGreetingTimeout = setTimeout(() => {
        const taylorGreeting: ChatMessage = {
          id: Date.now(),
          playerName: "Taylor R.",
          message: "hi hi!",
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, taylorGreeting]);
      }, 8000);

      timeoutRefs.current.push(alexGreetingTimeout, jordanGreetingTimeout, taylorGreetingTimeout);
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

  useEffect(() => {
    // Reset step timer and canProceed when step changes
    setCanProceed(false)
    setStepCountdown(3)
    
    // Start countdown timer
    const timer = setInterval(() => {
      setStepCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setCanProceed(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [currentStep])

  const addChatMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now(),
      playerName: "System",
      message,
      timestamp: new Date()
    }
    setChatMessages(prev => [...prev, newMessage])
  }



  // Add effect for initial greetings
  useEffect(() => {
    if (initialGreetingsSent.current) return;
    if (players.length === 0) return; // Wait for players to be loaded

    const sendGreeting = async (playerName: string, message: string) => {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: "hi", // This will be overridden by the AI's greeting
            playerName: playerName,
            chatHistory: chatMessages,
            botReplyCounts: botReplyCounts
          }),
        });

        const data = await response.json();
        if (data.success) {
          const greetingMessage: ChatMessage = {
            id: Date.now(),
            playerName: playerName,
            message: data.message,
            timestamp: new Date()
          };
          setChatMessages(prev => [...prev, greetingMessage]);
          setBotReplyCounts(prev => ({
            ...prev,
            [playerName as "Alex K." | "Jordan M." | "Taylor R."]: prev[playerName as "Alex K." | "Jordan M." | "Taylor R."] + 1,
          }));
        }
      } catch (error) {
        console.error('Error sending initial greeting from', playerName, ':', error);
      }
    };

    // Send Jordan's greeting after 5 seconds
    const jordanTimeout = setTimeout(() => {
      sendGreeting("Jordan M.", "hi");
    }, 5000);

    // Send Taylor's greeting after 8 seconds
    const taylorTimeout = setTimeout(() => {
      sendGreeting("Taylor R.", "hi");
    }, 8000);

    initialGreetingsSent.current = true;

    return () => {
      clearTimeout(jordanTimeout);
      clearTimeout(taylorTimeout);
    };
  }, [players, chatMessages, botReplyCounts]);

  // Effect to automatically progress votes when conditions are met
  useEffect(() => {
    if (!hasUserSentMessage || !voteSubmitted || totalVotes >= 4) return;

    const interval = setInterval(() => {
      setTotalVotes(prev => {
        if (prev >= 4) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000); // Increase vote count every 2 seconds

    return () => clearInterval(interval);
  }, [hasUserSentMessage, voteSubmitted, totalVotes]);

  // Effect to show voting complete popup when all votes are in
  useEffect(() => {
    if (totalVotes === 4 && !showVotingComplete) {
      setShowVotingComplete(true);
      setVotingCountdown(10); // Start 10 second countdown
    }
  }, [totalVotes, showVotingComplete]);

  // Effect to handle voting countdown
  useEffect(() => {
    if (votingCountdown === null) return;

    if (votingCountdown <= 0) {
      router.replace('/loading');
      return;
    }

    const timer = setInterval(() => {
      setVotingCountdown(prev => prev !== null ? prev - 1 : null);
    }, 1000);

    return () => clearInterval(timer);
  }, [votingCountdown, router]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    // Helper function to detect if a message is a greeting
    const isGreeting = (message: string): boolean => {
      const greetingWords = ['hi', 'hello', 'hey', 'yo', 'sup', 'greetings', 'howdy'];
      const lowerMessage = message.toLowerCase();
      return greetingWords.some(word => lowerMessage.includes(word));
    };

    const messageIsGreeting = isGreeting(currentMessage);
    console.log('Message is greeting:', messageIsGreeting);

    const newMessage: ChatMessage = {
      id: Date.now(),
      playerName: `${currentFirstName} ${currentLastInitial}.`,
      message: currentMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newMessage]);
    setCurrentMessage("");
    setUserMessageCount(prev => prev + 1);
    setHasUserSentMessage(true); // Track that user has sent a message

    // Get all players that should potentially respond
    const playersToRespond = players.filter(p => 
      p.name !== `${currentFirstName} ${currentLastInitial}.` && 
      !(p.name === "Alex K." && alexGreeted && userMessageCount === 0)
    );

    console.log('Getting responses from:', playersToRespond.map(p => p.name).join(', '));

    // Get responses from other players
    for (const player of playersToRespond) {
      // Always respond to greetings, otherwise use random chance
      const shouldReply = messageIsGreeting ? true : Math.random() < 0.7;
      
      if (!shouldReply) {
        console.log(`${player.name} is not responding to this message`);
        continue;
      }

      try {
        console.log('Getting response from:', player.name, messageIsGreeting ? '(greeting)' : '');
        
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
          console.error('Error getting response from', player.name, ':', {
            status: response.status,
            error: data.error,
            details: data.details
          });
          throw new Error(data.error || 'Failed to get response');
        }

        if (data.success) {
          const typingSpeed = 40 + Math.random() * 60;
          const delay = data.message.length * (1000 / typingSpeed);
          
          setTimeout(() => {
            const aiMessage: ChatMessage = {
              id: Date.now(),
              playerName: player.name,
              message: data.message,
              timestamp: new Date()
            };
            setChatMessages(prev => [...prev, aiMessage]);
            setBotReplyCounts(prev => ({
              ...prev,
              [player.name as "Alex K." | "Jordan M." | "Taylor R."]: prev[player.name as "Alex K." | "Jordan M." | "Taylor R."] + 1,
            }));
            
            console.log(`${player.name} has responded`);
          }, delay);
        }
      } catch (error) {
        console.error('Error getting response from', player.name, ':', error);
        const fallbackMessage: ChatMessage = {
          id: Date.now(),
          playerName: player.name,
          message: "Sorry, I'm having trouble responding right now. Let's talk about the game!",
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, fallbackMessage]);
        
        console.log(`${player.name} had trouble responding`);
      }
    }
  };

  const handleStartGame = () => {
    if (userMessageCount === 0) {
      setShowMessageWarning(true)
      return
    }
    router.replace('/loading')
  }

  // Scroll to bottom when chatMessages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatMessages])

  const modalSteps = [
    "Use the group chat to send a greeting to your groupmates!",
    "Once all participants have sent a message and voted for a group name, the game will begin automatically."
  ];

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f6faff 0%, #f8f6ff 100%)",
      }}
    >
      <Dialog 
        open={showMessageWarning} 
        onOpenChange={setShowMessageWarning}
        modal={true}
      >
        <DialogContent className="sm:max-w-md [&>button]:hidden">
          <DialogHeader>
            <DialogDescription className="text-center mt-2 text-base text-black space-y-4 py-6">
              Please send a greeting to your groupmates before starting the game.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="relative min-h-[64px] mt-6">
            <StartGameButton
              onClick={() => setShowMessageWarning(false)}
              className="absolute right-0 bottom-0 ml-auto m-2 min-w-[100px] px-6 py-2 shadow-sm rounded-xl transition-all duration-200 bg-white text-blue-600 hover:text-blue-800 border border-blue-100 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:bg-blue-50"
            >
              Got it
            </StartGameButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog 
        open={currentStep > 0 && currentStep <= totalSteps} 
        onOpenChange={(open) => {
          if (!open && currentStep === totalSteps && canProceed) {
            setCurrentStep(0);
          }
        }}
        modal={true}
      >
        {currentStep > 0 && currentStep <= totalSteps && (
          <DialogContent className="sm:max-w-md [&>button]:hidden">
            <DialogHeader>
              <div className="flex justify-center gap-2">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      index + 1 === currentStep
                        ? "bg-blue-500"
                        : index + 1 < currentStep
                        ? "bg-blue-300"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <DialogDescription className="text-center mt-2 text-base text-black space-y-4 py-6">
                <p className="text-center">{modalSteps[currentStep - 1]}</p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="relative min-h-[64px] mt-6">
              <StartGameButton
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 1}
                className={`absolute left-0 bottom-0 bg-white text-gray-600 hover:text-gray-900 border border-blue-100 min-w-[100px] px-6 py-2 m-2 shadow-sm rounded-xl transition-all duration-200 ${
                  currentStep === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={{ minWidth: 0 }}
              >
                Previous
              </StartGameButton>
              {currentStep < totalSteps ? (
                <StartGameButton
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={!canProceed}
                  className={`absolute right-0 bottom-0 ml-auto m-2 min-w-[100px] px-6 py-2 shadow-sm rounded-xl transition-all duration-200 ${
                    !canProceed ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-white text-blue-600 hover:text-blue-800 border border-blue-100"
                  }`}
                >
                  {!canProceed ? `Continue in ${stepCountdown}` : "Continue"}
                </StartGameButton>
              ) : (
                <StartGameButton
                  onClick={() => setCurrentStep(0)}
                  disabled={!canProceed}
                  className={`absolute right-0 bottom-0 ml-auto m-2 min-w-[100px] px-6 py-2 shadow-sm rounded-xl transition-all duration-200 ${
                    !canProceed ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-white text-blue-600 hover:text-blue-800 border border-blue-100"
                  }`}
                >
                  {!canProceed ? `Continue in ${stepCountdown}` : "Got it!"}
                </StartGameButton>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Voting Complete Announcement Dialog */}
      <Dialog open={showVotingComplete} onOpenChange={() => {}} modal={true}>
        <DialogContent className="sm:max-w-md [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-center text-green-600">
              🎉 Team Name Selected!
            </DialogTitle>
            <DialogDescription className="text-center mt-4 text-base text-black space-y-4 py-4">
              <div className="space-y-3">
                <p className="text-lg font-medium">
                  <span className="text-blue-700 font-bold">{selectedGroup}</span> received the most votes!
                </p>
                <p className="text-base">
                  Your team name is <span className="text-blue-700 font-bold">{selectedGroup}.</span>
                </p>
                <p className="text-sm text-gray-600">
                  The game will begin shortly.
                </p>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-700 font-semibold">
                    Starting in {votingCountdown} seconds...
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Master heading and subheading */}
      <div className="text-center mb-8 z-10 relative">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] py-4 mb-2"
          style={{
            background: "linear-gradient(90deg, #4f46e5 0%, #9333ea 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Waiting Room
        </h1>
        <p className="text-lg text-gray-600 font-medium">
          Chat with your group mates and vote for a group name!
        </p>
      </div>

      {/* ---------- TWO-COLUMN LAYOUT ---------- */}
      <div className={`container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start transition-all duration-300 ${
        showVotingComplete ? "opacity-50 pointer-events-none" : ""
      }`}>
        {/* ===== Left column – existing Waiting-Room content ===== */}
        <div className="flex flex-col items-center justify-center">
          {/* existing card with avatars + chat */}
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
                      onKeyPress={(e) => e.key === 'Enter' && !showVotingComplete && handleSendMessage()}
                      placeholder={showVotingComplete ? "Voting complete..." : "Type a message..."}
                      disabled={showVotingComplete}
                      className={`flex-1 rounded-xl border border-blue-100 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 ${
                        showVotingComplete ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
                      }`}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={showVotingComplete}
                      className={`h-10 font-semibold min-w-[120px] rounded-2xl border shadow transition-all duration-200 flex items-center gap-2 ${
                        showVotingComplete 
                          ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                          : "bg-white text-blue-700 border-blue-100 group hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:bg-blue-50"
                      }`}
                      style={!showVotingComplete ? { boxShadow: "0 4px 16px 0 rgba(80, 112, 255, 0.08)" } : {}}
                    >
                      <span className="transition-all duration-200 mx-auto">Send</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ===== Right column – NEW Group-Name voting card ===== */}
        <div className="flex flex-col items-center justify-center z-10 relative">
          <Card className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-blue-100 p-6 h-[600px]">
            <CardContent className="space-y-6 h-full flex flex-col">
              {/* Progress Bar Section */}
              <div className="space-y-3">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-800">Group Name Voting</h3>
                  <p className="text-sm text-gray-600">{totalVotes}/4 votes received</p>
                </div>
                <Progress value={(totalVotes / 4) * 100} className="w-full" />
              </div>

              {/* Voting Options Section - Takes up remaining space */}
              <div className="flex-1 flex flex-col justify-center">
                {voteSubmitted ? (
                  <div className="text-center space-y-4">
                    <div className="text-green-600 font-medium text-lg">
                      ✓ Thank you for voting!
                    </div>
                    <div className="text-sm text-gray-600">
                      You voted for: <span className="font-semibold text-blue-700">{selectedGroup}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Waiting for other group members...
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 text-center font-medium">Vote for your favorite group name:</p>
                    <div className="space-y-3">
                      {GROUP_NAMES.map((name) => (
                        <button
                          key={name}
                          onClick={() => setSelectedGroup(name)}
                          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                            selectedGroup === name
                              ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <span className="font-medium text-lg">{name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button Section - Fixed at bottom */}
              {!voteSubmitted && (
                <div className="mt-auto">
                  <Button
                    onClick={handleVote}
                    disabled={!selectedGroup}
                    className="w-full bg-white text-blue-700 font-semibold text-xl py-4 px-8 rounded-2xl border border-blue-100 shadow transition-all duration-200 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:bg-blue-50"
                    style={{ boxShadow: "0 4px 16px 0 rgba(80, 112, 255, 0.08)" }}
                  >
                    Submit Vote
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* ---------- end two-column layout ---------- */}
    </main>
  )
} 