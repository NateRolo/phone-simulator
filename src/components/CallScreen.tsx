'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { WaveformVisualizer } from './WaveformVisualizer';
import { ConversationState } from '@/hooks/useConversation';

interface CallScreenProps {
  state: ConversationState;
  onStartCall: () => void;
  onEndCall: () => void;
  callerName?: string;
  callerAvatar?: string;
}

export function CallScreen({
  state,
  onStartCall,
  onEndCall,
  callerName = 'Mom',
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
            <div className="absolute inset-[2px] right-1 bg-[#00ff88] rounded-[1px]" />
          </div>
        </div>
      </div>

      {/* Main call content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {state.status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-8"
            >
              {/* Avatar */}
              <motion.div
                className="relative"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#ff6b9d] to-[#c44569] p-[3px]">
                  <div className="w-full h-full rounded-full bg-[#1a1a24] flex items-center justify-center">
                    <span className="text-4xl">👩</span>
                  </div>
                </div>
              </motion.div>

              <div className="text-center">
                <h2 className="text-2xl font-semibold text-white mb-2">{callerName}</h2>
                <p className="text-[#888899]">Tap to receive the call</p>
              </div>

              {/* Call button */}
              <motion.button
                onClick={onStartCall}
                className="w-20 h-20 rounded-full bg-[#00ff88] flex items-center justify-center shadow-lg shadow-[#00ff88]/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Phone className="w-8 h-8 text-black" />
              </motion.button>
            </motion.div>
          )}

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
                    className="absolute inset-0 rounded-full border-2 border-[#ff6b9d]"
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                    style={{
                      width: 128,
                      height: 128,
                      left: '50%',
                      top: '50%',
                      marginLeft: -64,
                      marginTop: -64,
                    }}
                  />
                ))}
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#ff6b9d] to-[#c44569] p-[3px] relative z-10">
                  <div className="w-full h-full rounded-full bg-[#1a1a24] flex items-center justify-center">
                    <span className="text-4xl">👩</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-semibold text-white mb-2">{callerName}</h2>
                <motion.p
                  className="text-[#ff6b9d]"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  Incoming call...
                </motion.p>
              </div>

              {/* End call button */}
              <motion.button
                onClick={onEndCall}
                className="w-16 h-16 rounded-full bg-[#ff6b6b] flex items-center justify-center shadow-lg shadow-[#ff6b6b]/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </motion.button>
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
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff6b9d] to-[#c44569] p-[2px]">
                <div className="w-full h-full rounded-full bg-[#1a1a24] flex items-center justify-center">
                  <span className="text-3xl">👩</span>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-xl font-semibold text-white">{callerName}</h2>
                <p className="text-[#ff6b9d] text-sm">{formatDuration(state.duration)}</p>
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
                      color={state.currentSpeaker === 'caller' ? '#ff6b6b' : '#00ff88'}
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
                    {state.currentSpeaker === 'receiver' ? '🤖 AI is speaking...' : '🎤 You are speaking...'}
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
