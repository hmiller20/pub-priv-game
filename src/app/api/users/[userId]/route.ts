// we don't really need this file because we are not updating the user
// but it's a standard part of a REST API
// so I'm keeping it here for now

// the brackets in the file name mean that this is a dynamic route
// it's a next.js convention to use square brackets to denote dynamic routes
// the userId is passed in the URL
// the brackets are what make the route dynamic and able to handle any user ID value

import { NextResponse } from 'next/server';
import { updateUser } from '@/lib/mongoFunctions';

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