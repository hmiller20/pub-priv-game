"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card"
import { StartGameButton } from "@/components/ui/send-start-buttons"

export default function SurveyPage() {
  const router = useRouter();

  // Note: Previously checked for attention check failures and routed to page5
  // Now we continue regardless of failures but log them
  // Age and gender questions have been moved to the avatar page

  const handleNext = () => {
    // Navigate to the next survey page
    router.replace('/survey/prompt');
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f6faff 0%, #f8f6ff 100%)",
      }}
    >
      <h1
        className="text-2xl font-bold mb-4 text-center"
      >
        Ready to continue?
      </h1>
      <Card className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-blue-100 p-6">
        <CardContent>
          <div className="mt-4 text-center">
            <p className="text-gray-700 mb-6">
              Thank you for completing the survey questions. Let's move on to the next section.
            </p>
          </div>
          <StartGameButton
            type="button"
            onClick={handleNext}
            className="mt-6 w-full"
          >
            Continue
          </StartGameButton>
        </CardContent>
      </Card>
    </main>
  );
} 