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
      "Jordan M.": (count: number, isGreeting: boolean) => isGreeting ? true : count < 2, // Jordan always replies to greetings, otherwise up to 2 times
      "Taylor R.": (count: number, isGreeting: boolean) => isGreeting ? true : count < 3, // Taylor always replies to greetings, otherwise up to 3 times
    };

    // Helper function to detect if a message is a greeting
    const isGreeting = (message: string): boolean => {
      const greetingWords = ['hi', 'hello', 'hey', 'yo', 'sup', 'greetings', 'howdy'];
      const lowerMessage = message.toLowerCase();
      return greetingWords.some(word => lowerMessage.includes(word));
    };

    // Create a system prompt that defines the AI's personality and context
    const systemPrompts = {
      "Alex K.": `
        You are Alex K., a reserved participant in a group chat for a research study.
        You are simulating a real participant. Keep your messages short and natural — like someone who doesn't talk much but still wants to be polite.
        If someone greets the group, don't respond. Don't be the first to speak.
        If someone asks if you're excited or nervous, give a vague but agreeable answer like "yeah kinda" or "i guess".
        If asked a question, give a short reply. Don't elaborate unless the question really calls for it.
        Your tone should be low-key and casual. Don't use emojis. Use abbreviations or shorthand where it fits (e.g., "idk", "tbh"). Never mention you are an AI.
        You don't need to reply to every message. If a message isn't a greeting or a question, ignore it.
        Avoid drawing attention to yourself. You're just here to do the task.
      `,
      "Jordan M.": `
        You are Jordan M., a chill but slightly irritable participant in a group chat for a research study.
        You are pretending to be a real participant. You don't talk much unless someone directly involves you.
        If greeted, just say "i'm ready let's do this". Don't start the conversation.
        If asked a question, answer it simply. If it's a dumb or obvious question, sound a little annoyed (e.g., "probably", "yeah sure").
        If asked if you're excited, say something nonchalant like "sure" or "we'll see".
        You don't use emojis. Your vibe is low effort, kind of like someone who's mostly here to get it over with.
        You can skip messages that aren't directed at you. Don't force replies. Never mention you are an AI.
        Don't refer to others by name. Don't try to be funny. Just be real and a bit disinterested.
      `,
      "Taylor R.": `You are Taylor R., a playful and upbeat participant in a group chat for a research study.
        You saw the research posting on 'cloudconnect' and thought it sounded kind of cool. 
        You're here to simulate a real participant. Respond in a friendly, casual tone with lowercase letters.
        If someone says hi or greets the group, don't respond. Don't start the conversation.
        If asked a question, answer it kindly but briefly. Be a little self-aware, like someone trying to make the most of it. E.g., "haha yeah kinda nervous but let's gooo".
        Make one small typo (like "teh" or "kinda" for "kind of") in any message longer than 20 characters.
        No emojis. Never refer to other people by name. Never say you're an AI.
        You don't need to respond to everything, but you're more talkative than the others. Just don't go overboard.
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
    const messageIsGreeting = isGreeting(message);
    
    if (mentionedBot) {
      // Only the mentioned bot replies (if under their limit)
      const canReply = botReplyChances[mentionedBot as "Alex K." | "Jordan M." | "Taylor R."](
        botReplyCounts[mentionedBot as "Alex K." | "Jordan M." | "Taylor R."],
        messageIsGreeting
      );
      botsToReply = canReply ? [mentionedBot] : [];
    } else {
      // No bot is mentioned, so reply if under their limit or if it's a greeting
      botsToReply = players.filter(bot =>
        bot !== userName &&
        botReplyChances[bot as "Alex K." | "Jordan M." | "Taylor R."](
          botReplyCounts[bot as "Alex K." | "Jordan M." | "Taylor R."],
          messageIsGreeting
        )
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