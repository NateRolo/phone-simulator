'use client';

import { motion } from 'framer-motion';

interface WaveformVisualizerProps {
  isActive: boolean;
  color?: string;
  barCount?: number;
}

export function WaveformVisualizer({ 
  isActive, 
  color = '#00ff88',
  barCount = 7 
}: WaveformVisualizerProps) {
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ backgroundColor: color }}
          animate={
            isActive
              ? {
                  height: [8, 20 + Math.random() * 12, 8],
                }
              : { height: 8 }
          }
          transition={
            isActive
              ? {
                  duration: 0.4 + Math.random() * 0.3,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: i * 0.1,
                  ease: 'easeInOut',
                }
              : { duration: 0.2 }
          }
        />
      ))}
    </div>
  );
}
