"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"
import { StartGameButton } from "@/components/ui/send-start-buttons"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useTextToSpeech } from "@/lib/hooks/useTextToSpeech"
import { Volume2, VolumeX } from "lucide-react"

export default function Instructions() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)
  const [isTimerActive, setIsTimerActive] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [stepStartTime, setStepStartTime] = useState(Date.now())
  const [canProceed, setCanProceed] = useState(false)
  const [stepCountdown, setStepCountdown] = useState(3)
  const [comprehensionAnswer, setComprehensionAnswer] = useState("")
  const [showComprehensionError, setShowComprehensionError] = useState(false)
  const { playText, stopPlaying, isPlaying, isLoading } = useTextToSpeech();
  const [hasInitialized, setHasInitialized] = useState(false);

  const MIN_STEP_TIME = 3000 // 3 seconds minimum per step

  const instructions = [
    {
      content: (
        <div className="text-left">
          In this task, you will be presented with three words.
        </div>
      ),
      type: "text"
    },
    {
      content: (
        <div className="text-left">
          Your goal is to find a fourth word that is associated with all three words shown.
        </div>
      ),
      type: "text"
    },
    {
      content: (
        <div className="text-left">
          In other words, you will find a <strong>story</strong> for each grouping!
        </div>
      ),
      type: "text"
    },
    {
      content: (
        <>
          For example, if you see the words:<br />
          <strong>CREAM - SKATE - WATER</strong><br />
          The answer would be: <strong>ICE</strong>
        </>
      ),
      type: "example"
    },
    {
      content: (
        <div className="text-left">
          You can either submit your answer or skip to the next question.
        </div>
      ),
      type: "text"
    },
    {
      content: (
        <div className="text-left">
          You will have two minutes to answer as many questions as you can.
        </div>
      ),
      type: "text"
    },
    {
      content: (
        <div className="text-left">
          Correct answers <span className="font-bold text-green-600">earn</span> 10 points. Incorrect answers <span className="font-bold text-red-600">lose</span> 5 points. You can skip a question at no cost.
        </div>
      ),
      type: "text"
    },
    {
      content: (
        <div className="text-left">
          Incorrect answers do not change your point total.
        </div>
      ),
      type: "text"
    }
  ]

  const comprehensionQuestion = {
    question: "What will you be doing in this task?",
    options: [
      "Finding a word that connects three given words.",
      "Creating a story from a random prompt.",
      "Solving math problems.",
      "Matching words to pictures."
    ],
    correctAnswer: "Finding a word that connects three given words."
  }

  useEffect(() => {
    // Reset step timer and canProceed when step changes
    setStepStartTime(Date.now())
    setCanProceed(false)
    setShowComprehensionError(false)
    setStepCountdown(3)
    
    // Only auto-play if we're not on the initial mount
    if (hasInitialized && currentStep < instructions.length) {
      const content = instructions[currentStep].content;
      const text = extractTextFromReactNode(content);
      playText(text);
    } else {
      setHasInitialized(true);
    }
    
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

    return () => {
      clearInterval(timer)
      // Stop any playing audio when step changes
      stopPlaying()
    }
  }, [currentStep, playText, stopPlaying, hasInitialized])

  useEffect(() => {
    let timer: NodeJS.Timeout
    
    if (isTimerActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    } else if (countdown === 0) {
      setIsTimerActive(false)
    }

    return () => clearInterval(timer)
  }, [isTimerActive, countdown])

  const handleNext = () => {
    if (currentStep < instructions.length) {
      setCurrentStep(prev => prev + 1)
    } else if (currentStep === instructions.length) {
      // Check comprehension answer
      if (comprehensionAnswer === comprehensionQuestion.correctAnswer) {
        router.replace('/1/importance')
      } else {
        setShowComprehensionError(true)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const extractTextFromReactNode = (node: React.ReactNode): string => {
    if (typeof node === 'string') {
      return node;
    }
    if (typeof node === 'number') {
      return node.toString();
    }
    if (Array.isArray(node)) {
      return node.map(extractTextFromReactNode).join(' ');
    }
    if (React.isValidElement(node)) {
      // Handle br tags by adding a space
      if (node.type === 'br') {
        return ' ';
      }
      // Extract text from children
      return extractTextFromReactNode(node.props.children);
    }
    return '';
  };

  const handleTextToSpeech = () => {
    if (currentStep < instructions.length) {
      const content = instructions[currentStep].content;
      const text = extractTextFromReactNode(content);
      
      if (isPlaying) {
        stopPlaying();
      } else {
        playText(text);
      }
    }
  };

  const renderStepContent = () => {
    if (currentStep < instructions.length) {
      const content = instructions[currentStep].content;
      
      return (
        <div className="space-y-4">
          <div className={`transition-opacity duration-300 ${currentStep === 3 ? "bg-blue-50 p-4 rounded-lg" : ""}`}>
            {typeof content === "string" ? (
              <p className="text-center text-lg">
                {content}
              </p>
            ) : (
              <div className="text-center text-lg">
                {content}
              </div>
            )}
          </div>
          
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={handleTextToSpeech}
              disabled={isLoading}
              className="rounded-full hover:bg-gray-100 transition-colors h-10 w-10 p-0 flex items-center justify-center"
              aria-label={isPlaying ? "Stop audio" : "Play audio"}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : isPlaying ? (
                <VolumeX className="h-6 w-6" />
              ) : (
                <Volume2 className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <p className="text-lg font-medium text-center mb-4">
            {comprehensionQuestion.question}
          </p>
          <RadioGroup
            value={comprehensionAnswer}
            onValueChange={(value) => {
              setComprehensionAnswer(value)
              setShowComprehensionError(false)
            }}
            className="space-y-3"
          >
            {comprehensionQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="text-base">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {showComprehensionError && (
            <p className="text-red-500 text-sm text-center mt-2">
              That's not correct. Please read the instructions again and try another answer.
            </p>
          )}
        </div>
      )
    }
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f6faff 0%, #f8f6ff 100%)",
      }}
    >
      <h1
        className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-center leading-[1.1] py-4 mb-4 z-10 relative"
        style={{
          background: "linear-gradient(90deg, #4f46e5 0%, #9333ea 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Category Story
      </h1>
      <Card className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-blue-100 p-6">
        <CardHeader>
          <div className="flex flex-col items-center w-full">
            <CardTitle className="mb-4">Instructions</CardTitle>
            <div className="flex justify-center gap-2">
              {[...instructions, { type: "comprehension" }].map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    index === currentStep
                      ? "bg-blue-500"
                      : index < currentStep
                      ? "bg-blue-300"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 min-h-[200px] flex items-center justify-center">
          {renderStepContent()}
        </CardContent>
        <CardFooter className="flex justify-between">
          <StartGameButton
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`bg-white text-gray-600 hover:text-gray-900 border border-blue-100 min-w-[100px] px-6 py-2 mr-2 ${
              currentStep === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{ minWidth: 0 }}
          >
            Previous
          </StartGameButton>
          <StartGameButton
            onClick={handleNext}
            disabled={
              (countdown > 0 && currentStep === instructions.length + 1) ||
              (!canProceed && currentStep < instructions.length) ||
              (currentStep === instructions.length && !comprehensionAnswer)
            }
            className={`${
              (countdown > 0 && currentStep === instructions.length + 1) ||
              (!canProceed && currentStep < instructions.length)
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : ""
            }`}
          >
            {currentStep === instructions.length
              ? countdown > 0
                ? `You may advance in ${countdown}`
                : "Next"
              : !canProceed
              ? `Continue in ${stepCountdown}`
              : "Continue"}
          </StartGameButton>
        </CardFooter>
      </Card>
    </main>
  )
} 