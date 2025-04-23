"use client";

import { useState, useEffect } from 'react';

export default function Page5() {
  return (
    <main className="flex min-h-screen items-center justify-center p-0 bg-blue-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg text-center">
        <p className="mb-0 text-gray-700">
          We noticed that you did not correctly respond to our attention check question. 
          Unfortunately, we cannot proceed with the study. Thank you for your time.
        </p>
      </div>
    </main>
  );
} 