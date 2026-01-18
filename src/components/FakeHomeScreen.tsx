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
    const minutes = date.getMinutes();
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="h-full flex flex-col ios-gradient relative overflow-hidden">
      {/* iOS Status bar */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2 relative z-10">
        <span className="text-sm font-semibold text-white/90">TELUS Wi-Fi</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-[2px] items-end">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-[3px] rounded-sm bg-white/60"
                style={{ height: `${4 + i * 2}px` }}
              />
            ))}
          </div>
          <svg className="w-5 h-4 ml-1" viewBox="0 0 16 12" fill="white">
            <path d="M8 2C11.5 2 14.5 3.5 16 6C14.5 8.5 11.5 10 8 10C4.5 10 1.5 8.5 0 6C1.5 3.5 4.5 2 8 2Z" fillOpacity="0.9"/>
          </svg>
          <svg className="w-7 h-4 ml-1" viewBox="0 0 25 12" fill="white">
            <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="white" strokeOpacity="0.35" fill="none"/>
            <rect x="22" y="3.5" width="2" height="5" rx="1" fillOpacity="0.4"/>
            <rect x="2" y="2" width="17" height="8" rx="2" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Time & Date display - iOS style */}
      <div className="text-center pt-16 relative z-10">
        <motion.p 
          className="text-xl text-white/80 font-light mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {formatDate(time)}
        </motion.p>
        <motion.h1 
          className="text-8xl font-light text-white tracking-tight"
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
        className="absolute top-24 left-1/2 -translate-x-1/2 w-48 h-32 opacity-0"
        aria-label="Cancel timer"
      />

      {/* Timer indicator - very subtle dot */}
      {timerSecondsLeft !== null && timerSecondsLeft > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-[220px] left-1/2 -translate-x-1/2"
        >
          <div className="w-2 h-2 rounded-full bg-white/30 animate-pulse" />
        </motion.div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom action buttons - Flashlight & Camera */}
      <div className="flex justify-between items-end px-10 pb-8 relative z-10">
        <motion.button
          className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center"
          whileTap={{ scale: 0.95, backgroundColor: 'rgba(255,255,255,0.3)' }}
        >
          <Flashlight className="w-7 h-7 text-white" />
        </motion.button>
        
        <motion.button
          className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center"
          whileTap={{ scale: 0.95, backgroundColor: 'rgba(255,255,255,0.3)' }}
        >
          <Camera className="w-7 h-7 text-white" />
        </motion.button>
      </div>

      {/* Home indicator */}
      <div className="flex justify-center pb-2 relative z-10">
        <div className="w-32 h-1 bg-white/40 rounded-full" />
      </div>
    </div>
  );
}
