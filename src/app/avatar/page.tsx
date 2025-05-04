"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from "lucide-react"

// Generate a large array of random seeds
const generateSeeds = () => {
  const adjectives = ['Happy', 'Clever', 'Brave', 'Wise', 'Kind', 'Swift', 'Bright', 'Calm', 'Wild', 'Gentle']
  const nouns = ['Lion', 'Eagle', 'Wolf', 'Dolphin', 'Tiger', 'Bear', 'Fox', 'Hawk', 'Deer', 'Owl']
  const seeds = []
  
  for (let i = 0; i < 50; i++) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const number = Math.floor(Math.random() * 100)
    seeds.push(`${adj}${noun}${number}`)
  }
  
  return seeds
}

export default function AvatarPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useLocalStorage('currentFirstName', '')
  const [lastInitial, setLastInitial] = useLocalStorage('currentLastInitial', '')
  const [avatarUrl, setAvatarUrl] = useLocalStorage('currentAvatarUrl', '')
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    loop: true,
    slidesToScroll: 2,
    containScroll: 'trimSnaps'
  })

  const [avatarSeeds, setAvatarSeeds] = useState<string[] | null>(null)
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null)

  // Move useCallback hooks above the early return
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    const seeds = generateSeeds()
    setAvatarSeeds(seeds)
    setSelectedSeed(seeds[0])
  }, [])

  useEffect(() => {
    if (!selectedSeed) return
    const url = `https://api.dicebear.com/7.x/personas/svg?seed=${selectedSeed}`
    setAvatarUrl(url)
  }, [selectedSeed, setAvatarUrl])

  if (!avatarSeeds || !selectedSeed) return null // or a loading spinner

  const handleContinue = () => {
    if (!firstName.trim() || !lastInitial.trim()) {
      alert("Please enter both your first name and last initial")
      return
    }
    router.replace('/waitingRoom')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-blue-100">
      <h1 className="mb-8 text-3xl font-bold">Choose Your Avatar</h1>
      <Card className="w-full max-w-2xl bg-white">
        <CardHeader>
          <CardTitle>Create Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="w-full space-y-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium">
                Enter Your First Name
              </label>
              <Input
                id="firstName"
                type="text"
                placeholder="Your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastInitial" className="text-sm font-medium">
                Enter Your Last Initial
              </label>
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

          <div>
            <label className="text-sm font-medium mb-4 block">
              Select Your Avatar
            </label>
            <div className="relative">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  className="mr-2 bg-white shadow-md hover:bg-gray-50 h-8 w-8 p-0 flex-shrink-0"
                  onClick={scrollPrev}
                  aria-label="Scroll avatars left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="overflow-hidden w-full px-8" ref={emblaRef}>
                  <div className="flex gap-4">
                    {avatarSeeds.map((seed) => (
                      <button
                        key={seed}
                        onClick={() => setSelectedSeed(seed)}
                        className={cn(
                          "flex-shrink-0 flex items-center justify-center rounded-full transition-all",
                          "hover:bg-gray-100 focus:outline-none",
                          selectedSeed === seed
                            ? "ring-4 ring-blue-500 bg-blue-50"
                            : "ring-0",
                          "h-32 w-32 m-2"
                        )}
                        style={{ background: "transparent" }}
                      >
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={`https://api.dicebear.com/7.x/personas/svg?seed=${seed}`} />
                          <AvatarFallback>{seed[0]}</AvatarFallback>
                        </Avatar>
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="ml-2 bg-white shadow-md hover:bg-gray-50 h-8 w-8 p-0 flex-shrink-0"
                  onClick={scrollNext}
                  aria-label="Scroll avatars right"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleContinue}
            className="w-full bg-black hover:bg-black/90 text-white"
          >
            Continue to Waiting Room
          </Button>
        </CardContent>
      </Card>
    </main>
  )
} 