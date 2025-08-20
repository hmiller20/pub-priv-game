// 'loading' on frontend; handles condition assignment (user should already exist from avatar page)

"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { FloatingBubbles } from "../floating-bubbles" // the brackets are important. { FloatingBubbles } gets just the bubbles animation

// Function to get condition (1 or 2)
const getCondition = () => {
  // For now, randomly assign condition
  return Math.random() < 0.5 ? "1" : "2"
}

export default function ConditionAssignment() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const assignConditionAndProceed = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get existing user ID (should already exist from avatar page)
        const userId = localStorage.getItem('ratGameUserId');
        
        // Ensure userId exists before proceeding
        if (!userId) {
          throw new Error('User not found. Please restart from the avatar page.');
        }

        // Get existing condition (should already be assigned in avatar page)
        let condition = localStorage.getItem('condition');
        
        // Fallback: if no condition exists, assign one now
        if (!condition) {
          condition = getCondition();
          localStorage.setItem('condition', condition);
          
          // Update participant with condition
          const response = await fetch(`/api/participants/${userId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              condition: condition
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to update participant condition');
          }
        }

        // Initialize game-related localStorage items if they don't exist
        if (typeof window !== 'undefined') {
          if (!localStorage.getItem('gamePlays')) {
            localStorage.setItem('gamePlays', '0');
          }
          if (!localStorage.getItem('leaderboardViews')) {
            localStorage.setItem('leaderboardViews', '0');
          }
        }

        // Use Next.js router for navigation
        router.replace(`/${condition}/instructions`);
      } catch (error) {
        console.error('Error in initialization:', error);
        setError('There was an error assigning your condition. Please wait while we try again...');
        
        // Retry after 2 seconds
        setTimeout(() => {
          assignConditionAndProceed();
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    assignConditionAndProceed();
  }, [router]);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f6faff 0%, #f8f6ff 100%)",
      }}
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <FloatingBubbles />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 text-blue-400 animate-spin" />
      </div>
    </main>
  );
} 