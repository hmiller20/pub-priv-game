import { NextResponse } from 'next/server';
import { addGameData } from '@/lib/supabaseFunctions';

export async function POST(request: Request) {
  try {
    const gameData = await request.json();
    const result = await addGameData(gameData);
    return NextResponse.json({ success: true, gamedata: result });
  } catch (error) {
    console.error('Failed to create gamedata:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}