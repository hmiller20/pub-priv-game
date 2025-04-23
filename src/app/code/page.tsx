"use client";

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

export default function CodePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-blue-100">
      <Card className="w-full max-w-lg bg-white">
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-bold text-center mb-6">Study Complete</h1>
          <div className="space-y-4">
            <p className="text-gray-700">
              Thank you for participating in our study! Your responses have been recorded.
            </p>
            
            <Button 
              className="w-full flex items-center justify-center gap-2 bg-black hover:bg-black/90 text-white"
              onClick={() => window.open('/debriefing-form.pdf', '_blank')}
            >
              <FileText className="h-4 w-4" />
              Debriefing Form
            </Button>

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