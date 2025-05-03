"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SurveyPage() {
  const router = useRouter();
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  // Check for previous failures on component mount
  useEffect(() => {
    const hasFailed = localStorage.getItem('attentionCheckFailed')
    if (hasFailed === 'true') {
      router.push('/survey/page5')
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
        router.push('/survey/prompt');
      } else {
        throw new Error('Failed to update user demographics');
      }
    } catch (error) {
      console.error('Error updating user demographics:', error);
      alert('There was an error. Please try again.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-blue-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Now, please tell us about yourself.
        </h1>
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
        <button
          type="button"
          disabled={!age || !gender}
          onClick={handleNext}
          className={`mt-6 w-full font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 ${
            !age || !gender
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700 cursor-pointer focus:ring-blue-500"
          } text-white`}
        >
          Next
        </button>
      </div>
    </main>
  );
} 