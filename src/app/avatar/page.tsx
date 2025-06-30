"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import FloatingBubbles from "../floating-bubbles"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { StartGameButton } from "@/components/ui/send-start-buttons"
import { Checkbox } from "@/components/ui/checkbox"
import { useTextToSpeech } from "@/lib/hooks/useTextToSpeech"
import { Volume2, VolumeX } from "lucide-react"

// Add type for avatar configuration
type AvatarConfig = {
  seed: string;
  body: string;
  clothingColor: string;
  eyes: string;
  facialHair: string;
  hair: string;
  hairColor: string;
  mouth: string;
  nose: string;
  skinColor: string;
}

const generateInitialAvatar = (): AvatarConfig => {
  const parameters = {
    eyes: ['glasses', 'happy', 'open', 'sleep', 'sunglasses', 'wink'],
    facialHair: ['beardMustache', 'goatee', 'pyramid', 'shadow', 'soulPatch', 'walrus'],
    hair: [
      'bald', 'balding', 'beanie', 'bobBangs', 'bobCut', 'bunUndercut', 'buzzcut',
      'cap', 'curly', 'curlyBun', 'curlyHighTop', 'fade', 'long',
      'mohawk', 'pigtails', 'shortCombover', 'shortComboverChops', 'sideShave', 'straightBun'
    ],
    hairColor: ['6c4545', '362c47', 'dee1f5', 'e15c66', 'e16381', 'f27d65', 'f29c65'],
    mouth: ['bigSmile', 'lips', 'smile', 'smirk', 'surprise'],
    skinColor: ['623d36', '92594b', 'b16a5b', 'd78774', 'e5a07e', 'e7a391', 'eeb4a4']
  };

  return {
    seed: 'CustomAvatar',
    body: 'rounded',
    clothingColor: '456dff',
    eyes: parameters.eyes[Math.floor(Math.random() * parameters.eyes.length)],
    facialHair: parameters.facialHair[Math.floor(Math.random() * parameters.facialHair.length)],
    hair: parameters.hair[Math.floor(Math.random() * parameters.hair.length)],
    hairColor: parameters.hairColor[Math.floor(Math.random() * parameters.hairColor.length)],
    mouth: parameters.mouth[Math.floor(Math.random() * parameters.mouth.length)],
    nose: 'mediumRound',
    skinColor: parameters.skinColor[Math.floor(Math.random() * parameters.skinColor.length)]
  };
};

