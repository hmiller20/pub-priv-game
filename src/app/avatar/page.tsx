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
    body: ['checkered', 'rounded', 'squared'],
    clothingColor: ['6dbb58', '54d7c7', '456dff', '7555ca', 'e24553', 'f3b63a', 'f55d81'],
    eyes: ['glasses', 'happy', 'open', 'sleep', 'sunglasses', 'wink'],
    facialHair: ['beardMustache', 'goatee', 'pyramid', 'shadow', 'soulPatch', 'walrus'],
    hair: [
      'bald', 'balding', 'beanie', 'bobBangs', 'bobCut', 'bunUndercut', 'buzzcut',
      'cap', 'curly', 'curlyBun', 'curlyHighTop', 'fade', 'long',
      'mohawk', 'pigtails', 'shortCombover', 'shortComboverChops', 'sideShave', 'straightBun'
    ],
    hairColor: ['6c4545', '362c47', 'dee1f5', 'e15c66', 'e16381', 'f27d65', 'f29c65'],
    mouth: ['bigSmile', 'lips', 'smile', 'smirk', 'surprise'],
    nose: ['mediumRound', 'smallRound', 'wrinkles'],
    skinColor: ['623d36', '92594b', 'b16a5b', 'd78774', 'e5a07e', 'e7a391', 'eeb4a4']
  };

  return {
    seed: 'CustomAvatar',
    body: parameters.body[Math.floor(Math.random() * parameters.body.length)],
    clothingColor: parameters.clothingColor[Math.floor(Math.random() * parameters.clothingColor.length)],
    eyes: parameters.eyes[Math.floor(Math.random() * parameters.eyes.length)],
    facialHair: parameters.facialHair[Math.floor(Math.random() * parameters.facialHair.length)],
    hair: parameters.hair[Math.floor(Math.random() * parameters.hair.length)],
    hairColor: parameters.hairColor[Math.floor(Math.random() * parameters.hairColor.length)],
    mouth: parameters.mouth[Math.floor(Math.random() * parameters.mouth.length)],
    nose: parameters.nose[Math.floor(Math.random() * parameters.nose.length)],
    skinColor: parameters.skinColor[Math.floor(Math.random() * parameters.skinColor.length)]
  };
};

export default function AvatarPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useLocalStorage('currentFirstName', '')
  const [lastInitial, setLastInitial] = useLocalStorage('currentLastInitial', '')
  const [avatarUrl, setAvatarUrl] = useLocalStorage('currentAvatarUrl', '')
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | null>(null)

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

  if (!avatarConfig) return null

  const handleUpdateAvatar = (updates: Partial<AvatarConfig>) => {
    setAvatarConfig(prev => prev ? { ...prev, ...updates } : null)
  }

  const handleContinue = () => {
    if (!firstName.trim() || !lastInitial.trim()) {
      alert("Please enter both your first name and last initial")
      return
    }
    router.replace('/waitingRoom')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-blue-100">
      <h1 className="mb-8 text-3xl font-bold">Create Your Avatar</h1>
      <Card className="w-full max-w-4xl bg-white flex flex-col justify-between min-h-[500px] relative">
        <CardHeader>
          <CardTitle className="italic text-center">Build an avatar that feels like you!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pb-2">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left side: Avatar preview */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-64 h-64 mb-4">
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
                    className="w-full"
                  />
                </div>
                <div className="space-y-2 pb-6"> {/* pb is specifically used to create BOTTOM PADDING */}
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
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Right side: Customization options */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Body Type</Label>
                  <Select
                    value={avatarConfig.body}
                    onValueChange={(value: string) => handleUpdateAvatar({ body: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select body type" />
                    </SelectTrigger>
                    <SelectContent>
                      {['checkered', 'rounded', 'squared'].map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Clothing Color</Label>
                  <Select
                    value={avatarConfig.clothingColor}
                    onValueChange={(value: string) => handleUpdateAvatar({ clothingColor: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select clothing color" />
                    </SelectTrigger>
                    <SelectContent>
                      {['6dbb58', '54d7c7', '456dff', '7555ca', 'e24553', 'f3b63a', 'f55d81'].map((color) => (
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
                  <Label>Eyes</Label>
                  <Select
                    value={avatarConfig.eyes}
                    onValueChange={(value: string) => handleUpdateAvatar({ eyes: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select eye style" />
                    </SelectTrigger>
                    <SelectContent>
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
                    <SelectContent>
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
                    <SelectContent>
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
                    <SelectContent>
                      {['bigSmile', 'lips', 'smile', 'smirk', 'surprise'].map((style) => (
                        <SelectItem key={style} value={style}>
                          {style.replace(/([A-Z])/g, ' $1').trim()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Nose</Label>
                  <Select
                    value={avatarConfig.nose}
                    onValueChange={(value: string) => handleUpdateAvatar({ nose: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select nose style" />
                    </SelectTrigger>
                    <SelectContent>
                      {['mediumRound', 'smallRound', 'wrinkles'].map((style) => (
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
                    <SelectContent>
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
            </div>
          </div>
        </CardContent>
        <div className="absolute bottom-0 right-0 p-6">
          <Button 
            onClick={handleContinue}
            className="bg-black hover:bg-black/90 text-white text-md px-4 py-2"
          >
            Continue to Waiting Room
          </Button>
        </div>
      </Card>
    </main>
  )
} 