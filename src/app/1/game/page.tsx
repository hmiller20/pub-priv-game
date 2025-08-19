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
  },
  {
    words: ["CARD", "CHEST", "KING"],
    answer: "HEART",
    distractors: ["CLUB", "CROWN", "ACE"]
  },
  {
    words: ["CANDLE", "BIRTHDAY", "WISH"],
    answer: "CAKE",
    distractors: ["LIGHT", "PARTY", "FIRE"]
  },
  {
    words: ["BANK", "POOL", "CURRENT"],
    answer: "RIVER",
    distractors: ["MONEY", "WATER", "FLOW"]
  },
  {
    words: ["COLD", "SWEAT", "FEVER"],
    answer: "NIGHT",
    distractors: ["ILLNESS", "DREAM", "HEAT"]
  },
  {
    words: ["LIGHT", "STORM", "EYE"],
    answer: "HURRICANE",
    distractors: ["RAIN", "SKY", "WIND"]
  },
  {
    words: ["APPLE", "WORM", "TREE"],
    answer: "FRUIT",
    distractors: ["ORCHARD", "EAT", "SEED"]
  },
  {
    words: ["FLOOR", "TABLE", "TEN"],
    answer: "TOP",
    distractors: ["BOTTOM", "HIGH", "ROOM"]
  },
  {
    words: ["DOG", "CHAIN", "WATCH"],
    answer: "GUARD",
    distractors: ["TIME", "PET", "METAL"]
  },
  {
    words: ["BOOK", "WORM", "SHELF"],
    answer: "READ",
    distractors: ["PAGE", "LIBRARY", "GLASS"]
  },
  {
    words: ["GROUND", "SHOT", "BREAK"],
    answer: "UP",
    distractors: ["DOWN", "EARTH", "FIRE"]
  },
  {
    words: ["TEA", "ICE", "CUBE"],
    answer: "GLASS",
    distractors: ["COLD", "DRINK", "LEMON"]
  },
  {
    words: ["GUN", "FINGER", "PRINT"],
    answer: "TRIGGER",
    distractors: ["BULLET", "HAND", "MARK"]
  },
  {
    words: ["WINDOW", "PANE", "FRAME"],
    answer: "GLASS",
    distractors: ["DOOR", "WOOD", "HOUSE"]
  },
  {
    words: ["BOX", "PUNCH", "GLOVE"],
    answer: "BOXING",
    distractors: ["RING", "FIGHT", "SPORT"]
  },
  {
    words: ["SHEET", "PILLOW", "BLANKET"],
    answer: "BED",
    distractors: ["TRAY", "THROW", "ROOM"]
  },
  {
    words: ["HAND", "CLOCK", "SECOND"],
    answer: "MINUTE",
    distractors: ["HOUR", "WATCH", "TIME"]
  },
  {
    words: ["SCREEN", "PLAY", "STAGE"],
    answer: "ACTOR",
    distractors: ["FILM", "GLASS", "RELEASE"]
  },
  {
    words: ["SILVER", "AGE", "SCREEN"],
    answer: "HOLLYWOOD",
    distractors: ["MOVIE", "OLD", "SHINE"]
  },
  {
    words: ["CARD", "HOUSE", "JOKER"],
    answer: "DECK",
    distractors: ["KING", "GAME", "TRICK"]
  },
  {
    words: ["HONEY", "STING", "BUZZ"],
    answer: "BEE",
    distractors: ["SYRUP", "SWEET", "INSECT"]
  },
  {
    words: ["WEB", "EIGHT", "SPIN"],
    answer: "SPIDER",
    distractors: ["NET", "BUG", "TRAP"]
  },
  {
    words: ["DESERT", "WATER", "CAMEL"],
    answer: "OASIS",
    distractors: ["DRY", "SAND", "TRAVEL"]
  },
  {
    words: ["MAIL", "OFFICE", "BLOG"],
    answer: "POST",
    distractors: ["STAMP", "SEND", "SIGN"]
  },
  {
    words: ["FLOOR", "CLEAN", "BROOM"],
    answer: "SWEEP",
    distractors: ["DIRT", "WIPE", "ROOM"]
  },
  {
    words: ["RIVER", "TWITCH", "BROOK"],
    answer: "STREAM",
    distractors: ["FLOW", "WATER", "BANK"]
  },
  {
    words: ["MAN", "GLUE", "STAR"],
    answer: "SUPER",
    distractors: ["LIGHT", "HERO", "STICKY"]
  },
  {
    words: ["TOOTH", "POTATO", "HEART"],
    answer: "SWEET",
    distractors: ["FRY", "LOVE", "ACHE"]
  },
  {
    words: ["ILLNESS", "BUS", "COMPUTER"],
    answer: "TERMINAL",
    distractors: ["STOP", "SICK", "KEYBOARD"]
  },
  {
    words: ["TYPE", "GHOST", "SCREEN"],
    answer: "WRITER",
    distractors: ["MOVIE", "HAUNT", "TEXT"]
  },
  {
    words: ["MAIL", "BOARD", "LUNG"],
    answer: "BLACK",
    distractors: ["POST", "AIR", "GAME"]
  },
  {
    words: ["TEETH", "ARREST", "START"],
    answer: "FALSE",
    distractors: ["BEGIN", "JAIL", "BITE"]
  },
  {
    words: ["IRON", "SHOVEL", "ENGINE"],
    answer: "STEAM",
    distractors: ["MOTOR", "METAL", "DIG"]
  },
  {
    words: ["WET", "LAW", "BUSINESS"],
    answer: "SUIT",
    distractors: ["COMPANY", "COURT", "RAIN"]
  },
  {
    words: ["ROPE", "TRUCK", "LINE"],
    answer: "TOW",
    distractors: ["LOAD", "KNOT", "QUEUE"]
  },
  {
    words: ["OFF", "MILITARY", "FIRST"],
    answer: "BASE",
    distractors: ["AID", "SWITCH", "SOLDIER"]
  },
  {
    words: ["SPOON", "CLOTH", "CARD"],
    answer: "TABLE",
    distractors: ["FABRIC", "UTENSIL", "DECK"]
  },
  {
    words: ["CUT", "CREAM", "WAR"],
    answer: "COLD",
    distractors: ["SLICE", "BATTLE", "LOTION"]
  },
  {
    words: ["NOTE", "CHAIN", "MASTER"],
    answer: "KEY",
    distractors: ["LINK", "SONG", "BOSS"]
  },
  {
    words: ["SHOCK", "SHAVE", "TASTE"],
    answer: "AFTER",
    distractors: ["SURPRISE", "FLAVOR", "RAZOR"]
  },
  {
    words: ["WISE", "WORK", "TOWER"],
    answer: "CLOCK",
    distractors: ["OWL", "OFFICE", "CASTLE"]
  },
  {
    words: ["GRASS", "KING", "MEAT"],
    answer: "CRAB",
    distractors: ["FIELD", "BEEF", "CROWN"]
  },
  {
    words: ["BABY", "SPRING", "CAP"],
    answer: "SHOWER",
    distractors: ["INFANT", "HAT", "SEASON"]
  },
  {
    words: ["BREAK", "BEAN", "CAKE"],
    answer: "COFFEE",
    distractors: ["SNACK", "PLANT", "DESSERT"]
  },
  {
    words: ["CRY", "FRONT", "SHIP"],
    answer: "BATTLE",
    distractors: ["TEAR", "WAR", "BOW"]
  },
  {
    words: ["HOLD", "PRINT", "STOOL"],
    answer: "FOOT",
    distractors: ["HAND", "BOOK", "CHAIR"]
  },
  {
    words: ["ROLL", "BEAN", "FISH"],
    answer: "JELLY",
    distractors: ["SUSHI", "LEGUME", "SALMON"]
  },
  {
    words: ["HORSE", "HUMAN", "DRAG"],
    answer: "RACE",
    distractors: ["RIDER", "BODY", "PULL"]
  },
  {
    words: ["OIL", "BAR", "TUNA"],
    answer: "SALAD",
    distractors: ["PETROL", "ALCOHOL", "FISH"]
  },
  {
    words: ["BOTTOM", "CURVE", "HOP"],
    answer: "BELL",
    distractors: ["BASE", "JUMP", "ARC"]
  },
  {
    words: ["TOMATO", "BOMB", "PICKER"],
    answer: "CHERRY",
    distractors: ["FRUIT", "EXPLOSION", "WORKER"]
  },
  {
    words: ["PEA", "SHELL", "CHEST"],
    answer: "NUT",
    distractors: ["LEGUME", "ARMOR", "OYSTER"]
  },
  {
    words: ["LINE", "FRUIT", "DRUNK"],
    answer: "PUNCH",
    distractors: ["QUEUE", "APPLE", "ALCOHOL"]
  },
  {
    words: ["BUMP", "EGG", "STEP"],
    answer: "GOOSE",
    distractors: ["LUMP", "HATCH", "STAIR"]
  },
  {
    words: ["FIGHT", "CONTROL", "MACHINE"],
    answer: "GUN",
    distractors: ["BRAWL", "REMOTE", "ENGINE"]
  },
  {
    words: ["HOME", "ARM", "ROOM"],
    answer: "REST",
    distractors: ["HOUSE", "LIMB", "SPACE"]
  },
  {
    words: ["CHILD", "SCAN", "WASH"],
    answer: "BRAIN",
    distractors: ["KID", "MRI", "SOAP"]
  },
  {
    words: ["NOSE", "STONE", "BEAR"],
    answer: "BROWN",
    distractors: ["SCENT", "ROCK", "ANIMAL"]
  },
  {
    words: ["END", "LINE", "LOCK"],
    answer: "DEAD",
    distractors: ["FINISH", "QUEUE", "KEY"]
  },
  {
    words: ["CONTROL", "PLACE", "RATE"],
    answer: "BIRTH",
    distractors: ["MANAGE", "SPOT", "SCORE"]
  },
  {
    words: ["LOUNGE", "HOUR", "NAPKIN"],
    answer: "COCKTAIL",
    distractors: ["WAIT", "TIME", "CLOTH"]
  },
  {
    words: ["ARTIST", "HATCH", "ROUTE"],
    answer: "ESCAPE",
    distractors: ["PAINTER", "EGG", "ROAD"]
  },
  {
    words: ["PET", "BOTTOM", "GARDEN"],
    answer: "ROCK",
    distractors: ["DOG", "BASE", "FLOWER"]
  },
  {
    words: ["MATE", "SHOES", "TOTAL"],
    answer: "RUNNING",
    distractors: ["FRIEND", "SNEAKERS", "SUM"]
  },
  {
    words: ["SELF", "ATTORNEY", "SPENDING"],
    answer: "DEFENSE",
    distractors: ["EGO", "LAWYER", "COST"]
  },
  {
    words: ["BOARD", "BLADE", "BACK"],
    answer: "SWITCH",
    distractors: ["WOOD", "KNIFE", "SPINE"]
  },
  {
    words: ["LAND", "HAND", "HOUSE"],
    answer: "FARM",
    distractors: ["EARTH", "PALM", "HOME"]
  },
  {
    words: ["HUNGRY", "ORDER", "BELT"],
    answer: "MONEY",
    distractors: ["STARVING", "MEAL", "WAIST"]
  },
  {
    words: ["FORWARD", "FLUSH", "RAZOR"],
    answer: "STRAIGHT",
    distractors: ["AHEAD", "TOILET", "BLADE"]
  },
  {
    words: ["SHADOW", "CHART", "DROP"],
    answer: "EYE",
    distractors: ["DARK", "GRAPH", "FALL"]
  },
  {
    words: ["WAY", "GROUND", "WEATHER"],
    answer: "FAIR",
    distractors: ["PATH", "DIRT", "RAIN"]
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
  const [questionsAnswered, setQuestionsAnswered] = useState(0)
  
  const [questions] = useState(() => shuffleArray(RAT_QUESTIONS))
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState("")
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [feedback, setFeedback] = useState<null | "correct" | "incorrect">(null)
  const [isFirstAttempt, setIsFirstAttempt] = useState(true)
  const [choices, setChoices] = useState<string[]>([])
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false)
  const [gameInitialized, setGameInitialized] = useState(false)

  // Restore game state on load
  useEffect(() => {
    if (typeof window !== 'undefined' && !gameInitialized) {
      const savedScore = localStorage.getItem('game1_currentScore')
      const savedTimeLeft = localStorage.getItem('game1_timeLeft')
      const savedQuestionIndex = localStorage.getItem('game1_currentQuestionIndex')
      const savedQuestionsAnswered = localStorage.getItem('game1_questionsAnswered')
      const savedSkips = localStorage.getItem('game1_skips')
      const savedStartTime = localStorage.getItem('currentGameStartTime')
      
      if (savedScore !== null) setScore(parseInt(savedScore))
      if (savedTimeLeft !== null) setTimeLeft(parseInt(savedTimeLeft))
      if (savedQuestionIndex !== null) setCurrentQuestionIndex(parseInt(savedQuestionIndex))
      if (savedQuestionsAnswered !== null) setQuestionsAnswered(parseInt(savedQuestionsAnswered))
      if (savedSkips !== null) setSkips(parseInt(savedSkips))
      
      // Initialize start time if not exists
      if (!savedStartTime) {
        localStorage.setItem('currentGameStartTime', Date.now().toString())
      }
      
      setGameInitialized(true)
    }
  }, [gameInitialized])

  // Save game state whenever it changes
  useEffect(() => {
    if (gameInitialized && typeof window !== 'undefined') {
      localStorage.setItem('game1_currentScore', score.toString())
      localStorage.setItem('game1_timeLeft', timeLeft.toString())
      localStorage.setItem('game1_currentQuestionIndex', currentQuestionIndex.toString())
      localStorage.setItem('game1_questionsAnswered', questionsAnswered.toString())
      localStorage.setItem('game1_skips', skips.toString())
    }
  }, [gameInitialized, score, timeLeft, currentQuestionIndex, questionsAnswered, skips])

  // Helper function to calculate and store game duration
  const calculateAndStoreDuration = () => {
    if (typeof window === 'undefined') return 0
    
    const startTime = localStorage.getItem('currentGameStartTime')
    if (!startTime) return 0
    
    const duration = Math.floor((Date.now() - parseInt(startTime)) / 1000) // Duration in seconds
    localStorage.setItem('currentGameDuration', duration.toString())
    return duration
  }

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
        calculateAndStoreDuration(); // Track duration when skipping to end
        localStorage.setItem('currentScore', score.toString());
        localStorage.setItem('currentGameQuestionsAnswered', questionsAnswered.toString());
        sessionStorage.setItem('shouldCreateNewPlay', 'true');
        
        // Clean up game state
        localStorage.removeItem('game1_currentScore')
        localStorage.removeItem('game1_timeLeft')
        localStorage.removeItem('game1_currentQuestionIndex')
        localStorage.removeItem('game1_questionsAnswered')
        localStorage.removeItem('game1_skips')
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
            calculateAndStoreDuration(); // Track duration when timer ends
            localStorage.setItem('currentScore', score.toString());
            localStorage.setItem('currentGameQuestionsAnswered', questionsAnswered.toString());
            sessionStorage.setItem('shouldCreateNewPlay', 'true');
            
            // Clean up game state
            localStorage.removeItem('game1_currentScore')
            localStorage.removeItem('game1_timeLeft')
            localStorage.removeItem('game1_currentQuestionIndex')
            localStorage.removeItem('game1_questionsAnswered')
            localStorage.removeItem('game1_skips')
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
    
    // Increment questions answered count
    const newQuestionsAnswered = questionsAnswered + 1;
    setQuestionsAnswered(newQuestionsAnswered);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentGameQuestionsAnswered', newQuestionsAnswered.toString());
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedChoice === currentQuestion.answer;
    
    let newScore;
    if (isCorrect) {
      const pointsToAdd = isFirstAttempt ? 10 : 5; // 10 points for first try, 5 for subsequent
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
          calculateAndStoreDuration(); // Track duration when all questions completed
          localStorage.setItem('currentScore', newScore.toString());
          localStorage.setItem('currentGameQuestionsAnswered', newQuestionsAnswered.toString());
          sessionStorage.setItem('shouldCreateNewPlay', 'true');
          
          // Clean up game state
          localStorage.removeItem('game1_currentScore')
          localStorage.removeItem('game1_timeLeft')
          localStorage.removeItem('game1_currentQuestionIndex')
          localStorage.removeItem('game1_questionsAnswered')
          localStorage.removeItem('game1_skips')
        }
        router.replace('/1/postgame');
      }
    }, 1000);
  };

  const handleEndGame = () => {
    if (typeof window !== 'undefined') {
      calculateAndStoreDuration(); // Track duration when manually ending game
      localStorage.setItem('currentScore', score.toString());
      localStorage.setItem('currentGameQuestionsAnswered', questionsAnswered.toString());
      sessionStorage.setItem('shouldCreateNewPlay', 'true');
      
      // Clean up game state
      localStorage.removeItem('game1_currentScore')
      localStorage.removeItem('game1_timeLeft')
      localStorage.removeItem('game1_currentQuestionIndex')
      localStorage.removeItem('game1_questionsAnswered')
      localStorage.removeItem('game1_skips')
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
      <div className="container mx-auto flex flex-col items-center">
        {/* Centered Header */}
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-center leading-[1.1] py-4 mb-6 z-10 relative"
          style={{
            background: "linear-gradient(90deg, #4f46e5 0%, #9333ea 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Category Story
        </h1>
        
        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start w-full max-w-6xl">
          {/* Game Section - Left Side */}
          <div className="flex flex-col items-center justify-center">
          <Card className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-blue-100 p-6 h-[600px]" style={{width: '576px'}}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="relative flex items-center justify-center">
                  <svg
                    className="w-20 h-20 transform -rotate-90"
                    viewBox="0 0 80 80"
                  >
                    {/* Background circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="5"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      fill="none"
                      stroke={
                        timeLeft <= 30 ? "#dc2626" : 
                        timeLeft <= 60 ? "#ef4444" : 
                        timeLeft <= 120 ? "#f59e0b" : 
                        "#3b82f6"
                      }
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 35}`}
                      strokeDashoffset={`${2 * Math.PI * 35 * (1 - timeLeft / GAME_DURATION)}`}
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  {/* Timer text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span 
                      className={`text-base font-bold transition-colors duration-300 ${
                        timeLeft <= 30 ? "text-red-700" : 
                        timeLeft <= 60 ? "text-red-600" : 
                        timeLeft <= 120 ? "text-orange-600" : 
                        "text-blue-600"
                      }`}
                    >
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
                {feedback && (
                  <div className="flex items-center space-x-2">
                    {feedback === "correct" ? (
                      <>
                        <CheckCircle2 className="text-green-500 h-6 w-6" />
                        <span className="text-green-500 font-bold text-xl">+{isFirstAttempt ? 10 : 5} pts</span>
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

              {/* Skip and Submit Answer buttons aligned with answer options */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-start">
                  <StartGameButton
                    onClick={handleSkip}
                    className="bg-white text-gray-600 hover:text-gray-900 border border-gray-300 px-6 py-2 w-full ml-1"
                  >
                    Skip
                  </StartGameButton>
                </div>
                <SendButton 
                  onClick={handleSubmit}
                  disabled={!selectedChoice || isProcessingAnswer}
                  className="bg-black text-white hover:bg-gray-800 w-full"
                >
                  Submit Answer
                </SendButton>
              </div>
              
              {/* End Game and Advance Button - Bottom Right */}
              <div className="flex justify-end mt-3">
                <StartGameButton
                  onClick={handleEndGame}
                  className="bg-white text-purple-600 hover:bg-purple-50 border border-purple-300 px-6 py-2"
                >
                  End Game and Advance
                </StartGameButton>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Word Trivia Panel - Right Side */}
          <div className="flex flex-col items-center justify-center">
          <Card className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-blue-100 p-6 h-[600px]" style={{width: '576px'}}>
            <CardHeader className="pb-2">
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <span className="text-lg font-bold text-black-600">📚 Word Trivia 📚</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 space-y-4 overflow-y-auto">
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                  <p className="text-sm text-gray-700">The word 'bookkeeper' has three consecutive double letters.</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                  <p className="text-sm text-gray-700">The word "dreamt" is the only English word that ends in -mt.</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                  <p className="text-sm text-gray-700">No English word rhymes perfectly with "month."</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                  <p className="text-sm text-gray-700">The dot over an "i" or "j" is called a tittle.</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                  <p className="text-sm text-gray-700">The word "set" has over 400 different meanings in English.</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                  <p className="text-sm text-gray-700">The word "alphabet" comes from the first two Greek letters: alpha and beta.</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                  <p className="text-sm text-gray-700">The plural of "octopus" can be octopuses or octopi.</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                  <p className="text-sm text-gray-700">The longest English word without a vowel is "rhythms."</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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