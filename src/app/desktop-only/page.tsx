'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSearchParams } from 'next/navigation'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap', weight: '400' })

export default function DesktopOnlyPage() {
  const searchParams = useSearchParams()
  const surveyCode = searchParams.get('survey_code')

  const handleReturnToSona = () => {
    // Redirect back to SONA or close the window
    window.close()
  }

  const handleTryDesktop = () => {
    // Create the URL with survey code if available
    const baseUrl = window.location.origin
    const url = surveyCode 
      ? `${baseUrl}/?survey_code=${encodeURIComponent(surveyCode)}`
      : baseUrl
    
    // Copy to clipboard for convenience
    navigator.clipboard.writeText(url).catch(() => {
      // Fallback if clipboard API fails
      console.log('Could not copy to clipboard')
    })
    
    alert(`Please copy this URL and open it on your desktop or laptop:\n\n${url}\n\n(The URL has been copied to your clipboard if your browser supports it)`)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-blue-100">
      <div className="flex flex-col items-center mb-8 relative">
        <div className="bg-white rounded-2xl p-6 sm:p-12 shadow-lg max-w-2xl">
          <h1 className={`text-4xl sm:text-7xl font-bold text-blue-800 ${inter.className} text-center mb-6`}>
            Laptop Required
          </h1>
        </div>
      </div>

      <div className="w-full max-w-2xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl text-center text-blue-800">
              This study requires a desktop or laptop computer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-base sm:text-lg text-gray-700 space-y-4">
              <p>
                We've detected that you're using a mobile device (phone or tablet). 
                This research study is optimized for desktop and laptop computers and 
                requires a larger screen for the best experience.
              </p>
              
              <p>
                <strong>To participate in this study, please:</strong>
              </p>
              
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Switch to a desktop or laptop computer</li>
                <li>Return to the study page on SONA</li>
                <li>Complete the study on the larger screen</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
