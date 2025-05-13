"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

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
  const words = title.split(" ")

  return (
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
          onClick={onButtonClick}
          className="mt-6 px-8 py-4 rounded-2xl bg-white text-blue-700 font-semibold text-lg shadow-lg border border-blue-100 transition-all duration-200 flex items-center gap-2 group hover:scale-105 hover:-translate-y-1 hover:shadow-2xl"
          style={{ boxShadow: "0 4px 16px 0 rgba(80, 112, 255, 0.08)" }}
        >
          <span className="transition-all duration-200 ">Create my avatar</span>
          <span className="text-xl transition-all duration-200 group-hover:translate-x-1"></span>
        </button>
      </div>
      <footer className="fixed left-0 right-0 bottom-4 text-center text-xs text-gray-400 z-20">
        © PsycTech 2025. All rights reserved.
      </footer>
    </div>
  )
}

export { FloatingBubblesComponent as FloatingBubbles };
