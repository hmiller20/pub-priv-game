"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

function Bubble({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  return (
    <motion.circle
      cx={x}
      cy={y}
      r={size}
      fill={color}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0.5, 0.3, 0.5],
        scale: [1, 1.15, 1],
        x: x + Math.random() * 60 - 30,
        y: y + Math.random() * 60 - 30,
      }}
      transition={{
        duration: 7 + Math.random() * 6,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      }}
    />
  )
}

function FloatingBubblesComponent() {
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number; size: number; color: string }>>([])

  useEffect(() => {
    const pastelColors = [
      'rgba(173, 216, 230, 0.35)', // light blue
      'rgba(186, 104, 200, 0.25)', // light purple
      'rgba(255, 183, 197, 0.25)', // light pink
      'rgba(197, 225, 165, 0.25)', // light green
      'rgba(255, 241, 118, 0.25)', // light yellow
      'rgba(255, 204, 188, 0.25)', // light orange
      'rgba(179, 229, 252, 0.25)', // lighter blue
      'rgba(225, 190, 231, 0.25)', // lighter purple
    ];
    const newBubbles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 32 + 18,
      color: pastelColors[Math.floor(Math.random() * pastelColors.length)],
    }))
    setBubbles(newBubbles)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full">
        <title>Floating Bubbles</title>
        {bubbles.map((bubble) => (
          <Bubble key={bubble.id} {...bubble} />
        ))}
      </svg>
    </div>
  )
}

export default function FloatingBubblesBackground({
  title = "Floating Bubbles",
  onButtonClick,
}: {
  title?: string
  onButtonClick?: () => void
}) {
  const [hasViewedConsent, setHasViewedConsent] = useState(false)
  const [showConsentDialog, setShowConsentDialog] = useState(false)
  const words = title.split(" ")

  return (
    <TooltipProvider>
      <div
        className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #f6faff 0%, #f8f6ff 100%)",
        }}
      >
      <FloatingBubblesComponent />
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        <h1
          className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-center leading-[1.1] py-4"
          style={{
            background: "linear-gradient(90deg, #4f46e5 0%, #9333ea 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {title}
        </h1>
        <button
          onClick={() => {
            setShowConsentDialog(true)
            setHasViewedConsent(true)
          }}
          className="mt-6 px-8 py-4 rounded-2xl bg-white text-blue-700 font-semibold text-lg shadow-lg border border-blue-100 transition-all duration-200 flex items-center gap-2 group hover:scale-105 hover:-translate-y-1 hover:shadow-2xl"
          style={{ boxShadow: "0 4px 16px 0 rgba(80, 112, 255, 0.08)" }}
        >
          <span className="transition-all duration-200">View consent form</span>
        </button>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <button
              onClick={hasViewedConsent ? onButtonClick : undefined}
              disabled={!hasViewedConsent}
              className={`mt-4 px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg border transition-all duration-200 flex items-center gap-2 ${
                hasViewedConsent 
                  ? "bg-white text-blue-700 border-blue-100 group hover:scale-105 hover:-translate-y-1 hover:shadow-2xl cursor-pointer" 
                  : "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
              }`}
              style={{ boxShadow: hasViewedConsent ? "0 4px 16px 0 rgba(80, 112, 255, 0.08)" : "0 4px 16px 0 rgba(128, 128, 128, 0.08)" }}
            >
              <span className="transition-all duration-200">Create my avatar</span>
              <span className="text-xl transition-all duration-200 group-hover:translate-x-1"></span>
            </button>
          </TooltipTrigger>
          {!hasViewedConsent && (
            <TooltipContent side="bottom" className="bg-black text-white border-black">
              <p>Please view the consent form first</p>
            </TooltipContent>
          )}
        </Tooltip>
      </div>
      <footer className="fixed left-0 right-0 bottom-4 text-center text-xs text-gray-400 z-20">
        © PsycTech 2025. All rights reserved.
      </footer>
      
      <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <DialogContent className="sm:max-w-5xl max-h-[85vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-2xl font-semibold text-center">
              Consent Form
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 px-6">
            <iframe
              src="/consent form.pdf"
              className="w-full h-[60vh] border-0 rounded-lg"
              title="Consent Form PDF"
            />
          </div>
          <DialogFooter className="p-6 pt-4">
            <Button
              onClick={() => setShowConsentDialog(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </TooltipProvider>
  )
}

export { FloatingBubblesComponent as FloatingBubbles };
