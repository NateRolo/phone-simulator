export interface Scenario {
  id: string;
  name: string;
  defaultCallerName: string;
  callerName?: string; // Dynamic - set at runtime from user input
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
  randomNames: string[];
}

export const scenarios: Record<string, Scenario> = {
  parents: {
    id: 'parents',
    name: 'Parents',
    defaultCallerName: 'Mom',
    callerEmoji: '👩',
    description: 'Parent calling about an emergency',
    colors: {
      primary: '#ff6b9d',
      secondary: '#c44569',
      gradient: 'from-[#ff6b9d] to-[#c44569]',
    },
    systemPrompt: `You're a parent calling about an emergency. Your child needs an excuse to leave.

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
    randomNames: ['Mom', 'Dad', 'Mama', 'Papa', 'Mother', 'Father'],
  },
  sibling: {
    id: 'sibling',
    name: 'Sibling',
    defaultCallerName: 'Sister',
    callerEmoji: '👧',
    description: 'Sibling with an urgent situation',
    colors: {
      primary: '#9b59b6',
      secondary: '#8e44ad',
      gradient: 'from-[#9b59b6] to-[#8e44ad]',
    },
    systemPrompt: `You're calling your sibling who needs an excuse to leave. You have an urgent situation.

RULES:
- MAX 10 words per response
- Sound upset/stressed but not dramatic
- Use casual sibling language

Crisis: Locked out, keys inside, need help.

Examples:
- "Hey, I'm locked out. Need you."
- "Keys are inside. Can you come?"
- "Please hurry, it's cold."`,
    fallbackResponses: {
      greeting: "Hey, I'm locked out. Need your help.",
      whatHappened: "Left my keys inside. Can you come?",
      acknowledged: "Thank you. How soon?",
      howLong: "Okay, I'll wait. Hurry.",
      goodbye: "Thanks, see you soon.",
      generic: [
        "Please, I need you.",
        "Can you come over?",
        "I really need help.",
        "Just get here okay?",
      ],
    },
    randomNames: ['Sister', 'Brother', 'Sis', 'Bro', 'Alex', 'Sam', 'Jamie'],
  },
  colleague: {
    id: 'colleague',
    name: 'Work',
    defaultCallerName: 'Office',
    callerEmoji: '💼',
    description: 'Work colleague with an urgent issue',
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
    randomNames: ['Office', 'Work', 'Boss', 'Manager', 'HR', 'Team Lead'],
  },
};

export const defaultScenario = 'parents';
