"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SurveyPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
      // Create user document with demographic info
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: parseInt(age),
          gender: gender === 'male' ? 0 : 
                 gender === 'female' ? 1 : 
                 gender === 'non-binary' ? 2 : 
                 gender === 'prefer-not' ? 3 : 4, // 4 is "other"
          gamePlays: 0,
          leaderboardViews: 0,
          gamePerformance: {
            firstPlay: {
              score: 0,
              completedAt: new Date()
            }
          }
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Store userId for later use
        localStorage.setItem('ratGameUserId', data.userId);
        // Navigate to the next survey page
        router.push('/survey/prompt');
      } else {
        throw new Error('Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('There was an error. Please try again.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-blue-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Welcome! Please tell us about yourself.
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              id="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              id="lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
        </div>
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
          disabled={!age || !gender || !firstName || !lastName}
          onClick={handleNext}
          className={`mt-6 w-full font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 ${
            !age || !gender || !firstName || !lastName 
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