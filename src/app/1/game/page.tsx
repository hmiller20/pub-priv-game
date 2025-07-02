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
    answer: "BLOOD",
    distractors: ["WATER", "SOUND", "HEART"]
  },
  {
    words: ["FALLING", "ACTOR", "DUST"],
    answer: "STAR",
    distractors: ["MOVIE", "LIGHT", "SKY"]
  },
  {
    words: ["BROKEN", "CLEAR", "EYE"],
    answer: "GLASS",
    distractors: ["WATER", "WINDOW", "MIRROR"]
  },
  {
    words: ["BLUE", "CAKE", "COTTAGE"],
    answer: "CHEESE",
    distractors: ["HOUSE", "CREAM", "WHITE"]
  },
  {
    words: ["PALM", "SHOE", "HOUSE"],
    answer: "TREE",
    distractors: ["HAND", "FOOT", "HOME"]
  },
  {
    words: ["BASKET", "EIGHT", "SNOW"],
    answer: "BALL",
    distractors: ["GAME", "WHITE", "ROUND"]
  },
  {
    words: ["CROSS", "RAIN", "TIE"],
    answer: "BOW",
    distractors: ["KNOT", "STORM", "BIND"]
  },
  {
    words: ["SANDWICH", "HOUSE", "GOLF"],
    answer: "CLUB",
    distractors: ["FOOD", "HOME", "GAME"]
  },
  {
    words: ["LOSER", "THROAT", "SPOT"],
    answer: "SORE",
    distractors: ["PAIN", "NECK", "MARK"]
  },
  {
    words: ["SHOW", "LIFE", "ROW"],
    answer: "BOAT",
    distractors: ["WATER", "SAIL", "OARS"]
  },
  {
    words: ["NIGHT", "WRIST", "STOP"],
    answer: "WATCH",
    distractors: ["TIME", "GUARD", "LOOK"]
  },
  {
    words: ["DUCK", "FOLD", "DOLLAR"],
    answer: "BILL",
    distractors: ["MONEY", "BIRD", "PAPER"]
  },
  {
    words: ["ROCKING", "WHEEL", "HIGH"],
    answer: "CHAIR",
    distractors: ["SEAT", "ROUND", "TALL"]
  },
  {
    words: ["DEW", "COMB", "BEE"],
    answer: "HONEY",
    distractors: ["SWEET", "HIVE", "BUZZ"]
  },
  {
    words: ["FOUNTAIN", "BAKING", "POP"],
    answer: "SODA",
    distractors: ["WATER", "CAKE", "DRINK"]
  },
  {
    words: ["AID", "RUBBER", "WAGON"],
    answer: "BAND",
    distractors: ["HELP", "WHEEL", "MUSIC"]
  },
  {
    words: ["FLAKE", "MOBILE", "CONE"],
    answer: "SNOW",
    distractors: ["WHITE", "PHONE", "ICE"]
  },
  {
    words: ["CRACKER", "FLY", "FIGHTER"],
    answer: "FIRE",
    distractors: ["FOOD", "INSECT", "PLANE"]
  },
  {
    words: ["SAFETY", "CUSHION", "POINT"],
    answer: "PIN",
    distractors: ["SOFT", "SHARP", "SAFE"]
  },
  {
    words: ["CANE", "DADDY", "PLUM"],
    answer: "SUGAR",
    distractors: ["SWEET", "FATHER", "FRUIT"]
  },
  {
    words: ["DREAM", "BREAK", "LIGHT"],
    answer: "DAY",
    distractors: ["NIGHT", "TIME", "SUN"]
  },
  {
    words: ["FISH", "MINE", "RUSH"],
    answer: "GOLD",
    distractors: ["WATER", "DIG", "FAST"]
  },
  {
    words: ["POLITICAL", "SURPRISE", "LINE"],
    answer: "PARTY",
    distractors: ["VOTE", "SHOCK", "WAIT"]
  },
  {
    words: ["TRAP", "POLAR", "CLAW"],
    answer: "BEAR",
    distractors: ["CATCH", "COLD", "SHARP"]
  },
  {
    words: ["CINDER", "BUILDING", "BLOCK"],
    answer: "BUSTER",
    distractors: ["FIRE", "HOUSE", "SQUARE"]
  },
  {
    words: ["THORN", "WHACK", "ROSE"],
    answer: "BUSH",
    distractors: ["SHARP", "HIT", "FLOWER"]
  },
  {
    words: ["GARBAGE", "BEER", "PAINT"],
    answer: "CAN",
    distractors: ["TRASH", "DRINK", "COLOR"]
  },
  {
    words: ["SCAN", "NAP", "BURGLAR"],
    answer: "CAT",
    distractors: ["READ", "SLEEP", "THIEF"]
  },
  {
    words: ["TRAP", "BACK", "SCREEN"],
    answer: "DOOR",
    distractors: ["CATCH", "FRONT", "WINDOW"]
  },
  {
    words: ["POLISH", "FINGER", "NAIL"],
    answer: "DOWN",
    distractors: ["SHINE", "HAND", "HARD"]
  }
]

