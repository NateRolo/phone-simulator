export type TimerPreset = {
  label: string;
  seconds: number;
};

export type IntensityLevel = 'medium' | 'high';

export interface AppConfig {
  timerSeconds: number | null; // null = instant
  intensity: IntensityLevel;
  safePin: string;
  scenarioId: string;
  customCallerName: string;
  planName?: string;
}

export type AppPhase = 
  | 'setup'      // User configuring settings
  | 'waiting'    // Fake home screen, waiting for timer
  | 'ringing'    // Incoming call
  | 'connected'  // In call
  | 'ended'      // Call just ended (brief state before next action)
  | 'pin-entry'  // Entering safe PIN to exit high intensity mode
  | 'safe';      // Successfully exited with PIN

export const TIMER_PRESETS: TimerPreset[] = [
  { label: 'Instant', seconds: 0 },
  { label: '30s', seconds: 30 },
  { label: '1 min', seconds: 60 },
  { label: '2 min', seconds: 120 },
  { label: '5 min', seconds: 300 },
];

export const MAX_CALLS_HIGH_INTENSITY = 5;
export const DELAY_BETWEEN_CALLS_MS = 7000; // 7 seconds between calls
