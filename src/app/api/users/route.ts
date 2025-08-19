// This file is a post endpoint used to create a new user in the database
// this is a "worker" that imports "tools" (functions) from the "factory" (supabaseFunctions.ts)

import { NextResponse } from 'next/server';
import { createUser } from '@/lib/supabaseFunctions';

export async function POST(request: Request) {
  try {
    const userData = await request.json(); // get the user data from the request
    const userId = await createUser(userData); // create the user in the database by calling the createUser function
    return NextResponse.json({ success: true, userId: userId }); // return the user id
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 