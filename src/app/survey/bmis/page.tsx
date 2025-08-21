"use client";

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { StartGameButton } from "@/components/ui/send-start-buttons"

const moodItems = [
  { id: "bmis1", text: "Lively" },
  { id: "bmis2", text: "Happy" },
  { id: "bmis3", text: "Sad" },
  { id: "bmis4", text: "Tired" },
  { id: "bmis5", text: "Caring" },
  { id: "bmis6", text: "Content" },
  { id: "bmis7", text: "Gloomy" },
  { id: "bmis8", text: "Jittery" },
  { id: "bmis9", text: "Drowsy" },
  { id: "bmis10", text: "Grouchy" },
  { id: "bmis11", text: "Peppy" },
  { id: "bmis12", text: "Nervous" },
  { id: "bmis13", text: "Calm" },
  { id: "bmis14", text: "Loving" },
  { id: "bmis15", text: "Fed up" },
  { id: "bmis16", text: "Active" },
];

export default function BMISPage() {
  const [responses, setResponses] = useState<Record<string, number>>({})
  const router = useRouter()

  const handleResponse = (itemId: string, value: number) => {
    setResponses((prev) => ({
      ...prev,
      [itemId]: value,
    }))
  }

  // Check if all items have been answered
  const isComplete = React.useMemo(() => {
    return moodItems.every((item) => typeof responses[item.id] === 'number')
  }, [responses])

  const handleNext = () => {
    // Save BMIS responses to localStorage before navigating
    const bmisResponses = moodItems.map(item => responses[item.id]);
    localStorage.setItem('bmisResponses', JSON.stringify(bmisResponses));
    
    // Navigate to prompt page
    router.replace('/survey/prompt');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #f6faff 0%, #f8f6ff 100%)" }}>
      <Card className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-blue-100">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">Choose the response on the scale below that indicates how well each adjective or phrase describes your present mood.</h2>
          
          <div className="space-y-6">
            <div className="flex justify-between text-sm text-muted-foreground px-10 mb-6">
              <span>Definitely do not feel</span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span>Definitely feel</span>
            </div>

            {moodItems.map((item) => (
              <div key={item.id} className="flex items-center">
                <div className="w-32 text-lg font-medium">
                  {item.text}
                </div>
                <div className="flex-1 px-10">
                  <RadioGroup
                    onValueChange={(value) => handleResponse(item.id, parseInt(value))}
                    value={responses[item.id]?.toString()}
                    className="flex justify-between"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                      <div key={value} className="flex flex-col items-center">
                        <Label 
                          htmlFor={`${item.id}-${value}`}
                          className="cursor-pointer relative"
                        >
                          <RadioGroupItem value={value.toString()} id={`${item.id}-${value}`} />
                          <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold pointer-events-none">
                            {value}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-8">
            <StartGameButton
              onClick={handleNext}
              className="w-1/5 py-2 text-md"
              disabled={!isComplete}
            >
              Next
            </StartGameButton>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}