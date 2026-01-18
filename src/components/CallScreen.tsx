'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, Volume2 } from 'lucide-react';
import { WaveformVisualizer } from './WaveformVisualizer';
import { ConversationState } from '@/hooks/useConversation';
import { Scenario } from '@/config/scenarios';

interface CallScreenProps {
  state: ConversationState;
  onAnswer: () => void;
  onDecline: () => void;
  onEndCall: () => void;
  onEmergencyOverride?: () => void;
  scenario: Scenario;
  showDeclineButton?: boolean;
}

export function CallScreen({
  state,
  onAnswer,
  onDecline,
  onEndCall,
  onEmergencyOverride,
  scenario,
  showDeclineButton = true,
}: CallScreenProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Status bar simulation */}
      <div className="flex justify-between items-center px-2 py-1 text-xs text-white/60">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-[2px]">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-[3px] rounded-sm bg-white/60"
                style={{ height: `${i * 3}px` }}
              />
            ))}
          </div>
          <span className="ml-1">5G</span>
          <div className="ml-2 w-6 h-3 rounded-sm border border-white/60 relative">
            <div 
              className="absolute inset-[2px] right-1 rounded-[1px]" 
              style={{ backgroundColor: scenario.colors.primary }}
            />
          </div>
        </div>
      </div>

      {/* Main call content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {state.status === 'ringing' && (
            <motion.div
              key="ringing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-8"
            >
              {/* Animated avatar with rings */}
              <div className="relative">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: scenario.colors.primary }}
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
                <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${scenario.colors.gradient} p-[3px] relative z-10`}>
                  <div className="w-full h-full rounded-full bg-[#1a1a24] flex items-center justify-center">
                    <span className="text-4xl">{scenario.callerEmoji}</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                {/* Hidden emergency override - looks like normal text */}
                <button
                  onClick={onEmergencyOverride}
                  className="text-2xl font-semibold text-white mb-2 cursor-default focus:outline-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {scenario.callerName}
                </button>
                <motion.p
                  style={{ color: scenario.colors.primary }}
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  Incoming call...
                </motion.p>
              </div>

              {/* Answer/Decline buttons */}
              <div className="flex items-center gap-8">
                {showDeclineButton && (
                  <motion.button
                    onClick={onDecline}
                    className="w-16 h-16 rounded-full bg-[#ff6b6b] flex items-center justify-center shadow-lg shadow-[#ff6b6b]/30"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PhoneOff className="w-6 h-6 text-white" />
                  </motion.button>
                )}
                <motion.button
                  onClick={onAnswer}
                  className="w-20 h-20 rounded-full bg-[#00ff88] flex items-center justify-center shadow-lg shadow-[#00ff88]/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Phone className="w-8 h-8 text-black" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {state.status === 'connected' && (
            <motion.div
              key="connected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 w-full"
            >
              {/* Compact avatar */}
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${scenario.colors.gradient} p-[2px]`}>
                <div className="w-full h-full rounded-full bg-[#1a1a24] flex items-center justify-center">
                  <span className="text-3xl">{scenario.callerEmoji}</span>
                </div>
              </div>

              <div className="text-center">
                {/* Hidden emergency override during call too */}
                <button
                  onClick={onEmergencyOverride}
                  className="text-xl font-semibold text-white cursor-default focus:outline-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {scenario.callerName}
                </button>
                <p className="text-sm" style={{ color: scenario.colors.primary }}>
                  {formatDuration(state.duration)}
                </p>
              </div>

              {/* Waveform when speaking */}
              <div className="h-12 flex items-center">
                {state.isSpeaking && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <WaveformVisualizer
                      isActive={state.isSpeaking}
                      color={state.currentSpeaker === 'caller' ? '#ff6b6b' : scenario.colors.primary}
                    />
                  </motion.div>
                )}
              </div>

              {/* Speaking indicator */}
              {state.currentSpeaker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-2 rounded-full glass text-sm"
                >
                  <span className="text-[#888899]">
                    {state.currentSpeaker === 'receiver' 
                      ? `${scenario.callerEmoji} ${scenario.callerName} speaking...` 
                      : '🎤 You speaking...'}
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}

          {state.status === 'ended' && (
            <motion.div
              key="ended"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="w-24 h-24 rounded-full bg-[#2a2a3a] flex items-center justify-center">
                <PhoneOff className="w-10 h-10 text-[#888899]" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white mb-1">Call Ended</h2>
                <p className="text-[#888899]">Duration: {formatDuration(state.duration)}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom controls (visible during call) */}
      {state.status === 'connected' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-6 pb-8"
        >
          <button className="w-14 h-14 rounded-full bg-[#2a2a3a] flex items-center justify-center">
            <Mic className="w-6 h-6 text-white" />
          </button>
          <motion.button
            onClick={onEndCall}
            className="w-14 h-14 rounded-full bg-[#ff6b6b] flex items-center justify-center shadow-lg shadow-[#ff6b6b]/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </motion.button>
          <button className="w-14 h-14 rounded-full bg-[#2a2a3a] flex items-center justify-center">
            <Volume2 className="w-6 h-6 text-white" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
