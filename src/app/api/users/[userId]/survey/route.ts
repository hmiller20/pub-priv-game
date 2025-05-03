import { NextResponse } from 'next/server';
import { updateSurveyResponses } from '@/lib/mongoFunctions';

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const surveyData = await request.json();
    const result = await updateSurveyResponses(params.userId, surveyData);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Failed to update survey responses:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 