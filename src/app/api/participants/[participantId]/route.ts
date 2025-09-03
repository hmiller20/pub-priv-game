import { NextResponse } from 'next/server';
import { updateParticipant, getParticipant } from '@/lib/supabaseFunctions';

// a patch request to update a participant's data
export async function PATCH(
  request: Request,
  { params }: { params: { participantId: string } }
) {
  try {
    const updateData = await request.json();
    
    // Map frontend camelCase fields to database snake_case fields
    const fieldMapping: { [key: string]: string } = {
      'firstName': 'firstname',
      'lastInitial': 'lastinitial', 
      'fsuEmail': 'fsuemail',
      'age': 'age',
      'gender': 'gender',
      'condition': 'condition',
      'gameplays': 'gameplays'
    };
    
    const filteredData: any = {};
    
    for (const [frontendField, dbField] of Object.entries(fieldMapping)) {
      if (updateData.hasOwnProperty(frontendField)) {
        filteredData[dbField] = updateData[frontendField];
      }
    }
    
    // Handle special case for incrementing gameplays
    if (filteredData.gameplays === 'INCREMENT') {
      // Get current participant data
      const participant = await getParticipant(params.participantId);
      const currentGameplays = participant.gameplays || 0;
      
      // Update with incremented value
      filteredData.gameplays = currentGameplays + 1;
      console.log(`Incrementing gameplays for participant ${params.participantId}: ${currentGameplays} -> ${filteredData.gameplays}`);
    }
    
    const result = await updateParticipant(params.participantId, filteredData);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Failed to update participant:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { participantId: string } }
) {
  try {
    const participant = await getParticipant(params.participantId);
    return NextResponse.json({ success: true, participant });
  } catch (error) {
    console.error('Failed to get participant:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 404 }
    );
  }
}