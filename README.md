# You Good? - Your Discreet Exit Strategy

A realistic fake phone call simulator to help you gracefully exit any situation. Features AI-powered callers (parents, siblings, work) with urgent emergencies, complete with voice synthesis and natural conversation.

## Features

- 📞 Realistic phone UI with incoming call simulation
- 🎤 Push-to-talk voice input (hold mic button to speak)
- 🗣️ AI-generated voice responses via ElevenLabs
- 🤖 Context-aware conversation powered by OpenAI GPT
- 👩 "Mom" persona with believable emergencies

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion
- **Voice Synthesis:** ElevenLabs TTS API
- **Speech-to-Text:** ElevenLabs STT API
- **AI Chat:** OpenAI GPT-4o-mini

## Getting Started

### 1. Clone and Install

```bash
git clone <repo-url>
cd phone-simulator
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the project root:

```env
# Required - ElevenLabs API Key
# Get yours at: https://elevenlabs.io/api
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Optional - OpenAI API Key (for smarter AI responses)
# Get yours at: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key
```

> **Note:** The app works without the OpenAI key using fallback responses, but conversations will be more dynamic with it.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. **Tap the call button** to receive an "incoming call" from Mom
2. **Answer the call** - Mom will explain her emergency
3. **Hold the mic button** and speak your responses
4. **Release** to send - your speech is transcribed and Mom responds
5. **End the call** when ready to make your escape!

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/           # OpenAI chat completions
│   │   ├── conversation/   # ElevenLabs TTS
│   │   ├── transcribe/     # ElevenLabs STT
│   │   └── voices/         # Available voices list
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── CallScreen.tsx      # Call states (idle/ringing/connected)
│   ├── ConversationView.tsx # Message bubbles
│   ├── MessageInput.tsx    # Text/voice input
│   ├── PhoneFrame.tsx      # Phone UI wrapper
│   ├── PhoneSimulator.tsx  # Main component
│   └── WaveformVisualizer.tsx
└── hooks/
    ├── useAudioRecorder.ts # MediaRecorder wrapper
    └── useConversation.ts  # Call state management
```

## API Keys

### ElevenLabs (Required)
1. Sign up at [elevenlabs.io](https://elevenlabs.io)
2. Go to Profile → API Keys
3. Copy your API key

### OpenAI (Optional)
1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Go to API Keys → Create new key
3. Add billing for higher rate limits

## Troubleshooting

### "Microphone permission denied"
- Check browser permissions for localhost
- Ensure no other app is using the microphone

### 429 Rate Limit Error
- OpenAI rate limits - add billing or wait
- App will use fallback responses automatically

### Voice not playing
- Check browser autoplay settings
- Ensure volume is up

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally
4. Submit a PR

## License

MIT
