"use client";

import * as React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { RadioGroupSmall, RadioGroupItemSmall } from "@/components/ui/radio-group-small"
import { Textarea } from "@/components/ui/textarea"
import { StartGameButton } from "@/components/ui/send-start-buttons"

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
    text: "If you are paying attention, choose the option that is equal to one plus two.",
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
  {
    id: "manip_check",
    text: "In this study, how will your score be used?",
    category: "manipulation",
    options: [
      "My score is private and will be used only for research purposes",
      "My score will be shown to other participants on the leaderboard",
      "I don't remember"
    ]
  },
];

type ManipCheckValue = 1 | 2 | 3;

const MANIP_CHECK_VALUES = {
  PRIVATE: 1 as ManipCheckValue,
  PUBLIC: 2 as ManipCheckValue,
  DONT_REMEMBER: 3 as ManipCheckValue
} as const;

export default function SurveyPage() {
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [suspicionResponse, setSuspicionResponse] = useState<string>("")
  const router = useRouter()

  const handleResponse = (questionId: string, value: number) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  // Note: Previously checked for attention check failures and routed to page5
  // Now we continue regardless of failures but log them

  // Check if all non-attention-check questions have been answered AND suspicion response is provided
  const isComplete = React.useMemo(() => {
    const allQuestionsAnswered = questions
      .filter(q => !q.id.includes('attn'))
      .every((q) => typeof responses[q.id] === 'number');
    const suspicionAnswered = suspicionResponse.trim().length > 0;
    return allQuestionsAnswered && suspicionAnswered;
  }, [responses, suspicionResponse])

  const handleNext = async () => {
    // Check if the attention check question was answered correctly and log failure
    if (responses['attn_3'] !== 3) {
      // Store the failure in local storage for logging purposes
      localStorage.setItem('attentionCheckFailed', 'true')
      console.log('Attention check failed: attn_3 answered with', responses['attn_3'], 'instead of 3')
    }

    // Check if manipulation check was answered correctly and log failure
    const assignedCondition = localStorage.getItem('condition');
    const manipCheckResponse = responses['manip_check'];
    
    // Check if they answered correctly based on their condition
    const isManipCheckCorrect = 
      (assignedCondition === '1' && manipCheckResponse === MANIP_CHECK_VALUES.PRIVATE) ||
      (assignedCondition === '2' && manipCheckResponse === MANIP_CHECK_VALUES.PUBLIC);

    if (!isManipCheckCorrect || manipCheckResponse === MANIP_CHECK_VALUES.DONT_REMEMBER) {
      localStorage.setItem('manipulationCheckFailed', 'true');
      console.log('Manipulation check failed: condition', assignedCondition, 'response', manipCheckResponse)
    }

    try {
      // Get the stored userId
      const userId = localStorage.getItem('ratGameUserId');
      if (!userId) {
        throw new Error('No user ID found');
      }



      // Get the mastery responses from previous page from localStorage
      const masteryResponses = JSON.parse(localStorage.getItem('masteryResponses') || '[]');

      // Get the BMIS responses from localStorage
      const bmisResponses = JSON.parse(localStorage.getItem('bmisResponses') || '[]');

      // Transform mastery responses into named fields
      const masteryObj = masteryResponses.reduce((acc: Record<string, number>, val: number, idx: number) => {
        acc[`mastery${idx + 1}`] = val;
        return acc;
      }, {});

      // Transform BMIS responses into named fields
      const bmisObj = bmisResponses.reduce((acc: Record<string, number>, val: number, idx: number) => {
        acc[`bmis${idx + 1}`] = val;
        return acc;
      }, {});

      // Transform public responses into named fields
      const publicObj: Record<string, number> = {};
      
      // Add all public responses with their original numbers
      questions
        .filter(q => q.id.startsWith('public'))
        .forEach(q => {
          // Extract the number from the id (e.g., "public1" -> "1")
          const num = q.id.replace('public', '');
          publicObj[`public${num}`] = responses[q.id];
        });
      
      // Add attention check response
      publicObj['attn_3'] = responses['attn_3'];

      // Add manipulation check response
      publicObj['manipCheck'] = responses['manip_check'];

      // Save survey responses
      const response = await fetch(`/api/users/${userId}/survey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mastery: masteryObj,
          public: publicObj,
          bmis: bmisObj,
          suspicion: suspicionResponse
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save survey responses');
      }

      // Get the latest score for the code page
      const latestPlay = parseInt(localStorage.getItem('gamePlays') || '1');
      const latestScore = parseInt(localStorage.getItem(`play${latestPlay}Score`) || '0');
      const assignedCondition = localStorage.getItem('condition');

      // Proceed to code page with score and condition
      router.replace(`/code?score=${latestScore}&condition=${assignedCondition}`);
    } catch (error) {
      console.error('Error saving survey responses:', error);
      alert('There was an error saving your responses. Please try again.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #f6faff 0%, #f8f6ff 100%)" }}>
      <Card className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-blue-100">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">Again, please rate how much you agree with each statement. Your answers will not be shared with your group.</h2>
          
          {questions.map((question) => (
            <div key={question.id} className="mb-8">
              <Label className="text-lg mb-4 block">{question.text}</Label>
              {question.category === 'manipulation' ? (
                <RadioGroupSmall
                  onValueChange={(value) => handleResponse(question.id, parseInt(value))}
                  value={responses[question.id]?.toString()}
                  className="space-y-3"
                >
                  {question.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItemSmall value={(index + 1).toString()} id={`${question.id}-${index + 1}`} />
                      <Label htmlFor={`${question.id}-${index + 1}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroupSmall>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-muted-foreground px-10 mb-3">
                    <span>Strongly disagree</span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span>Strongly agree</span>
                  </div>
                  <RadioGroup
                    onValueChange={(value) => handleResponse(question.id, parseInt(value))}
                    value={responses[question.id]?.toString()}
                    className="flex justify-between px-10"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                      <div key={value} className="flex flex-col items-center">
                        <Label 
                          htmlFor={`${question.id}-${value}`}
                          className="cursor-pointer relative"
                        >
                          <RadioGroupItem value={value.toString()} id={`${question.id}-${value}`} />
                          <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold pointer-events-none">
                            {value}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </div>
          ))}

          <div className="mb-8">
            <Label className="text-lg mb-4 block">
            Before moving on, please share any thoughts about your group experience so far. If you have none, just write "N/A".
            </Label>
            <Textarea
              value={suspicionResponse}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSuspicionResponse(e.target.value)}
              placeholder="Type here..."
              className="min-h-[100px] w-full p-3 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex justify-end">
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