export default function AvatarPage() {
  const router = useRouter()
  const [showWelcomeModal, setShowWelcomeModal] = useState(true)
  const [countdown, setCountdown] = useState(10)
  const [isTimerActive, setIsTimerActive] = useState(true)
  const [firstName, setFirstName] = useLocalStorage('currentFirstName', '')
  const [lastInitial, setLastInitial] = useLocalStorage('currentLastInitial', '')
  const [avatarUrl, setAvatarUrl] = useLocalStorage('currentAvatarUrl', '')
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [canProceed, setCanProceed] = useState(false)
  const [stepCountdown, setStepCountdown] = useState(3)
  const totalSteps = 3
  const [agreementChecked, setAgreementChecked] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const { playText, stopPlaying, isPlaying, isLoading } = useTextToSpeech();

  const modalSteps = [
    "Welcome! You're about to participate in an interactive study where you'll play a game with other participants.",
    "First, you'll create a unique avatar that will represent you throughout the study.",
    "After creating your avatar, you'll enter a waiting room where you'll be matched with other participants."
  ];

  useEffect(() => {
    const config = generateInitialAvatar()
    setAvatarConfig(config)
  }, [])

  useEffect(() => {
    if (!avatarConfig) return
    const url = `https://api.dicebear.com/7.x/personas/svg?seed=${avatarConfig.seed}&body=${avatarConfig.body}&clothingColor=${avatarConfig.clothingColor}&eyes=${avatarConfig.eyes}&facialHair=${avatarConfig.facialHair}&hair=${avatarConfig.hair}&hairColor=${avatarConfig.hairColor}&mouth=${avatarConfig.mouth}&nose=${avatarConfig.nose}&skinColor=${avatarConfig.skinColor}`
    console.log('Generated Avatar URL:', url)
    setAvatarUrl(url)
  }, [avatarConfig, setAvatarUrl])

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

  useEffect(() => {
    // Auto-play the current step's text when it changes
    if (hasInitialized && currentStep <= modalSteps.length) {
      playText(modalSteps[currentStep - 1]);
    } else {
      setHasInitialized(true);
    }

    return () => {
      stopPlaying();
    }
  }, [currentStep, playText, stopPlaying, hasInitialized]);

  const handleCloseModal = () => {
    if (countdown === 0 && canProceed) {
      setShowWelcomeModal(false)
    }
  }

  if (!avatarConfig) return null

  const handleUpdateAvatar = (updates: Partial<AvatarConfig>) => {
    setAvatarConfig(prev => prev ? { ...prev, ...updates } : null)
  }

  const handleContinue = () => {
    if (!firstName.trim() || !lastInitial.trim()) {
      alert("Please enter both your first name and last initial")
      return
    }
    router.replace('/queue')
  }

  const handleTextToSpeech = () => {
    if (currentStep <= modalSteps.length) {
      if (isPlaying) {
        stopPlaying();
      } else {
        playText(modalSteps[currentStep - 1]);
      }
    }
  };

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

      <Dialog
        open={showWelcomeModal}
        onOpenChange={() => { /* Prevent closing via outside click or Escape */ }}
        modal={true}
      >
        <DialogContent className="sm:max-w-md [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-center">Welcome!</DialogTitle>
            <div className="flex justify-center gap-2 mt-4 mb-6">
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
              {currentStep === 1 && (
                <div className="space-y-3">
                  <div className="space-y-4">
                    <p className="text-left">{modalSteps[0]}</p>
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
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-3">
                  <div className="space-y-4">
                    <p className="text-left">{modalSteps[1]}</p>
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
                </div>
              )}
              {currentStep === 3 && (
                <div className="space-y-3">
                  <div className="space-y-4">
                    <p className="text-left">{modalSteps[2]}</p>
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
                  <div className="mt-8">
                    <Checkbox
                      id="respect-agreement"
                      checked={agreementChecked}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgreementChecked(e.target.checked)}
                      className="mt-4 text-left"
                      label={<i>I understand that showing respect for other participants is essential. By advancing, I agree to treat all participants with kindness and consideration during chat sessions.</i>}
                    />
                  </div>
                </div>
              )}
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
                onClick={handleCloseModal}
                disabled={countdown > 0 || !canProceed || !agreementChecked}
                className={`absolute right-0 bottom-0 ml-auto m-2 min-w-[100px] px-6 py-2 shadow-sm rounded-xl transition-all duration-200 ${
                  (countdown > 0 || !canProceed || !agreementChecked) ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-white text-blue-600 hover:text-blue-800 border border-blue-100"
                }`}
              >
                {countdown > 0 ? `You may continue in ${countdown}` : "Get Started"}
              </StartGameButton>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <h1
        className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-center leading-[1.1] py-4 mb-4 z-10 relative"
        style={{
          background: "linear-gradient(90deg, #4f46e5 0%, #9333ea 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Create Your Avatar
      </h1>
      <Card className="w-full max-w-4xl bg-white flex flex-col justify-between min-h-[350px] relative rounded-3xl shadow-2xl border border-blue-100 p-4 md:p-8 z-10">
        <CardHeader>
          <CardTitle className="italic text-center text-xl text-blue-800">Build an avatar that feels like you!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pb-2">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left side: Avatar preview and text fields */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-48 h-48 md:w-64 md:h-64 mb-4">
                <Avatar className="w-full h-full">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/personas/svg?seed=${avatarConfig.seed}&body=${avatarConfig.body}&clothingColor=${avatarConfig.clothingColor}&eyes=${avatarConfig.eyes}&facialHair=${avatarConfig.facialHair}&hair=${avatarConfig.hair}&hairColor=${avatarConfig.hairColor}&mouth=${avatarConfig.mouth}&nose=${avatarConfig.nose}&skinColor=${avatarConfig.skinColor}`}
                  />
                  <AvatarFallback>AV</AvatarFallback>
                </Avatar>
              </div>
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Enter Your First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-xl border-blue-100 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-2 pb-2">
                  <Label htmlFor="lastInitial">Enter Your Last Initial</Label>
                  <Input
                    id="lastInitial"
                    type="text"
                    placeholder="Your last initial"
                    value={lastInitial}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 1).toUpperCase()
                      setLastInitial(value)
                    }}
                    maxLength={1}
                    className="w-full rounded-xl border-blue-100 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>

            {/* Right side: Customization options and Continue button */}
            <div className="flex-1 flex flex-col justify-between">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Eyes</Label>
                  <Select
                    value={avatarConfig.eyes}
                    onValueChange={(value: string) => handleUpdateAvatar({ eyes: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select eye style" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {['glasses', 'happy', 'open', 'sleep', 'sunglasses', 'wink'].map((style) => (
                        <SelectItem key={style} value={style}>
                          {style.charAt(0).toUpperCase() + style.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Hair Style</Label>
                  <Select
                    value={avatarConfig.hair}
                    onValueChange={(value: string) => handleUpdateAvatar({ hair: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select hair style" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {[
                        'bald', 'balding', 'beanie', 'bobBangs', 'bobCut', 'bunUndercut', 'buzzcut',
                        'cap', 'curly', 'curlyBun', 'curlyHighTop', 'fade', 'long',
                        'mohawk', 'pigtails', 'shortCombover', 'shortComboverChops', 'sideShave', 'straightBun'
                      ].map((style) => (
                        <SelectItem key={style} value={style}>
                          {style.replace(/([A-Z])/g, ' $1').trim()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Hair Color</Label>
                  <Select
                    value={avatarConfig.hairColor}
                    onValueChange={(value: string) => handleUpdateAvatar({ hairColor: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select hair color" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {['6c4545', '362c47', 'dee1f5', 'e15c66', 'e16381', 'f27d65', 'f29c65'].map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: `#${color}` }}
                            />
                            {color}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Mouth</Label>
                  <Select
                    value={avatarConfig.mouth}
                    onValueChange={(value: string) => handleUpdateAvatar({ mouth: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mouth style" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {['bigSmile', 'lips', 'smile', 'smirk', 'surprise'].map((style) => (
                        <SelectItem key={style} value={style}>
                          {style.replace(/([A-Z])/g, ' $1').trim()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Skin Color</Label>
                  <Select
                    value={avatarConfig.skinColor}
                    onValueChange={(value: string) => handleUpdateAvatar({ skinColor: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select skin color" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {['623d36', '92594b', 'b16a5b', 'd78774', 'e5a07e', 'e7a391', 'eeb4a4'].map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: `#${color}` }}
                            />
                            {color}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="hidden md:flex justify-end mt-8">
                <button
                  onClick={handleContinue}
                  className="px-8 py-4 rounded-2xl bg-white text-blue-700 font-semibold text-lg shadow-lg border border-blue-100 transition-all duration-200 flex items-center gap-2 group hover:scale-105 hover:-translate-y-1 hover:shadow-2xl"
                  style={{ boxShadow: "0 4px 16px 0 rgba(80, 112, 255, 0.08)" }}
                >
                  <span className="transition-all duration-200">Continue</span>
                  <span className="text-xl transition-all duration-200 group-hover:translate-x-1">→</span>
                </button>
              </div>
            </div>
          </div>
          {/* Mobile: Continue button below everything */}
          <div className="flex md:hidden justify-center mt-8">
            <button
              onClick={handleContinue}
              className="px-8 py-4 rounded-2xl bg-white text-blue-700 font-semibold text-lg shadow-lg border border-blue-100 transition-all duration-200 flex items-center gap-2 group hover:scale-105 hover:-translate-y-1 hover:shadow-2xl"
              style={{ boxShadow: "0 4px 16px 0 rgba(80, 112, 255, 0.08)" }}
            >
              <span className="transition-all duration-200 group-hover:italic">Continue</span>
              <span className="text-xl transition-all duration-200 group-hover:translate-x-1">→</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
} 