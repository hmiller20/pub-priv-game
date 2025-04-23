import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const data = await request.json();
  // Future integration: insert survey data into MongoDB
  console.log('Survey data:', data);
  return NextResponse.json({ success: true });
} 