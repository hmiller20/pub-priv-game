import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { participantId: string } }
) {
  try {
    // Count existing gamedata records for this participant
    const { count, error } = await supabase
      .from('gamedata')
      .select('*', { count: 'exact', head: true })
      .eq('participant_id', params.participantId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      gameCount: count || 0 
    });
  } catch (error) {
    console.error('Failed to get game count:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}