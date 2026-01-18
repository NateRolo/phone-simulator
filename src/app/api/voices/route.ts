import { NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export async function GET() {
  try {
    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch voices' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Return a simplified list of voices
    const voices = data.voices.map((voice: { voice_id: string; name: string; labels?: { accent?: string; gender?: string } }) => ({
      id: voice.voice_id,
      name: voice.name,
      accent: voice.labels?.accent || 'Unknown',
      gender: voice.labels?.gender || 'Unknown',
    }));

    return NextResponse.json({ voices });
  } catch (error) {
    console.error('Voices API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
