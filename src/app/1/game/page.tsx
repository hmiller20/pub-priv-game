"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, SkipForward } from "lucide-react"
import { useRouter } from "next/navigation"
import { Suspense } from "react"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"
import { StartGameButton, SendButton } from "@/components/ui/send-start-buttons"

// 30 questions
const RAT_QUESTIONS = [
  {
    words: ["HOUND", "PRESSURE", "SHOT"],
    answer: "BLOOD"
  },
  {
    words: ["FALLING", "ACTOR", "DUST"],
    answer: "STAR"
  },
  {
    words: ["BROKEN", "CLEAR", "EYE"],
    answer: "GLASS"
  },
  {
    words: ["BLUE", "CAKE", "COTTAGE"],
    answer: "CHEESE"
  },
  {
    words: ["PALM", "SHOE", "HOUSE"],
    answer: "TREE"
  },
  {
    words: ["BASKET", "EIGHT", "SNOW"],
    answer: "BALL"
  },
  {
    words: ["CROSS", "RAIN", "TIE"],
    answer: "BOW"
  },
  {
    words: ["SANDWICH", "HOUSE", "GOLF"],
    answer: "CLUB"
  },
  {
    words: ["LOSER", "THROAT", "SPOT"],
    answer: "SORE"
  },
  {
    words: ["SHOW", "LIFE", "ROW"],
    answer: "BOAT"
  },
  {
    words: ["NIGHT", "WRIST", "STOP"],
    answer: "WATCH"
  },
  {
    words: ["DUCK", "FOLD", "DOLLAR"],
    answer: "BILL"
  },
  {
    words: ["ROCKING", "WHEEL", "HIGH"],
    answer: "CHAIR"
  },
  {
    words: ["DEW", "COMB", "BEE"],
    answer: "HONEY"
  },
  {
    words: ["FOUNTAIN", "BAKING", "POP"],
    answer: "SODA"
  },
  {
    words: ["AID", "RUBBER", "WAGON"],
    answer: "BAND"
  },
  {
    words: ["FLAKE", "MOBILE", "CONE"],
    answer: "SNOW"
  },
  {
    words: ["CRACKER", "FLY", "FIGHTER"],
    answer: "FIRE"
  },
  {
    words: ["SAFETY", "CUSHION", "POINT"],
    answer: "PIN"
  },
  {
    words: ["CANE", "DADDY", "PLUM"],
    answer: "SUGAR"
  },
  {
    words: ["DREAM", "BREAK", "LIGHT"],
    answer: "DAY"
  },
  {
    words: ["FISH", "MINE", "RUSH"],
    answer: "GOLD"
  },
  {
    words: ["POLITICAL", "SURPRISE", "LINE"],
    answer: "PARTY"
  },
  {
    words: ["TRAP", "POLAR", "CLAW"],
    answer: "BEAR"
  },
  {
    words: ["CINDER", "BUILDING", "BLOCK"],
    answer: "BUSTER"
  },
  {
    words: ["THORN", "WHACK", "ROSE"],
    answer: "BUSH"
  },
  {
    words: ["GARBAGE", "BEER", "PAINT"],
    answer: "CAN"
  },
  {
    words: ["SCAN", "NAP", "BURGLAR"],
    answer: "CAT"
  },
  {
    words: ["TRAP", "BACK", "SCREEN"],
    answer: "DOOR"
  },
  {
    words: ["POLISH", "FINGER", "NAIL"],
    answer: "DOWN"
  }
]

