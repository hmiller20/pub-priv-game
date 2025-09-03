"use client";

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { StartGameButton } from "@/components/ui/send-start-buttons"
import { FloatingBubbles } from "../floating-bubbles"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export default function CodePage() {
  const [showDebriefingDialog, setShowDebriefingDialog] = useState(false)

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
              onClick={() => setShowDebriefingDialog(true)}
            >
              Debriefing Form
            </StartGameButton>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDebriefingDialog} onOpenChange={setShowDebriefingDialog}>
        <DialogContent className="sm:max-w-5xl max-h-[85vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-2xl font-semibold text-center">
              Debriefing Form
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 px-6">
            <iframe
              src="/debriefing form.pdf"
              className="w-full h-[60vh] border-0 rounded-lg"
              title="Debriefing Form PDF"
            />
          </div>
          <DialogFooter className="p-6 pt-4">
            <Button
              onClick={() => setShowDebriefingDialog(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
} 