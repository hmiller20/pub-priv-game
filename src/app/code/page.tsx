"use client";

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { StartGameButton } from "@/components/ui/send-start-buttons"
import { FloatingBubbles } from "../floating-bubbles"

export default function CodePage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f6faff 0%, #f8f6ff 100%)" }}
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <FloatingBubbles />
      </div>
      <Card className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-blue-100 p-6 z-10 relative">
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-bold text-center mb-6">Study Complete</h1>
          <div className="space-y-4">
            <p className="text-gray-700">
              Thank you for participating in our study! Your responses have been recorded.
            </p>
            <StartGameButton
              className="w-full flex items-center justify-center gap-2"
              onClick={() => window.open('/debriefing-form.pdf', '_blank')}
            >
              Debriefing Form
            </StartGameButton>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-medium text-blue-900">Your completion code is:</p>
              <p className="text-2xl font-bold text-blue-900 text-center mt-2">MASTERY</p>
            </div>
            <p className="text-sm text-gray-600">
              Please copy this code and submit it to receive your compensation.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
} 