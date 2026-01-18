import { NextRequest, NextResponse } from 'next/server';
import { scenarios, defaultScenario, Scenario } from '@/config/scenarios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

function getFallbackResponse(userMessage: string, scenario: Scenario): string {
  const lowerMessage = userMessage.toLowerCase();
  const fallback = scenario.fallbackResponses;
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return fallback.greeting;
  }
  
  if (lowerMessage.includes('what') || lowerMessage.includes('happen')) {
    return fallback.whatHappened;
  }
  
  if (lowerMessage.includes('coming') || lowerMessage.includes('on my way') || lowerMessage.includes('be there') || 
      lowerMessage.includes('okay') || lowerMessage.includes('ok') || lowerMessage.includes('alright')) {
    return fallback.acknowledged;
  }
  
  if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
    return fallback.goodbye;
  }

  if (lowerMessage.includes('minutes') || lowerMessage.includes('soon') || lowerMessage.includes('long')) {
    return fallback.howLong;
  }
  
  return fallback.generic[Math.floor(Math.random() * fallback.generic.length)];
}

export async function POST(request: NextRequest) {
  try {
    const { messages, scenarioId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const scenario = scenarios[scenarioId] || scenarios[defaultScenario];
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'caller')?.content || '';

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ 
        response: getFallbackResponse(lastUserMessage, scenario),
        fallback: true 
      });
    }

    const chatMessages: ChatMessage[] = [
      { role: 'system', content: scenario.systemPrompt },
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
        response: getFallbackResponse(lastUserMessage, scenario),
        fallback: true 
      });
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || getFallbackResponse(lastUserMessage, scenario);

    return NextResponse.json({ 
      response: assistantMessage.trim() 
    });
  } catch (error) {
    console.error('Chat API error:', error);
    const scenario = scenarios[defaultScenario];
    return NextResponse.json({ 
      response: scenario.fallbackResponses.generic[0],
      fallback: true 
    });
  }
}
