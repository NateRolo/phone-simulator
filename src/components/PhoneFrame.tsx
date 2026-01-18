'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PhoneFrameProps {
  children: ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Phone outer frame */}
      <div className="relative w-[380px] h-[780px] rounded-[55px] bg-gradient-to-b from-[#2a2a3a] to-[#1a1a24] p-[3px] shadow-2xl shadow-black/50">
        {/* Phone inner bezel */}
        <div className="relative w-full h-full rounded-[52px] bg-[#0a0a0f] overflow-hidden">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
            <div className="w-[120px] h-[35px] bg-black rounded-full flex items-center justify-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#1a1a24] ring-1 ring-[#2a2a3a]" />
              <div className="w-2 h-2 rounded-full bg-[#00ff88]/30" />
            </div>
          </div>

          {/* Screen content */}
          <div className="relative w-full h-full pt-14 pb-6 px-4">
            {children}
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <div className="w-32 h-1 rounded-full bg-white/30" />
          </div>
        </div>

        {/* Side buttons */}
        <div className="absolute -left-[2px] top-32 w-[3px] h-8 bg-[#3a3a4a] rounded-l-sm" />
        <div className="absolute -left-[2px] top-48 w-[3px] h-16 bg-[#3a3a4a] rounded-l-sm" />
        <div className="absolute -left-[2px] top-[280px] w-[3px] h-16 bg-[#3a3a4a] rounded-l-sm" />
        <div className="absolute -right-[2px] top-44 w-[3px] h-20 bg-[#3a3a4a] rounded-r-sm" />
      </div>

      {/* Ambient glow */}
      <div className="absolute inset-0 -z-10 blur-3xl opacity-20">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#00ff88]" />
      </div>
    </motion.div>
  );
}
