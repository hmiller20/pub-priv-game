"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, SkipForward } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"

// 30 questions
const RAT_QUESTIONS = [
  {
    words: ["CREAM", "SKATE", "WATER"],
    answer: "ICE"
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

  // Auto-focus input on mount and when question changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentQuestionIndex])

  const handleSkip = () => {
    const newScore = Math.max(0, score - 5);
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
      router.replace('/2/postgame');
    }
  };

  // Basic timer
  useEffect(() => {
    console.log("Timer effect running")
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          localStorage.setItem('currentScore', score.toString());
          sessionStorage.setItem('shouldCreateNewPlay', 'true');
          router.replace('/2/postgame');
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
      setScore(prev => prev + 20);
      setFeedback("correct");
      
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setUserInput("");
          setFeedback(null);
        } else {
          localStorage.setItem('currentScore', (score + 20).toString());
          sessionStorage.setItem('shouldCreateNewPlay', 'true');
          router.replace('/2/postgame');
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
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-blue-100">
      <h1 className="mb-8 text-3xl font-bold">Category Story 👀</h1>
      <Card className="w-full max-w-md bg-white">
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
              <div key={index} className="bg-gray-100 p-3 rounded-lg text-center">
                <span className="font-bold text-lg">{word}</span>
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
            <Button 
              onClick={handleSubmit}
              className="bg-black hover:bg-black/90 text-white"
            >
              Submit
            </Button>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="text-muted-foreground hover:bg-gray-100"
            >
              <SkipForward className="mr-1 h-4 w-4" />
              Skip (-5 pts)
            </Button>
          </div>

          {feedback && (
            <div className="absolute bottom-5 left-5 flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
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