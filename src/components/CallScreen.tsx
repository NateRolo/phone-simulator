'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, MessageCircle, Voicemail, Info } from 'lucide-react';
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
    <div className="flex flex-col h-full ios-gradient relative overflow-hidden">
      {/* iOS Status bar */}
      <div className="flex justify-between items-center px-6 pt-4 pb-2 relative z-10">
        <span className="text-sm font-semibold text-white">9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-[2px] items-end">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-[3px] rounded-sm bg-white"
                style={{ height: `${4 + i * 2}px` }}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-white ml-1">5G</span>
          <svg className="w-6 h-4 ml-1" viewBox="0 0 25 12" fill="white">
            <path d="M1.5 4C1.5 2.34315 2.84315 1 4.5 1H18.5C20.1569 1 21.5 2.34315 21.5 4V8C21.5 9.65685 20.1569 11 18.5 11H4.5C2.84315 11 1.5 9.65685 1.5 8V4Z" stroke="white" strokeOpacity="0.35" fill="none"/>
            <path d="M23 4V8C23.8284 7.32843 24.3284 6.32843 24.3284 5.5C24.3284 4.67157 23.8284 3.67157 23 4Z" fillOpacity="0.4"/>
            <rect x="2.5" y="2" width="18" height="8" rx="2" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Live Audio indicator */}
      <div className="flex justify-between items-center px-6 py-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="flex gap-[2px] items-center">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-[3px] bg-white/60 rounded-full"
                animate={{ height: [4, 8 + i * 2, 4] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        </div>
        <button className="w-6 h-6 rounded-full border border-white/40 flex items-center justify-center">
          <Info className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Main call content */}
      <div className="flex-1 flex flex-col items-center justify-start pt-8 px-4 relative z-10">
        <AnimatePresence mode="wait">
          {state.status === 'ringing' && (
            <motion.div
              key="ringing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full h-full"
            >
              {/* Caller badge */}
              <div className="flex items-center justify-center mb-2">
                <span className="text-white/60 text-sm bg-white/10 px-2 py-0.5 rounded">P</span>
              </div>

              {/* Caller name - hidden emergency override */}
              <button
                onClick={onEmergencyOverride}
                className="text-4xl font-light text-white mb-2 cursor-default focus:outline-none tracking-tight"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {scenario.callerName || scenario.defaultCallerName}
              </button>

              {/* "mobile" label */}
              <p className="text-white/60 text-lg mb-auto">mobile</p>

              {/* Bottom actions */}
              <div className="w-full mt-auto pb-8">
                {/* Message & Voicemail buttons */}
                <div className="flex justify-between px-12 mb-8">
                  <div className="flex flex-col items-center gap-2">
                    <button className="w-16 h-16 rounded-full ios-glass-button flex items-center justify-center">
                      <MessageCircle className="w-7 h-7 text-white" />
                    </button>
                    <span className="text-white text-xs">Message</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <button className="w-16 h-16 rounded-full ios-glass-button flex items-center justify-center">
                      <Voicemail className="w-7 h-7 text-white" />
                    </button>
                    <span className="text-white text-xs">Voicemail</span>
                  </div>
                </div>

                {/* Decline & Accept buttons */}
                <div className="flex justify-between px-12">
                  {showDeclineButton && (
                    <div className="flex flex-col items-center gap-2">
                      <motion.button
                        onClick={onDecline}
                        className="w-20 h-20 rounded-full bg-[#ff3b30] flex items-center justify-center"
                        whileTap={{ scale: 0.95 }}
                      >
                        <Phone className="w-9 h-9 text-white rotate-[135deg]" />
                      </motion.button>
                      <span className="text-white text-sm">Decline</span>
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-2">
                    <motion.button
                      onClick={onAnswer}
                      className="w-20 h-20 rounded-full bg-[#34c759] flex items-center justify-center"
                      whileTap={{ scale: 0.95 }}
                    >
                      <Phone className="w-9 h-9 text-white" />
                    </motion.button>
                    <span className="text-white text-sm">Accept</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {state.status === 'connected' && (
            <motion.div
              key="connected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full h-full"
            >
              {/* Caller name */}
              <button
                onClick={onEmergencyOverride}
                className="text-3xl font-light text-white mb-1 cursor-default focus:outline-none"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {scenario.callerName || scenario.defaultCallerName}
              </button>

              {/* Duration */}
              <p className="text-white/70 text-lg mb-6">
                {formatDuration(state.duration)}
              </p>

              {/* Waveform when speaking */}
              <div className="h-16 flex items-center">
                {state.isSpeaking && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <WaveformVisualizer
                      isActive={state.isSpeaking}
                      color={state.currentSpeaker === 'caller' ? '#ff3b30' : '#34c759'}
                    />
                  </motion.div>
                )}
              </div>

              {/* Speaking indicator */}
              {state.currentSpeaker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-2 rounded-full bg-white/10 text-sm mt-4"
                >
                  <span className="text-white/80">
                    {state.currentSpeaker === 'receiver' 
                      ? `${scenario.callerName || scenario.defaultCallerName} speaking...` 
                      : 'You speaking...'}
                  </span>
                </motion.div>
              )}

              {/* Bottom controls */}
              <div className="mt-auto pb-8 flex flex-col items-center gap-4">
                <motion.button
                  onClick={onEndCall}
                  className="w-20 h-20 rounded-full bg-[#ff3b30] flex items-center justify-center"
                  whileTap={{ scale: 0.95 }}
                >
                  <Phone className="w-9 h-9 text-white rotate-[135deg]" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {state.status === 'ended' && (
            <motion.div
              key="ended"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-6 mt-20"
            >
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
                <PhoneOff className="w-10 h-10 text-white/60" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-light text-white mb-1">Call Ended</h2>
                <p className="text-white/60">Duration: {formatDuration(state.duration)}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Home indicator */}
      <div className="flex justify-center pb-2 relative z-10">
        <div className="w-32 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  );
}
