'use client';

import { PhoneSimulator } from '@/components/PhoneSimulator';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-[--color-bg-dark] flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00ff88]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00ccff]/5 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute top-8 left-1/2 -translate-x-1/2 text-center"
      >
        <h1 className="text-3xl font-bold gradient-text mb-2">Fake Call</h1>
        <p className="text-[#888899] text-sm">Your emergency escape from awkward situations</p>
      </motion.div>

      {/* Main content */}
      <main className="relative z-10">
        <PhoneSimulator />
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center"
      >
        <p className="text-[#888899] text-xs">
          Built with Next.js • Powered by ElevenLabs API
        </p>
      </motion.footer>
    </div>
  );
}
