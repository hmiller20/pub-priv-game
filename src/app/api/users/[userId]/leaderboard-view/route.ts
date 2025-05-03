import { NextResponse } from 'next/server';
import { incrementLeaderboardViews } from '@/lib/mongoFunctions';

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const result = await incrementLeaderboardViews(params.userId);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Failed to increment leaderboard views:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 