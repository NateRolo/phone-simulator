'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wifi, 
  Battery, 
  Signal,
  Camera,
  Settings,
  Music,
  Calendar,
  Mail,
  MessageCircle,
  Clock,
  Cloud,
  Map,
  Image,
  Calculator,
  Compass,
  Phone,
} from 'lucide-react';

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
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // App grid - looks like a real phone
  const apps = [
    { icon: Phone, label: 'Phone', color: '#34c759' },
    { icon: MessageCircle, label: 'Messages', color: '#34c759' },
    { icon: Mail, label: 'Mail', color: '#007aff' },
    { icon: Camera, label: 'Camera', color: '#555' },
    { icon: Image, label: 'Photos', color: '#ff9500' },
    { icon: Music, label: 'Music', color: '#fc3c44' },
    { icon: Map, label: 'Maps', color: '#34c759' },
    { icon: Calendar, label: 'Calendar', color: '#ff3b30' },
    { icon: Clock, label: 'Clock', color: '#000' },
    { icon: Cloud, label: 'Weather', color: '#5ac8fa' },
    { icon: Calculator, label: 'Calculator', color: '#1c1c1e' },
    { icon: Settings, label: 'Settings', color: '#8e8e93' },
  ];

  // Dock apps
  const dockApps = [
    { icon: Phone, color: '#34c759' },
    { icon: MessageCircle, color: '#34c759' },
    { icon: Compass, color: '#007aff' },
    { icon: Music, color: '#fc3c44' },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f0f23] relative overflow-hidden">
      {/* Wallpaper effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-purple-500/30 blur-3xl" />
        <div className="absolute bottom-40 right-10 w-60 h-60 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-1 relative z-10">
        <span className="text-xs font-medium text-white/90">
          {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })}
        </span>
        <div className="flex items-center gap-1">
          <Signal className="w-4 h-4 text-white/90" />
          <Wifi className="w-4 h-4 text-white/90" />
          <Battery className="w-5 h-5 text-white/90" />
        </div>
      </div>

      {/* Time & Date display */}
      <div className="text-center py-8 relative z-10">
        <motion.h1 
          className="text-6xl font-light text-white tracking-tight"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {formatTime(time)}
        </motion.h1>
        <p className="text-lg text-white/70 mt-1">{formatDate(time)}</p>
      </div>

      {/* App Grid */}
      <div className="flex-1 px-6 relative z-10">
        <div className="grid grid-cols-4 gap-4">
          {apps.map((app, index) => (
            <motion.div
              key={app.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              className="flex flex-col items-center"
            >
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: app.color }}
              >
                <app.icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-[10px] text-white/80 mt-1 truncate w-full text-center">
                {app.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Hidden cancel - tap the clock area multiple times or long press */}
      <button 
        onClick={onCancel}
        className="absolute top-16 left-1/2 -translate-x-1/2 w-48 h-20 opacity-0"
        aria-label="Cancel timer"
      />

      {/* Timer indicator - very subtle */}
      {timerSecondsLeft !== null && timerSecondsLeft > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-[100px] left-1/2 -translate-x-1/2"
        >
          <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
        </motion.div>
      )}

      {/* Dock */}
      <div className="px-4 pb-6 relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-3">
          <div className="flex justify-around">
            {dockApps.map((app, index) => (
              <div
                key={index}
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: app.color }}
              >
                <app.icon className="w-7 h-7 text-white" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Home indicator */}
      <div className="flex justify-center pb-2">
        <div className="w-32 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  );
}
