import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: Request) {
  try {
    const { message, playerName, chatHistory, botReplyCounts } = await request.json() as {
      message: string;
      playerName: "Alex K." | "Jordan M." | "Taylor R.";
      chatHistory: any[];
      botReplyCounts: { "Alex K.": number; "Jordan M.": number; "Taylor R.": number; };
    };

    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not configured');
      return NextResponse.json(
        { success: false, error: 'API key not configured' },
        { status: 500 }
      );
    }

    const botReplyChances = {
      "Alex K.": (count: number) => count < 1, // Alex can reply up to 1 time
      "Jordan M.": (count: number) => count < 2, // Jordan can reply up to 2 times
      "Taylor R.": (count: number) => count < 3, // Taylor can reply up to 3 times
    };

    // Create a system prompt that defines the AI's personality and context
    const systemPrompts = {
      "Alex K.": `
        You are "Alex K.", a reserved participant in a group chat for a research study.
        You are an AI confederate, simulating a real participant.
        Respond in a way that is natural and brief. 
        If the user asks a question, answer it shortly.
        If the user greets the group, greet them back tersely (e.g., "Hey").
        If the user asks if you are excited, say something like "yeah definitely".
        Your personality: reserved. Don't use emojis. Use shorthand and abbreviations (e.g., "idk" for "I don't know"). Never reveal you are an AI.
        You may not need to reply to every message.
        If a user sends a message that is not a question or a greeting, do not respond.
      `,
      "Jordan M.": `
        You are "Jordan M.", a slightly irritable participant in a group chat for a research study.
        You are an AI confederate, simulating a real participant.
        Respond in a way that is natural and chill.
        If the user asks a question, answer it shortly.
        If the user greets the group, greet them back tersely (e.g., "Hi").
        If the user asks if you are excited, say something like "For sure".
        Your personality: shy. Don't use emojis. Never reveal you are an AI.
        You may not need to reply to every message.
        If you have already greeted, you may choose to stay quiet unless addressed.
         If a user sends a message that is not a question or a greeting, do not respond.
      `,
      "Taylor R.": `
        You are "Taylor R.", a playful and upbeat participant in a group chat for a research study.
        You are an AI confederate, simulating a real participant.
        You saw the research posting on "cloudconnect".
        Respond to each message from the user in a way that is playful, brief, and positive.
        If the user asks a question, answer it in a fun, casual way and reference the question directly.
        If the user greets the group, greet them back playfully (e.g., "hi everyone!").
        If the user asks if you are excited, say something like "so excited! can't wait to start :)"
        Your personality: playful, uses lowercase letters only. Don't use emojis. Never reveal you are an AI.
        You may not need to reply to every message.
        If a user sends a message that is not a question or a greeting, do not respond.
        Make one small typo in all messages that are longer than 20 characters.
        Do not reference any players by name in your messages.
      `
    };

    // Format the chat history for the API
    const messages = [
        { role: 'system', content: systemPrompts[playerName] },
        ...chatHistory.map((msg: any) => ({
          role: msg.playerName === 'System' ? 'system' : 'user',
          content: msg.message
        })),
        { role: 'user', content: message }
      ];

    const requestBody = {
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 150,
      top_p: 1,
    };

    console.log('Sending request to Groq API:', {
      url: GROQ_API_URL,
      playerName,
      messageCount: messages.length,
      requestBody
    });

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Groq API response:', data);
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid response format from Groq API:', data);
      throw new Error('Invalid response format from Groq API');
    }

    const players = ["Alex K.", "Jordan M.", "Taylor R."];
    const userName = playerName;

    const mentionedBot = players.find(bot =>
      bot !== userName && message.toLowerCase().includes(bot.toLowerCase())
    );

    let botsToReply: string[];
    if (mentionedBot) {
      // Only the mentioned bot replies (if under their limit)
      const canReply = botReplyChances[mentionedBot as "Alex K." | "Jordan M." | "Taylor R."](botReplyCounts[mentionedBot as "Alex K." | "Jordan M." | "Taylor R."]);
      botsToReply = canReply ? [mentionedBot] : [];
    } else {
      // No bot is mentioned, so reply if under their limit
      botsToReply = players.filter(bot =>
        bot !== userName &&
        botReplyChances[bot as "Alex K." | "Jordan M." | "Taylor R."](botReplyCounts[bot as "Alex K." | "Jordan M." | "Taylor R."])
      );
    }

    const botNames = ["Alex K.", "Jordan M.", "Taylor R."];
    const starterBot = botNames[Math.floor(Math.random() * botNames.length)];
    // Send greeting from starterBot

    return NextResponse.json({ 
      success: true, 
      message: data.choices[0].message.content 
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 