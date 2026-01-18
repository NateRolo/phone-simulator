'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flashlight, Camera } from 'lucide-react';

interface FakeHomeScreenProps {
  timerSecondsLeft: number | null;
  onCancel: () => void;
}

export function FakeHomeScreen({ timerSecondsLeft, onCancel }: FakeHomeScreenProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #9b7bb8 0%, #a988bf 20%, #b898c8 40%, #c5a5d1 60%, #c9a8d4 80%, #b898c8 100%)'
    }}>
      {/* iOS Status bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-2 relative z-10">
        <span className="text-sm font-semibold text-white/90">TELUS Wi-Fi</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-[2px] items-end">
            <div className="w-[4px] h-[4px] rounded-sm bg-white/50" />
            <div className="w-[4px] h-[6px] rounded-sm bg-white/50" />
            <div className="w-[4px] h-[8px] rounded-sm bg-white" />
            <div className="w-[4px] h-[10px] rounded-sm bg-white" />
          </div>
          <svg className="w-5 h-4 ml-2" viewBox="0 0 24 16" fill="white">
            <path d="M1 8C3.5 3.5 7.5 1 12 1s8.5 2.5 11 7c-2.5 4.5-6.5 7-11 7S3.5 12.5 1 8z" fillOpacity="0.9"/>
          </svg>
          <div className="flex items-center ml-1">
            <div className="w-7 h-3.5 rounded-[4px] border-2 border-white/60 relative p-[2px]">
              <div className="h-full w-[70%] rounded-[2px] bg-white" />
            </div>
            <div className="w-1 h-2 bg-white/60 rounded-r-sm ml-[1px]" />
          </div>
        </div>
      </div>

      {/* Date & Time display - iOS Lock Screen style */}
      <div className="text-center pt-12 relative z-10">
        <motion.p
          className="text-xl text-white/90 font-light mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {formatDate(time)}
        </motion.p>
        <motion.h1
          className="text-[96px] font-extralight text-white leading-none tracking-tight"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ fontWeight: 200 }}
        >
          {formatTime(time)}
        </motion.h1>
      </div>

      {/* Hidden cancel - tap the time area */}
      <button
        onClick={onCancel}
        className="absolute top-24 left-1/2 -translate-x-1/2 w-64 h-32 opacity-0"
        aria-label="Cancel timer"
      />

      {/* Timer indicator - very subtle dot */}
      {timerSecondsLeft !== null && timerSecondsLeft > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-[220px] left-1/2 -translate-x-1/2"
        >
          <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
        </motion.div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom action buttons - Flashlight & Camera (iOS Lock Screen) */}
      <div className="flex justify-between items-end px-10 pb-10 relative z-10">
        <motion.button
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(80, 60, 90, 0.6)' }}
          whileTap={{ scale: 0.95, backgroundColor: 'rgba(100, 80, 110, 0.8)' }}
        >
          <Flashlight className="w-7 h-7 text-white" />
        </motion.button>

        <motion.button
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(80, 60, 90, 0.6)' }}
          whileTap={{ scale: 0.95, backgroundColor: 'rgba(100, 80, 110, 0.8)' }}
        >
          <Camera className="w-7 h-7 text-white" />
        </motion.button>
      </div>

      {/* Home indicator */}
      <div className="flex justify-center pb-2 relative z-10">
        <div className="w-32 h-1 bg-white/50 rounded-full" />
      </div>
    </div>
  );
}
