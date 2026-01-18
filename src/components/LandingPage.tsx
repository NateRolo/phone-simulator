'use client';

import { motion } from 'framer-motion';
import { Shield, ChevronsRight, Zap, Users, Timer } from 'lucide-react';
import { PhoneFrame } from './PhoneFrame';
import { FakeHomeScreen } from './FakeHomeScreen';

interface LandingPageProps {
  onLaunch: () => void;
}

export function LandingPage({ onLaunch }: LandingPageProps) {
  const featureList = [
    {
      icon: Users,
      title: 'Custom Scenarios',
      description: "Choose from parents, siblings, or work to create the perfect excuse.",
    },
    {
      icon: Timer,
      title: 'Timed or Instant',
      description: "Set a timer for a future call or trigger one instantly when you need it.",
    },
    {
      icon: Zap,
      title: 'Realistic Voices',
      description: "Powered by ElevenLabs, the AI voice sounds natural and convincing.",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] text-white overflow-x-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <Shield className="w-6 h-6 text-[#00ff88]" />
            <span className="font-bold text-lg">You Good?</span>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={onLaunch}
            className="px-4 py-2 text-sm font-semibold bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            Launch App
          </motion.button>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-32 pb-16">
        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center min-h-[600px]">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Your Discreet <span className="gradient-text">Exit Strategy</span>, On-Demand.
            </h1>
            <p className="text-lg text-[#888899] mb-8">
              Generate a realistic, AI-powered phone call to gracefully exit any situation. Simple to set up, and incredibly convincing.
            </p>
            <motion.button
              onClick={onLaunch}
              className="flex items-center gap-2 px-8 py-4 font-semibold bg-[#00ff88] text-black rounded-xl text-lg shadow-lg shadow-[#00ff88]/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started <ChevronsRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative flex items-center justify-center"
          >
            <div className="transform scale-[0.9] origin-center">
              <PhoneFrame>
                <FakeHomeScreen timerSecondsLeft={null} onCancel={() => {}} />
              </PhoneFrame>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <section className="mt-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-center mb-4">Why It Works</h2>
            <p className="text-center text-[#888899] mb-12 max-w-2xl mx-auto">
              You Good? is more than just a fake ringtone. It's an interactive, believable experience designed to give you the perfect out.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {featureList.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass p-6 rounded-2xl"
              >
                <div className="w-12 h-12 rounded-xl bg-[#00ff88]/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#00ff88]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-[#888899]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mt-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Three Simple Steps</h2>
            <p className="text-[#888899] mb-12 max-w-2xl mx-auto">
              Go from awkward situation to freedom in under a minute.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Dashed lines connecting steps */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px -translate-y-10">
              <svg width="100%" height="2">
                <line x1="0" y1="1" x2="100%" y2="1" stroke="#888899" strokeWidth="2" strokeDasharray="8 8" />
              </svg>
            </div>
            
            {['Setup', 'Wait', 'Escape'].map((step, index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative z-10"
              >
                <div className="w-16 h-16 rounded-full bg-[#2a2a3a] text-[#00ff88] flex items-center justify-center text-2xl font-bold mx-auto mb-4 border-2 border-[#00ff88]/50">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step}</h3>
                <p className="text-[#888899] px-4">
                  {
                    step === 'Setup' ? "Choose your caller, voice, and when you want the call." :
                    step === 'Wait' ? "Your phone looks normal. The call will arrive as scheduled." :
                    "Answer the call and have a real, AI-powered conversation."
                  }
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-24 py-8">
        <div className="container mx-auto text-center text-[#555]">
          <p>&copy; 2026 You Good? Your discreet exit strategy.</p>
        </div>
      </footer>
    </div>
  );
}
