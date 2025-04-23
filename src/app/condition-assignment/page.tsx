"use client"

import { useEffect } from 'react'

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
  useEffect(() => {
    const assignCondition = async () => {
      const condition = getCondition();
      const userId = localStorage.getItem('ratGameUserId');

      if (!userId) {
        console.error('No user ID found');
        window.location.href = '/survey/demographics';
        return;
      }

      try {
        // Update user document with assigned condition
        const response = await fetch(`/api/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assignedCondition: condition // Store the raw condition number
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update user condition');
        }

        // Redirect to the appropriate condition's pregame page
        window.location.href = `/${condition}/pregame`;
      } catch (error) {
        console.error('Error updating user condition:', error);
        alert('There was an error assigning your condition. Please try again.');
      }
    };

    assignCondition();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        Loading...
      </div>
    </main>
  );
} 