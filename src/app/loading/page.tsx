// 'loading' on frontend; handles user creation and condition assignment on backend

"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

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
    const initializeUserAndAssignCondition = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if user already exists
        let userId = localStorage.getItem('ratGameUserId');
        
        if (!userId) {
          // Create new user if none exists
          const createUserResponse = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              gamePlays: 0,
              leaderboardViews: 0,
              gamePerformance: {}
            }),
          });

          if (!createUserResponse.ok) {
            throw new Error('Failed to create user');
          }

          const data = await createUserResponse.json();
          if (!data.success) {
            throw new Error('Failed to create user');
          }

          userId = data.userId;
          if (userId) {
            localStorage.setItem('ratGameUserId', userId);
          }
        }

        // Ensure userId exists before proceeding
        if (!userId) {
          throw new Error('Failed to get or create user ID');
        }

        // Assign condition
        const condition = getCondition();
        localStorage.setItem('assignedCondition', condition);

        // Update user document with assigned condition
        const response = await fetch(`/api/users/${userId as string}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assignedCondition: condition
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update user condition');
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
        setError('There was an error initializing your session. Please wait while we try again...');
        
        // Retry after 2 seconds
        setTimeout(() => {
          initializeUserAndAssignCondition();
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUserAndAssignCondition();
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-blue-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center space-y-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-lg">Loading...</p>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>
    </main>
  );
} 