"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, SkipForward, Trophy, Clock, ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { useRouter } from "next/navigation"
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

const LEADERBOARD_DATA = [
  { userName: "Caleb L", score: 540, date: "2025-04-13", trend: "up" },
  { userName: "Samantha P", score: 480, date: "2025-04-12", trend: "neutral" },
  { userName: "Taylor R", score: 465, date: "2025-04-11", trend: "down" },
  { userName: "David B", score: 450, date: "2025-04-10", trend: "up" },
  { userName: "Will S", score: 425, date: "2025-04-09", trend: "down" },
  { userName: "Landon M", score: 400, date: "2025-04-08", trend: "neutral" },
  { userName: "Anna M", score: 390, date: "2025-04-07", trend: "up" },
  { userName: "Kylie C", score: 385, date: "2025-04-06", trend: "neutral" },
  { userName: "Drew N", score: 350, date: "2025-04-05", trend: "neutral" },
  { userName: "Jeff M", score: 330, date: "2025-04-04", trend: "down" },
] as const;

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

  // Leaderboard state
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const hasIncrementedLeaderboard = useRef(false)

  // Generate choices when question changes
  useEffect(() => {
    if (questions[currentQuestionIndex]) {
      const newChoices = generateChoices(questions[currentQuestionIndex]);
      setChoices(newChoices);
      setSelectedChoice("");
      setIsFirstAttempt(true);
    }
  }, [currentQuestionIndex, questions]);

  // Track leaderboard views (only once per game session)
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasIncrementedLeaderboard.current) {
      const currentViews = parseInt(localStorage.getItem('leaderboardViews') || '0')
      localStorage.setItem('leaderboardViews', (currentViews + 1).toString())
      
      const userId = localStorage.getItem('ratGameUserId')
      if (userId) {
        fetch(`/api/users/${userId}/leaderboard-view`, {
          method: 'POST',
        }).catch(error => {
          console.error('Failed to increment leaderboard views:', error)
        })
      }

      hasIncrementedLeaderboard.current = true
    }
  }, [])

  // Initialize leaderboard timer
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLastUpdate = localStorage.getItem('leaderboardLastUpdate')
      if (storedLastUpdate) {
        setLastUpdate(storedLastUpdate)
      } else {
        const now = new Date().toISOString()
        localStorage.setItem('leaderboardLastUpdate', now)
        setLastUpdate(now)
      }
    }
  }, [])

  // Update current time every minute for leaderboard
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

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
    if (!selectedChoice) return;
    
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
        localStorage.setItem('currentScore', newScore.toString());
        sessionStorage.setItem('shouldCreateNewPlay', 'true');
        router.replace('/2/postgame');
      }
    }, 1000);
  };

  const handleEndGame = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentScore', score.toString());
      sessionStorage.setItem('shouldCreateNewPlay', 'true');
    }
    router.replace('/2/postgame');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTimeSinceUpdate = () => {
    if (!lastUpdate) {
      return "just now"
    }

    const lastUpdateDate = new Date(lastUpdate)
    const diffMinutes = Math.floor((currentTime.getTime() - lastUpdateDate.getTime()) / 60000)
    
    if (diffMinutes < 1) return "just now"
    if (diffMinutes === 1) return "1 min ago"
    if (diffMinutes < 60) return `${diffMinutes} mins ago`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours === 1) return "1 hour ago"
    return `${diffHours} hours ago`
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />
      case 'down':
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />
      default:
        return <span className="text-gray-400 text-sm">—</span>
    }
  }

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return "bg-yellow-100 text-yellow-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-yellow-200"
      case 1:
        return "bg-gray-100 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-gray-200"
      case 2:
        return "bg-amber-100 text-amber-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border border-amber-200"
      default:
        return "w-6 text-center text-xs"
    }
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
                      onClick={() => setSelectedChoice(choice)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                        selectedChoice === choice
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
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
                  disabled={!selectedChoice}
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

        {/* Leaderboard Section - Right Side */}
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2
            className="text-2xl sm:text-3xl font-semibold tracking-tight text-center leading-[1.1] py-4 mb-4 z-10 relative flex items-center gap-2"
            style={{
              background: "linear-gradient(90deg, #4f46e5 0%, #9333ea 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Live Leaderboard
          </h2>
          <Card className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-blue-100 p-4">
            <CardHeader className="pb-4">
              <CardTitle className="text-center flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="text-lg">Top Players</span>
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last updated: {getTimeSinceUpdate()}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <div className="w-full">
                <div className="grid grid-cols-4 gap-2 px-3 py-2 text-xs text-gray-500 border-b">
                  <div>Rank</div>
                  <div>Player</div>
                  <div className="text-right">Score</div>
                  <div className="text-center">Trend</div>
                </div>
                {LEADERBOARD_DATA.slice(0, 8).map((entry, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-4 gap-2 px-3 py-2 border-b text-sm"
                  >
                    <div className="flex items-center">
                      <div className={getRankStyle(index)}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="font-medium text-xs truncate">{entry.userName}</div>
                    <div className="text-right font-bold text-xs">{entry.score}</div>
                    <div className="flex justify-center">{getTrendIcon(entry.trend)}</div>
                  </div>
                ))}
              </div>
              <p className="text-center text-gray-500 mt-3 text-xs">
                Rankings updated hourly based on player performance
              </p>
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