const GAME_DURATION = 120 // 2 minutes

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function GameContent() {
  const router = useRouter()
  const [score, setScore] = useState(0)
  const [skips, setSkips] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const [questions] = useState(() => shuffleArray(RAT_QUESTIONS))
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [feedback, setFeedback] = useState<null | "correct" | "incorrect">(null)

  const handleSkip = () => {
    const newScore = score - 5;
    setScore(newScore);
    const newSkips = skips + 1;
    setSkips(newSkips);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentGameSkips', newSkips.toString());
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserInput("");
      setFeedback(null);
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentScore', newScore.toString());
        sessionStorage.setItem('shouldCreateNewPlay', 'true');
      }
      router.replace('/1/postgame');
    }
  };

  // Auto-focus input on mount and when question changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentQuestionIndex])

  // Basic timer
  useEffect(() => {
    console.log("Timer effect running")
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('currentScore', score.toString());
            sessionStorage.setItem('shouldCreateNewPlay', 'true');
          }
          router.replace('/1/postgame');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, score]);

  const handleSubmit = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = userInput.toLowerCase() === currentQuestion.answer.toLowerCase();
    
    if (isCorrect) {
      const newScore = score + 20;
      setScore(newScore);
      setFeedback("correct");
      
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setUserInput("");
          setFeedback(null);
        } else {
          if (typeof window !== 'undefined') {
            localStorage.setItem('currentScore', newScore.toString());
            sessionStorage.setItem('shouldCreateNewPlay', 'true');
          }
          router.replace('/1/postgame');
        }
      }, 1000);
    } else {
      setFeedback("incorrect");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <main
      className="flex min-h-screen p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f6faff 0%, #f8f6ff 100%)",
      }}
    >
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Game Section - Left Side */}
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-center leading-[1.1] py-4 mb-4 z-10 relative"
            style={{
              background: "linear-gradient(90deg, #4f46e5 0%, #9333ea 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Category Story
          </h1>
          <Card className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-blue-100 p-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <Badge variant="outline" className="text-lg font-bold">
                  {formatTime(timeLeft)}
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">Score:</span>
                  <span className="text-2xl font-bold text-black">{score}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6 relative">
              <div className="grid grid-cols-3 gap-4">
                {currentQuestion.words.map((word, index) => (
                  <div key={index} className="bg-gray-100 p-3 rounded-lg text-center min-h-[60px] flex items-center justify-center">
                    <span className="font-bold text-lg break-words">{word}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Enter answer..."
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className={
                    feedback === "correct" ? "border-green-500" : 
                    feedback === "incorrect" ? "border-red-500" : ""
                  }
                />
                <SendButton onClick={handleSubmit}>
                  Submit
                </SendButton>
              </div>
              <div className="flex justify-end">
                <StartGameButton
                  onClick={handleSkip}
                  className="bg-white text-gray-600 hover:text-gray-900 border border-blue-100 min-w-[140px] px-6 py-2"
                  style={{ minWidth: 0 }}
                >
                  Skip (-5 pts)
                </StartGameButton>
              </div>
              {feedback && (
                <div className="absolute bottom-2 left-2 flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                  {feedback === "correct" ? (
                    <>
                      <CheckCircle2 className="text-green-500" />
                      <span className="text-green-500">Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-500" />
                      <span className="text-red-500">Try again!</span>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Decorative Panel - Right Side */}
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2
            className="text-2xl sm:text-3xl font-semibold tracking-tight text-center leading-[1.1] py-4 mb-4 z-10 relative"
            style={{
              background: "linear-gradient(90deg, #4f46e5 0%, #9333ea 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
          </h2>
          <Card className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-blue-100 p-4">
            <CardContent className="px-4">
              <div className="space-y-4">
                {/* Geometric Pattern 1 */}
                <div className="flex justify-center items-center h-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-4 h-4 bg-blue-200 rounded-full"></div>
                    <div className="w-6 h-6 bg-purple-200 rounded-sm rotate-45"></div>
                    <div className="w-4 h-4 bg-indigo-200 rounded-full"></div>
                    <div className="w-6 h-6 bg-blue-200 rounded-sm rotate-45"></div>
                    <div className="w-4 h-4 bg-purple-200 rounded-full"></div>
                  </div>
                </div>

                {/* Geometric Pattern 2 */}
                <div className="flex justify-center items-center h-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="w-3 h-3 bg-green-200 rounded-full"></div>
                    <div className="w-3 h-3 bg-blue-200 rounded-sm"></div>
                    <div className="w-3 h-3 bg-teal-200 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
                    <div className="w-3 h-3 bg-blue-200 rounded-sm"></div>
                    <div className="w-3 h-3 bg-teal-200 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-200 rounded-full"></div>
                    <div className="w-3 h-3 bg-blue-200 rounded-sm"></div>
                  </div>
                </div>

                {/* Puzzle Piece Pattern */}
                <div className="flex justify-center items-center h-20 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                  <div className="flex space-x-3">
                    <div className="relative">
                      <div className="w-8 h-8 bg-amber-200 rounded-lg"></div>
                      <div className="absolute -top-1 left-3 w-2 h-2 bg-amber-200 rounded-full"></div>
                      <div className="absolute top-3 -right-1 w-2 h-2 bg-amber-200 rounded-full"></div>
                    </div>
                    <div className="relative">
                      <div className="w-8 h-8 bg-orange-200 rounded-lg"></div>
                      <div className="absolute top-3 -left-1 w-2 h-2 bg-white rounded-full border border-orange-200"></div>
                      <div className="absolute -bottom-1 left-3 w-2 h-2 bg-orange-200 rounded-full"></div>
                    </div>
                    <div className="relative">
                      <div className="w-8 h-8 bg-yellow-200 rounded-lg"></div>
                      <div className="absolute -top-1 left-3 w-2 h-2 bg-white rounded-full border border-yellow-200"></div>
                      <div className="absolute top-3 -right-1 w-2 h-2 bg-yellow-200 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Wave Pattern */}
                <div className="flex justify-center items-center h-16 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <div className="flex items-end space-x-1">
                    <div className="w-2 h-8 bg-purple-200 rounded-t-full"></div>
                    <div className="w-2 h-12 bg-pink-200 rounded-t-full"></div>
                    <div className="w-2 h-6 bg-purple-200 rounded-t-full"></div>
                    <div className="w-2 h-10 bg-pink-200 rounded-t-full"></div>
                    <div className="w-2 h-4 bg-purple-200 rounded-t-full"></div>
                    <div className="w-2 h-8 bg-pink-200 rounded-t-full"></div>
                    <div className="w-2 h-12 bg-purple-200 rounded-t-full"></div>
                    <div className="w-2 h-6 bg-pink-200 rounded-t-full"></div>
                  </div>
                </div>

                {/* Hexagon Pattern */}
                <div className="flex justify-center items-center h-16 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="w-6 h-6 bg-cyan-200 rounded rotate-45"></div>
                    <div className="w-6 h-6 bg-blue-200 rounded-full"></div>
                    <div className="w-6 h-6 bg-teal-200 rounded rotate-45"></div>
                    <div className="w-6 h-6 bg-blue-200 rounded-full"></div>
                    <div className="w-6 h-6 bg-cyan-200 rounded rotate-45"></div>
                    <div className="w-6 h-6 bg-teal-200 rounded-full"></div>
                  </div>
                </div>

                {/* Final Decorative Row */}
                <div className="flex justify-center items-center h-16 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                  <div className="flex space-x-4">
                    <div className="w-8 h-8 border-2 border-indigo-200 rounded-full"></div>
                    <div className="w-8 h-8 bg-purple-200 rounded-sm rotate-12"></div>
                    <div className="w-8 h-8 border-2 border-purple-200 rounded-full"></div>
                    <div className="w-8 h-8 bg-indigo-200 rounded-sm rotate-12"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

export default function GamePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GameContent />
    </Suspense>
  )
} 