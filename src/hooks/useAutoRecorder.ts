'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAutoRecorderOptions {
  onRecordingComplete: (blob: Blob) => void;
  recordingDuration?: number; // in milliseconds
}

export function useAutoRecorder({
  onRecordingComplete,
  recordingDuration = 4000,
}: UseAutoRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);

  const cleanup = useCallback(() => {
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setTimeRemaining(0);
  }, []);

  const startRecordingCycle = useCallback(async () => {
    if (!isActiveRef.current) return;

    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      
      if (!isActiveRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      streamRef.current = stream;

      // Determine mime type
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = '';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        
        // Stop the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        setIsRecording(false);
        setTimeRemaining(0);
        
        // Only process if we have audio and still active
        if (blob.size > 1000 && isActiveRef.current) {
          onRecordingComplete(blob);
        }
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Set countdown
      const seconds = Math.ceil(recordingDuration / 1000);
      setTimeRemaining(seconds);
      
      countdownRef.current = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);

      // Auto-stop after duration
      recordingTimerRef.current = setTimeout(() => {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, recordingDuration);

    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
    }
  }, [recordingDuration, onRecordingComplete]);

  const startLoop = useCallback(() => {
    if (isActiveRef.current) return;
    isActiveRef.current = true;
    setIsActive(true);
    startRecordingCycle();
  }, [startRecordingCycle]);

  const stopLoop = useCallback(() => {
    isActiveRef.current = false;
    setIsActive(false);
    cleanup();
  }, [cleanup]);

  const triggerNextCycle = useCallback(() => {
    if (isActiveRef.current && !isRecording) {
      // Small delay before starting next recording
      setTimeout(() => {
        if (isActiveRef.current) {
          startRecordingCycle();
        }
      }, 500);
    }
  }, [isRecording, startRecordingCycle]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  return {
    isRecording,
    timeRemaining,
    isActive,
    startLoop,
    stopLoop,
    triggerNextCycle,
  };
}
