"use client";

import * as React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const questions = [
  {
    id: "public1",
    text: "I like it when my skills are visible to those around me.",
    category: "likert",
  },
  {
    id: "public2",
    text: "I prefer when my successes are publicly acknowledged.",
    category: "likert",
  },
  {
    id: "attn_3",
    text: "If you are paying attention, please choose option three.",
    category: "likert",
  },
  {
    id: "public3",
    text: "I enjoy being in the spotlight when it comes to my achievements.",
    category: "likert",
  },
  {
    id: "public4",
    text: "Having my abilities and accomplishments recognized publicly is important to me.",
    category: "likert",
  },
  {
    id: "public5",
    text: "I often highlight my expertise in group settings to gain recognition.",
    category: "likert",
  },
  {
    id: "public6",
    text: "I work hard mainly because I want to earn the respect of my friends and colleagues.",
    category: "likert",
  },
  {
    id: "public7",
    text: "I usually try harder when people are watching.",
    category: "likert",
  },
];

export default function SurveyPage() {
  const [responses, setResponses] = useState<Record<string, number>>({})
  const router = useRouter()

  const handleResponse = (questionId: string, value: number) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

    // Check for previous failures on component mount
    useEffect(() => {
        const hasFailed = localStorage.getItem('attentionCheckFailed')
        if (hasFailed === 'true') {
          router.push('/survey/page5')
        }
      }, [router])

  // Check if all non-attention-check questions have been answered
  const isComplete = React.useMemo(() => {
    return questions
      .filter(q => !q.id.includes('attn')) // Exclude attention check questions
      .every((q) => typeof responses[q.id] === 'number')
  }, [responses])

  const handleNext = () => {
    // Check if the attention check question was answered correctly
    if (responses['attn_3'] !== 3) {
        // Store the failure in local storage
      localStorage.setItem('attentionCheckFailed', 'true')
      router.push('/survey/page5')
    } else {
      router.push('/condition-assignment')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-blue-100">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">Again, please rate how much you agree with each statement.</h2>
          
          {questions.map((question) => (
            <div key={question.id} className="mb-8">
              <Label className="text-lg mb-4 block">{question.text}</Label>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground px-0">
                  <span>Strongly disagree</span>
                  <span>Strongly agree</span>
                </div>
                <RadioGroup
                  onValueChange={(value) => handleResponse(question.id, parseInt(value))}
                  value={responses[question.id]?.toString()}
                  className="flex justify-between px-10"
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                    <div key={value} className="flex flex-col items-center gap-2">
                      <RadioGroupItem value={value.toString()} id={`${question.id}-${value}`} />
                      <Label 
                        htmlFor={`${question.id}-${value}`}
                        className="cursor-pointer text-md"
                      >
                        {value}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          ))}

          <div className="flex justify-end mt-6">
            {/* we needed a div to put the button at the right end of the container
             * w-1/3 - sets the width to 1/3 of the container
             * py-2 - adds padding of 0.5rem to top and bottom
             * text-md - Sets medium font size
             * mt-6 - adds margin-top of 1.5rem
             */}
            <Button
              onClick={handleNext}
              className="w-1/5 py-2 text-md"
              disabled={!isComplete}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 