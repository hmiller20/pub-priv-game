// This file is used to add gameplay data to a user in the database

import { NextResponse } from 'next/server';
import { addGamePlay } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const gamePlayData = await request.json();
    const result = await addGamePlay(params.userId, gamePlayData);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Failed to add gameplay:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 