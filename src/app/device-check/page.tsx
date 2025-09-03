// app/device-check/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

const MIN_W = 1024
const MIN_H = 650

export default function DeviceCheck() {
  const params = useSearchParams()
  const next = params.get("next") || "/"
  const surveyCode = params.get("survey_code") // optional
  const [ok, setOk] = useState<boolean | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const checkSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const pass = width >= MIN_W && height >= MIN_H
      
      setDimensions({ width, height })
      setOk(pass)
      
      if (pass) {
        // set short-lived cookie (httpOnly not available client-side, but fine for this purpose)
        document.cookie = `desktop_ok=1; path=/; max-age=7200; samesite=lax`
        // redirect back to original dest, preserving survey_code
        const u = new URL(next, location.origin)
        if (surveyCode && !u.searchParams.get("survey_code")) {
          u.searchParams.set("survey_code", surveyCode)
        }
        location.replace(u.toString())
      }
    }

    // Initial check
    checkSize()

    // Listen for window resize
    window.addEventListener('resize', checkSize)
    return () => window.removeEventListener('resize', checkSize)
  }, [next, surveyCode])

  if (ok === false) {
    return (
      <main className="mx-auto max-w-xl p-4 sm:p-6">
        <div className="text-center space-y-4">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Desktop or laptop required</h1>
          <div className="space-y-2 text-sm sm:text-base text-gray-600">
            <p>
              Please open this study on a desktop or laptop computer.
            </p>
            <p>
              Your window needs to be at least <strong>{MIN_W}×{MIN_H}</strong> pixels.
            </p>
            <p className="text-xs text-gray-500">
              Current size: {dimensions.width > 0 ? `${dimensions.width}×${dimensions.height}` : 'Checking...'}
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="text-sm opacity-70">Checking your device…</div>
    </main>
  )
}