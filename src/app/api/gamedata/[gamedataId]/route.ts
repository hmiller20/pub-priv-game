import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(
  request: Request,
  { params }: { params: { gamedataId: string } }
) {
  try {
    const updateData = await request.json();
    
    const { data, error } = await supabase
      .from('gamedata')
      .update(updateData)
      .eq('id', params.gamedataId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, gamedata: data });
  } catch (error) {
    console.error('Failed to update gamedata:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}