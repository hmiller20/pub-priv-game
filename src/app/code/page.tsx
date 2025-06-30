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
              Thank you for participating in our study! Your responses have been recorded. You may now close this window.
            </p>
            <StartGameButton
              className="w-full flex items-center justify-center gap-2"
              onClick={() => window.open('/debriefing-form.pdf', '_blank')}
            >
              Debriefing Form
            </StartGameButton>
          </div>
        </CardContent>
      </Card>
    </main>
  );
} 