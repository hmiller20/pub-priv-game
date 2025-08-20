import { NextResponse } from 'next/server';
import { createParticipant } from '@/lib/supabaseFunctions';

// a post request to create a participant
export async function POST(request: Request) {
  try {
    const participantData = await request.json();
    const participantId = await createParticipant(participantData);
    return NextResponse.json({ success: true, participantId: participantId });
  } catch (error) {
    console.error('Failed to create participant:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}