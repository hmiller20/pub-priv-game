import { NextRequest } from "next/server";
import { updateWaitingRoomMessages } from "@/lib/supabaseFunctions";

export async function POST(req: NextRequest) {
  const { userId, messages } = await req.json();

  if (!userId || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "Missing fields" }), {
      status: 400,
    });
  }

  try {
    await updateWaitingRoomMessages(userId, messages);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to save messages" }), {
      status: 500,
    });
  }
}
