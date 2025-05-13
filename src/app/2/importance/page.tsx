"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"
import { StartGameButton } from "@/components/ui/send-start-buttons"
import { useTextToSpeech } from "@/lib/hooks/useTextToSpeech"
import { Volume2, VolumeX } from "lucide-react"

export default function Importance() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)
  const [isTimerActive, setIsTimerActive] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [stepStartTime, setStepStartTime] = useState(Date.now())
  const [canProceed, setCanProceed] = useState(false)
  const [stepCountdown, setStepCountdown] = useState(3)
  const [hasInitialized, setHasInitialized] = useState(false)
  const { playText, stopPlaying, isPlaying, isLoading } = useTextToSpeech();

  const MIN_STEP_TIME = 3000 // 3 seconds minimum per step

  const importanceSteps = [
    {
      content: (
        <div className="text-left">
          The task you'll be performing measures mental sharpness and the ability to create connections across concepts.
        </div>
      ),
      type: "text"
    },
    {
      content: (
        <div className="text-left">
          These are basic elements of <span className="font-bold">intelligence</span> and <span className="font-bold">creativity.</span>
        </div>
      ),
      type: "text"
    },
    {
      content: (
        <div className="text-left">
          Performance on this task has been shown to predict a number of important outcomes, including <span className="font-bold">career success</span>, <span className="font-bold">salary</span>, and even people's ability to form <span className="font-bold">satisfying relationships.</span>
        </div>
      ),
      type: "text"
    },
    {
      content: (
        <div className="text-left">
          Therefore, it is important that you try your best to solve the questions.
        </div>
      ),
      type: "text"
    },
    {
      content: (
        <div className="text-left">
          Your participation will help us better understand how different forms of intelligence and creativity contribute to <span className="font-bold">positive life outcomes.</span>
        </div>
      ),
      type: "text"
    },
    {
      content: (
        <div className="text-left">
          After you complete the task, you will chat with your group again. You will discuss <span className="font-bold underline">your performance on the task</span>.
        </div>
      ),
      type: "text"
    }
  ]

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
      if (node.type === 'br') {
        return ' ';
      }
      return extractTextFromReactNode(node.props.children);
    }
    return '';
  };

  const handleTextToSpeech = () => {
    if (currentStep < importanceSteps.length) {
      const content = importanceSteps[currentStep].content;
      const text = extractTextFromReactNode(content);
      
      if (isPlaying) {
        stopPlaying();
      } else {
        playText(text);
      }
    }
  };

  useEffect(() => {
    // Reset step timer and canProceed when step changes
    setStepStartTime(Date.now())
    setCanProceed(false)
    setStepCountdown(3)
    
    // Only auto-play if we're not on the initial mount
    if (hasInitialized && currentStep < importanceSteps.length) {
      const content = importanceSteps[currentStep].content;
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
    if (currentStep < importanceSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      router.replace('/2/score')
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const renderStepContent = () => {
    if (currentStep >= importanceSteps.length) {
      return null;
    }
    const content = importanceSteps[currentStep].content;
    
    return (
      <div className="space-y-4">
        <div className="transition-opacity duration-300">
          <p className="text-center text-lg">
            {typeof content === "string" ? content : content}
          </p>
        </div>
        
        {/* Audio control button */}
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
    )
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
            <CardTitle className="mb-4">Why This Matters</CardTitle>
            <div className="flex justify-center gap-2">
              {importanceSteps.map((_, index) => (
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
              (countdown > 0 && currentStep === importanceSteps.length) ||
              (!canProceed && currentStep < importanceSteps.length)
            }
            className={`${
              (countdown > 0 && currentStep === importanceSteps.length) ||
              (!canProceed && currentStep < importanceSteps.length)
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : ""
            }`}
          >
            {currentStep === importanceSteps.length
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