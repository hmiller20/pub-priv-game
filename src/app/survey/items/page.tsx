"use client";

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Start with just one question for testing
const questions = [
  {
    id: "mastery1",
    text: "I work hard at things because I want to excel at them.",
    category: "likert",
  },
  {
    id: "mastery2",
    text: "When I start a new job or hobby, I am personally motivated to be the best I can be.",
    category: "likert",
  },
  {
    id: "mastery3",
    text: "It is personally important to me that I be highly skilled at the activities I care about.",
    category: "likert",
  },
  {
    id: "mastery4",
    text: "I focus on developing my skills primarily for my own growth and enjoyment.",
    category: "likert",
  },
  {
    id: "mastery5",
    text: "I spend time on my interests and hobbies because I want to fully understand and excel at them.",
    category: "likert",
  },
  {
    id: "mastery6",
    text: "The process of mastering things brings me deep fulfillment.",
    category: "likert",
  },
  {
    id: "mastery7",
    text: "I enjoy picking up new skills and learning new things because the process feels rewarding.",
    category: "likert",
  },
  {
    id: "mastery8",
    text: "I enjoy the challenge of learning something new, as it helps me grow as a person.",
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

  // Check if all questions have been answered
  const isComplete = React.useMemo(() => {
    return questions.every((q) => typeof responses[q.id] === 'number')
  }, [responses])

  const handleNext = () => { 
    // Navigate to next survey page
    router.push('/survey/items2');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-blue-100">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">Now, please rate how much you agree with each statement.</h2>
          
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

          <div className="flex justify-end">
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