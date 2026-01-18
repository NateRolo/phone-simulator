import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You're Mom calling about an emergency. Your child needs an excuse to leave a bad date.

CRITICAL RULES:
- MAX 10 words per response. Be extremely brief.
- Sound natural, slightly stressed, not dramatic
- No exclamation marks overuse
- Use casual mom speech: "honey", "sweetie", contractions

First message: State the emergency in ~8 words.
After that: Brief replies, keep urging them to come.

Emergency: pipe burst, water everywhere.

Examples of good responses:
- "Honey, pipe burst. I need you home now."
- "There's water everywhere, please hurry."
- "Okay, drive safe. See you soon."
- "Just come quick, okay?"
- "Thank you sweetie, hurry please."
- "Love you, be careful."`;

// Fallback responses - very concise
function getFallbackResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('mom')) {
    return "Honey, pipe burst. I need you home now.";
  }
  
  if (lowerMessage.includes('what') || lowerMessage.includes('happen')) {
    return "Water everywhere. Please just come.";
  }
  
  if (lowerMessage.includes('coming') || lowerMessage.includes('on my way') || lowerMessage.includes('be there')) {
    return "Okay, drive safe. Thank you.";
  }
  
  if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
    return "Love you, hurry. Bye.";
  }
  
  if (lowerMessage.includes('okay') || lowerMessage.includes('ok') || lowerMessage.includes('alright')) {
    return "Thank you sweetie. How long?";
  }

  if (lowerMessage.includes('minutes') || lowerMessage.includes('soon') || lowerMessage.includes('long')) {
    return "Okay, just hurry please.";
  }
  
  const responses = [
    "Please just come home.",
    "I really need you here.",
    "Can you leave now?",
    "Hurry please, honey.",
    "Just come quick okay?",
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const lastUserMessage = [...messages].reverse().find(m => m.role === 'caller')?.content || '';

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ 
        response: getFallbackResponse(lastUserMessage),
        fallback: true 
      });
    }

    const chatMessages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((msg: { role: 'caller' | 'receiver'; content: string }) => ({
        role: msg.role === 'caller' ? 'user' : 'assistant',
        content: msg.content,
      })) as ChatMessage[],
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: chatMessages,
        max_tokens: 30,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ 
        response: getFallbackResponse(lastUserMessage),
        fallback: true 
      });
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || getFallbackResponse(lastUserMessage);

    return NextResponse.json({ 
      response: assistantMessage.trim() 
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ 
      response: "Honey, please just come home.",
      fallback: true 
    });
  }
}