const GAME_DURATION = 600 // 10 minutes

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate shuffled multiple choice options
function generateChoices(question: typeof RAT_QUESTIONS[0]) {
  const choices = [question.answer, ...question.distractors];
  return shuffleArray(choices);
}

function GameContent() {
  const router = useRouter()
  const [score, setScore] = useState(0)
  const [skips, setSkips] = useState(0)
  
  const [questions] = useState(() => shuffleArray(RAT_QUESTIONS))
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState("")
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [feedback, setFeedback] = useState<null | "correct" | "incorrect">(null)
  const [isFirstAttempt, setIsFirstAttempt] = useState(true)
  const [choices, setChoices] = useState<string[]>([])
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false)

  // Generate choices when question changes
  useEffect(() => {
    if (questions[currentQuestionIndex]) {
      const newChoices = generateChoices(questions[currentQuestionIndex]);
      setChoices(newChoices);
      setSelectedChoice("");
      setIsFirstAttempt(true);
      setIsProcessingAnswer(false); // Re-enable pointer events for new question
    }
  }, [currentQuestionIndex, questions]);

  const handleSkip = () => {
    // Skipping is now worth 0 points (no score change)
    const newSkips = skips + 1;
    setSkips(newSkips);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentGameSkips', newSkips.toString());
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setFeedback(null);
    } else {
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentScore', score.toString());
        sessionStorage.setItem('shouldCreateNewPlay', 'true');
      }
      router.replace('/1/postgame');
    }
  };

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
    if (!selectedChoice || isProcessingAnswer) return;
    
    setIsProcessingAnswer(true); // Disable pointer events immediately
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedChoice === currentQuestion.answer;
    
    let newScore;
    if (isCorrect) {
      const pointsToAdd = isFirstAttempt ? 15 : 5; // 15 points for first try, 5 for subsequent
      newScore = score + pointsToAdd;
      setScore(newScore);
      setFeedback("correct");
    } else {
      // Incorrect answers now lose 5 points
      newScore = score - 5;
      setScore(newScore);
      setFeedback("incorrect");
    }
    
    // Always move to next question after showing feedback, regardless of correctness
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setFeedback(null);
      } else {
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentScore', newScore.toString());
          sessionStorage.setItem('shouldCreateNewPlay', 'true');
        }
        router.replace('/1/postgame');
      }
    }, 1000);
  };

  const handleEndGame = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentScore', score.toString());
      sessionStorage.setItem('shouldCreateNewPlay', 'true');
    }
    router.replace('/1/postgame');
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
                {feedback && (
                  <div className="flex items-center space-x-2">
                    {feedback === "correct" ? (
                      <>
                        <CheckCircle2 className="text-green-500 h-6 w-6" />
                        <span className="text-green-500 font-bold text-xl">+{isFirstAttempt ? 15 : 5} pts</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="text-red-500 h-6 w-6" />
                        <span className="text-red-500 font-bold text-xl">-5 pts</span>
                      </>
                    )}
                  </div>
                )}
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
              
              {/* Multiple Choice Options - 2x2 Grid */}
              <div className="space-y-3">
                <p className="text-sm text-gray-600 text-center">Select the word that connects all three:</p>
                <div className="grid grid-cols-2 gap-3">
                  {choices.map((choice, index) => (
                    <button
                      key={choice}
                      onClick={() => !isProcessingAnswer && setSelectedChoice(choice)}
                      disabled={isProcessingAnswer}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                        selectedChoice === choice
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      } ${isProcessingAnswer ? 'pointer-events-none opacity-75' : ''}`}
                    >
                      <span className="font-medium text-lg">{choice}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-between">
                <StartGameButton
                  onClick={handleSkip}
                  className="bg-white text-gray-600 hover:text-gray-900 border border-gray-300 px-6 py-2 flex-1"
                >
                  Skip
                </StartGameButton>
                <SendButton 
                  onClick={handleSubmit}
                  disabled={!selectedChoice || isProcessingAnswer}
                  className="flex-1"
                >
                  Submit Answer
                </SendButton>
              </div>
              
              {/* End Game and Advance Button */}
              <div className="flex justify-center mt-3">
                <StartGameButton
                  onClick={handleEndGame}
                  className="bg-black text-white hover:bg-gray-800 border border-black px-6 py-2"
                >
                  End Game and Advance
                </StartGameButton>
              </div>
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
            <CardContent className="px-4 relative h-96 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
              {/* Scattered geometric shapes */}
              <div className="absolute top-8 left-8">
                <div className="w-6 h-6 bg-blue-300 rounded-full opacity-70"></div>
              </div>
              <div className="absolute top-16 right-12">
                <div className="w-8 h-8 bg-purple-300 rounded-sm rotate-45 opacity-60"></div>
              </div>
              <div className="absolute top-24 left-1/3">
                <div className="w-4 h-4 bg-indigo-300 rounded-full opacity-80"></div>
              </div>
              <div className="absolute top-32 right-1/4">
                <div className="w-6 h-6 bg-teal-300 rounded rotate-12 opacity-70"></div>
              </div>
              <div className="absolute top-12 left-1/2">
                <div className="w-5 h-5 border-2 border-green-300 rounded-full opacity-60"></div>
              </div>
              
              {/* Middle section shapes */}
              <div className="absolute top-1/3 left-12">
                <div className="w-7 h-7 bg-amber-300 rounded-lg opacity-50"></div>
              </div>
              <div className="absolute top-1/3 right-16">
                <div className="w-5 h-5 bg-orange-300 rounded-full opacity-70"></div>
              </div>
              <div className="absolute top-40 left-1/4">
                <div className="w-6 h-6 bg-yellow-300 rounded rotate-45 opacity-60"></div>
              </div>
              <div className="absolute top-44 right-1/3">
                <div className="w-4 h-4 border-2 border-pink-300 rounded-sm rotate-12 opacity-80"></div>
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2">
                <div className="w-8 h-8 bg-purple-300 rounded-full opacity-40"></div>
              </div>
              
              {/* Lower section shapes */}
              <div className="absolute bottom-20 left-10">
                <div className="w-6 h-6 bg-cyan-300 rounded rotate-45 opacity-70"></div>
              </div>
              <div className="absolute bottom-24 right-10">
                <div className="w-5 h-5 border-2 border-blue-300 rounded-full opacity-60"></div>
              </div>
              <div className="absolute bottom-16 left-1/3">
                <div className="w-7 h-7 bg-indigo-300 rounded-sm rotate-12 opacity-50"></div>
              </div>
              <div className="absolute bottom-28 right-1/4">
                <div className="w-4 h-4 bg-teal-300 rounded-full opacity-80"></div>
              </div>
              <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
                <div className="w-6 h-6 bg-green-300 rounded rotate-45 opacity-60"></div>
              </div>
              
              {/* Additional scattered elements */}
              <div className="absolute top-20 left-2/3">
                <div className="w-3 h-3 bg-rose-300 rounded-full opacity-70"></div>
              </div>
              <div className="absolute bottom-32 left-1/6">
                <div className="w-5 h-5 border-2 border-amber-300 rounded-sm rotate-45 opacity-60"></div>
              </div>
              <div className="absolute top-1/2 right-8">
                <div className="w-4 h-4 bg-violet-300 rounded-full opacity-80"></div>
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