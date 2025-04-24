// This file is used to create a new user in the database

import { NextResponse } from 'next/server';
import { createUser } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    const userId = await createUser(userData);
    return NextResponse.json({ success: true, userId: userId.toString() });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 