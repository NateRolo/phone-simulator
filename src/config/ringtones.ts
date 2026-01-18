export interface Ringtone {
  id: string;
  name: string;
  description: string;
  // URL to audio file or 'vibrate' for vibration only
  audioUrl: string | null;
  // Whether to also vibrate
  vibrate: boolean;
}

export const ringtones: Ringtone[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional phone ring',
    // Using a classic phone ring sound from a CDN
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
    vibrate: true,
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Soft digital tone',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/1361/1361-preview.mp3',
    vibrate: true,
  },
  {
    id: 'urgent',
    name: 'Urgent',
    description: 'Attention-grabbing alert',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2645/2645-preview.mp3',
    vibrate: true,
  },
  {
    id: 'subtle',
    name: 'Subtle',
    description: 'Quiet, gentle ring',
    audioUrl: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    vibrate: false,
  },
  {
    id: 'vibrate',
    name: 'Vibrate Only',
    description: 'Silent with vibration',
    audioUrl: null,
    vibrate: true,
  },
  {
    id: 'silent',
    name: 'Silent',
    description: 'No sound or vibration',
    audioUrl: null,
    vibrate: false,
  },
];

export const defaultRingtone = 'classic';
