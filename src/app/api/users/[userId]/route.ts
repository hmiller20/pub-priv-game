import { NextResponse } from 'next/server';
import { updateUser } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const updateData = await request.json();
    const result = await updateUser(params.userId, updateData);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 