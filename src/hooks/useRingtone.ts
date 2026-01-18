'use client';

import { useRef, useCallback, useState } from 'react';
import { ringtones, defaultRingtone, Ringtone } from '@/config/ringtones';

// Vibration pattern for phone calls (in milliseconds)
// Pattern: vibrate 500ms, pause 500ms, repeat
const VIBRATION_PATTERN = [500, 500, 500, 500, 500, 500];

export function useRingtone() {
  const [selectedRingtoneId, setSelectedRingtoneId] = useState<string>(defaultRingtone);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const vibrationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const selectedRingtone = ringtones.find(r => r.id === selectedRingtoneId) || ringtones[0];

  const startVibration = useCallback(() => {
    // Check if vibration API is supported
    if ('vibrate' in navigator) {
      // Start vibration pattern
      navigator.vibrate(VIBRATION_PATTERN);
      
      // Repeat the vibration pattern
      vibrationIntervalRef.current = setInterval(() => {
        navigator.vibrate(VIBRATION_PATTERN);
      }, 3000); // Repeat every 3 seconds
    }
  }, []);

  const stopVibration = useCallback(() => {
    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
      vibrationIntervalRef.current = null;
    }
    
    // Stop any ongoing vibration
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
  }, []);

  const play = useCallback(() => {
    if (isPlaying) return;
    
    setIsPlaying(true);

    // Handle vibration
    if (selectedRingtone.vibrate) {
      startVibration();
    }

    // Handle audio
    if (selectedRingtone.audioUrl) {
      try {
        audioRef.current = new Audio(selectedRingtone.audioUrl);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.7;
        
        audioRef.current.play().catch(err => {
          console.warn('Failed to play ringtone:', err);
          // Audio autoplay might be blocked, that's okay
        });
      } catch (err) {
        console.warn('Failed to create audio:', err);
      }
    }
  }, [isPlaying, selectedRingtone, startVibration]);

  const stop = useCallback(() => {
    setIsPlaying(false);
    
    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    
    // Stop vibration
    stopVibration();
  }, [stopVibration]);

  const previewRingtone = useCallback((ringtoneId: string) => {
    // Stop any current preview
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    const ringtone = ringtones.find(r => r.id === ringtoneId);
    if (!ringtone || !ringtone.audioUrl) {
      // For vibrate-only, do a short vibration
      if (ringtone?.vibrate && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
      return;
    }
    
    try {
      const previewAudio = new Audio(ringtone.audioUrl);
      previewAudio.volume = 0.5;
      
      // Play for 2 seconds then stop
      previewAudio.play().catch(() => {});
      setTimeout(() => {
        previewAudio.pause();
      }, 2000);
      
      // Vibrate briefly if enabled
      if (ringtone.vibrate && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch (err) {
      console.warn('Failed to preview ringtone:', err);
    }
  }, []);

  return {
    ringtones,
    selectedRingtoneId,
    selectedRingtone,
    setSelectedRingtoneId,
    isPlaying,
    play,
    stop,
    previewRingtone,
  };
}
