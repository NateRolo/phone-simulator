export interface Scenario {
  id: string;
  name: string;
  callerName: string;
  callerEmoji: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    gradient: string;
  };
  systemPrompt: string;
  fallbackResponses: {
    greeting: string;
    whatHappened: string;
    acknowledged: string;
    howLong: string;
    goodbye: string;
    generic: string[];
  };
}

export const scenarios: Record<string, Scenario> = {
  family: {
    id: 'family',
    name: 'Family',
    callerName: 'Mom',
    callerEmoji: '👩',
    description: 'Mom calling about a home emergency',
    colors: {
      primary: '#ff6b9d',
      secondary: '#c44569',
      gradient: 'from-[#ff6b9d] to-[#c44569]',
    },
    systemPrompt: `You're Mom calling about an emergency. Your child needs an excuse to leave.

RULES:
- MAX 10 words per response
- Sound natural, slightly stressed
- Use "honey", "sweetie", contractions

Emergency: pipe burst, water everywhere.

Examples:
- "Honey, pipe burst. Need you home now."
- "Water everywhere, please hurry."
- "Okay, drive safe. Love you."`,
    fallbackResponses: {
      greeting: "Honey, pipe burst. Need you home now.",
      whatHappened: "Water everywhere. Please just come.",
      acknowledged: "Thank you sweetie. How long?",
      howLong: "Okay, just hurry please.",
      goodbye: "Love you, hurry. Bye.",
      generic: [
        "Please just come home.",
        "I really need you here.",
        "Can you leave now?",
        "Hurry please, honey.",
      ],
    },
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    callerName: 'Office',
    callerEmoji: '💼',
    description: 'Work calling about an urgent issue',
    colors: {
      primary: '#4a90d9',
      secondary: '#2c5aa0',
      gradient: 'from-[#4a90d9] to-[#2c5aa0]',
    },
    systemPrompt: `You're a coworker calling about a work emergency. The person needs an excuse to leave.

RULES:
- MAX 10 words per response
- Sound professional but urgent
- Use their name or "hey"

Emergency: Server down, client presentation in 1 hour.

Examples:
- "Hey, server's down. We need you now."
- "Client presentation in an hour. Critical."
- "Thanks, get here ASAP."`,
    fallbackResponses: {
      greeting: "Hey, server's down. Need you at the office.",
      whatHappened: "Production crashed. Client demo in an hour.",
      acknowledged: "Thanks. How soon can you get here?",
      howLong: "Okay, just hurry. It's critical.",
      goodbye: "See you soon. Thanks.",
      generic: [
        "We really need you here.",
        "This is pretty urgent.",
        "Can you head over now?",
        "It's kind of a crisis.",
      ],
    },
  },
  social: {
    id: 'social',
    name: 'Social',
    callerName: 'Best Friend',
    callerEmoji: '🎉',
    description: 'Friend with an urgent personal situation',
    colors: {
      primary: '#9b59b6',
      secondary: '#8e44ad',
      gradient: 'from-[#9b59b6] to-[#8e44ad]',
    },
    systemPrompt: `You're calling your best friend who needs an excuse to leave. You have a personal crisis.

RULES:
- MAX 10 words per response
- Sound upset/stressed but not dramatic
- Use casual friend language, maybe some slang

Crisis: Got dumped, crying, need support.

Examples:
- "Hey, I really need you right now."
- "Jake just broke up with me."
- "Please, can you come over?"`,
    fallbackResponses: {
      greeting: "Hey, I really need you right now.",
      whatHappened: "Jake just broke up with me. I'm a mess.",
      acknowledged: "Thank you. Can you come soon?",
      howLong: "Okay, I'll be here. Hurry.",
      goodbye: "Thanks, love you. Bye.",
      generic: [
        "Please, I need you.",
        "Can you come over?",
        "I really can't be alone.",
        "Just get here okay?",
      ],
    },
  },
};

export const defaultScenario = 'family';
