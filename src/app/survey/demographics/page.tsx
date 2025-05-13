"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card"
import { StartGameButton } from "@/components/ui/send-start-buttons"

export default function SurveyPage() {
  const router = useRouter();
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  // Check for previous failures on component mount
  useEffect(() => {
    const hasFailed = localStorage.getItem('attentionCheckFailed')
    if (hasFailed === 'true') {
      router.replace('/survey/page5')
    }
  }, [router])

  const handleNext = async () => {
    if (!age || !gender) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Get the stored userId
      const userId = localStorage.getItem('ratGameUserId');
      if (!userId) {
        throw new Error('No user ID found');
      }

      // Update user document with demographic info
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: parseInt(age),
          gender: gender === 'male' ? 0 : 
                 gender === 'female' ? 1 : 
                 gender === 'non-binary' ? 2 : 
                 gender === 'prefer-not' ? 3 : 4, // 4 is "other"
        }),
      });

      if (response.ok) {
        // Navigate to the next survey page
        router.replace('/survey/prompt');
      } else {
        throw new Error('Failed to update user demographics');
      }
    } catch (error) {
      console.error('Error updating user demographics:', error);
      alert('There was an error. Please try again.');
    }
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f6faff 0%, #f8f6ff 100%)",
      }}
    >
      <h1
        className="text-2xl font-bold mb-4 text-center"
      >
        Now, please tell us about yourself.
      </h1>
      <Card className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-blue-100 p-6">
        <CardContent>
          <div className="mt-4">
            <label htmlFor="age" className="block text-sm font-medium text-gray-700">How old are you?</label>
            <input
              id="age"
              type="number"
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div className="mt-4">
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">What is your gender?</label>
            <select
              id="gender"
              required
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="" disabled>Select gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not">Prefer not to say</option>
              <option value="other">Other</option>
            </select>
          </div>
          <StartGameButton
            type="button"
            disabled={!age || !gender}
            onClick={handleNext}
            className="mt-6 w-full"
          >
            Next
          </StartGameButton>
        </CardContent>
      </Card>
    </main>
  );
} 