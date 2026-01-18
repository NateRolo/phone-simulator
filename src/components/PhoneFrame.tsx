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
      {/* Phone outer frame - iPhone style */}
      <div className="relative w-[380px] h-[780px] rounded-[55px] bg-gradient-to-b from-[#3a3a3c] to-[#1c1c1e] p-[3px] shadow-2xl shadow-black/50">
        {/* Phone inner bezel */}
        <div className="relative w-full h-full rounded-[52px] bg-black overflow-hidden">
          {/* Dynamic Island */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
            <div className="w-[120px] h-[35px] bg-black rounded-full flex items-center justify-center gap-3 border border-[#1c1c1e]">
              <div className="w-3 h-3 rounded-full bg-[#1c1c1e]" />
              <div className="w-2 h-2 rounded-full bg-[#48484a]" />
            </div>
          </div>

          {/* Screen content */}
          <div className="relative w-full h-full">
            {children}
          </div>
        </div>

        {/* Side buttons - iPhone style */}
        {/* Silent switch */}
        <div className="absolute -left-[2px] top-32 w-[3px] h-8 bg-[#48484a] rounded-l-sm" />
        {/* Volume buttons */}
        <div className="absolute -left-[2px] top-48 w-[3px] h-14 bg-[#48484a] rounded-l-sm" />
        <div className="absolute -left-[2px] top-[270px] w-[3px] h-14 bg-[#48484a] rounded-l-sm" />
        {/* Power button */}
        <div className="absolute -right-[2px] top-44 w-[3px] h-24 bg-[#48484a] rounded-r-sm" />
      </div>

      {/* Ambient glow - iOS purple/blue theme */}
      <div className="absolute inset-0 -z-10 blur-3xl opacity-15">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-[#667eea] to-[#ce93d8]" />
      </div>
    </motion.div>
  );
}
