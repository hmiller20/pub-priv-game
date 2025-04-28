"use client"

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

type Condition = '1' | '2'; // 1 is private, 2 is public

function getCondition(): Condition {
  // Check if condition is already assigned
  const stored = localStorage.getItem('condition');
  if (stored && (stored === '1' || stored === '2')) {
    return stored;
  }

  // If not, randomly assign one
  const condition: Condition = Math.random() < 0.5 ? '1' : '2';
  localStorage.setItem('condition', condition);
  return condition;
}

export default function ConditionAssignment() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const assignCondition = async () => {
      setIsLoading(true);
      setError(null);
      
      const userId = localStorage.getItem('ratGameUserId');
      if (!userId) {
        console.error('No user ID found');
        window.location.href = '/survey/demographics';
        return;
      }

      try {
        const condition = getCondition();

        // Update user document with assigned condition
        const response = await fetch(`/api/users/${userId}`, {
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

        // Only redirect after successful database update
        window.location.href = `/${condition}/pregame`;
      } catch (error) {
        console.error('Error updating user condition:', error);
        setError('There was an error assigning your condition. Please wait while we try again...');
        
        // Retry after 2 seconds
        setTimeout(() => {
          assignCondition();
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    assignCondition();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-blue-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-lg">Assigning your condition...</p>
          </div>
        ) : error ? (
          <div className="text-red-600">
            <p>{error}</p>
          </div>
        ) : (
          <p className="text-lg">Redirecting...</p>
        )}
      </div>
    </main>
  );
} 