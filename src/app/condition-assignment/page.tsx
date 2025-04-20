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
    const condition = getCondition();
    // Redirect to the appropriate condition's pregame page
    window.location.href = `/${condition}/pregame`;
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        Loading...
      </div>
    </main>
  );
} 