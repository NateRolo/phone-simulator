'use client';

import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, MessageCircle, Voicemail, Info, MicOff, Volume2, Grid3X3, Plus, Video, Headphones } from 'lucide-react';
import { ConversationState } from '@/hooks/useConversation';
import { Scenario } from '@/config/scenarios';

// Action button for in-call controls
function CallActionButton({ icon, label, active = false }: { icon: ReactNode; label: string; active?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button 
        className={`w-[72px] h-[72px] rounded-2xl flex items-center justify-center transition-colors ${
          active ? 'bg-white' : 'bg-white/15'
        }`}
      >
        <span className={active ? 'text-black' : ''}>{icon}</span>
      </button>
      <span className="text-white/90 text-xs">{label}</span>
    </div>
  );
}

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
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle slide to answer
  const handleSlideEnd = () => {
    if (sliderPosition > 200) {
      onAnswer();
    }
    setSliderPosition(0);
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col h-full ios-call-gradient relative overflow-hidden">
      {/* iOS Status bar */}
      <div className="flex justify-between items-center px-6 pt-3 pb-2 relative z-10">
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-white">9:41</span>
          <svg className="w-4 h-4 ml-1 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
          </svg>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex gap-[2px] items-end">
            <div className="w-[4px] h-[4px] rounded-sm bg-white/50" />
            <div className="w-[4px] h-[6px] rounded-sm bg-white/50" />
            <div className="w-[4px] h-[8px] rounded-sm bg-white" />
            <div className="w-[4px] h-[10px] rounded-sm bg-white" />
          </div>
          <svg className="w-5 h-4 ml-2" viewBox="0 0 24 16" fill="white">
            <path d="M1 8C3.5 3.5 7.5 1 12 1s8.5 2.5 11 7c-2.5 4.5-6.5 7-11 7S3.5 12.5 1 8z" fillOpacity="0.9"/>
          </svg>
          <div className="flex items-center ml-1">
            <div className="w-6 h-3 rounded-sm border border-white/60 relative">
              <div className="absolute inset-[2px] right-[6px] rounded-[1px] bg-white" />
            </div>
            <div className="w-1 h-1.5 bg-white/60 rounded-r-sm ml-[1px]" />
          </div>
        </div>
      </div>

      {/* Live Audio indicator */}
      <div className="flex justify-between items-center px-6 py-2 relative z-10">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-[3px] bg-white/50 rounded-full"
              style={{ height: 4 + i * 2 }}
              animate={state.status === 'ringing' ? { 
                height: [4 + i * 2, 8 + i * 3, 4 + i * 2] 
              } : {}}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
          <div className="w-4 h-4 rounded-full border border-white/30 ml-1 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
          </div>
        </div>
        <button className="w-6 h-6 rounded-full border border-white/40 flex items-center justify-center">
          <Info className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Main call content */}
      <div className="flex-1 flex flex-col items-center px-4 relative z-10">
        <AnimatePresence mode="wait">
          {state.status === 'ringing' && (
            <motion.div
              key="ringing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full h-full pt-4"
            >
              {/* P badge */}
              <div className="flex items-center justify-center mb-1">
                <span className="text-white/70 text-xs bg-white/20 px-2 py-0.5 rounded font-medium">P</span>
              </div>

              {/* Caller name - hidden emergency override */}
              <button
                onClick={onEmergencyOverride}
                className="text-4xl font-light text-white mb-1 cursor-default focus:outline-none tracking-tight"
                style={{ WebkitTapHighlightColor: 'transparent', fontWeight: 300 }}
              >
                {scenario.callerName || scenario.defaultCallerName}
              </button>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Divider line */}
              <div className="w-full h-[0.5px] bg-white/20 mb-6" />

              {/* Message & Voicemail buttons */}
              <div className="flex justify-between w-full px-8 mb-8">
                <div className="flex flex-col items-center gap-2">
                  <button className="w-16 h-16 rounded-full ios-glass-btn flex items-center justify-center">
                    <MessageCircle className="w-7 h-7 text-white" fill="white" />
                  </button>
                  <span className="text-white text-sm">Message</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <button className="w-16 h-16 rounded-full ios-glass-btn flex items-center justify-center">
                    <Voicemail className="w-7 h-7 text-white" />
                  </button>
                  <span className="text-white text-sm">Voicemail</span>
                </div>
              </div>

              {/* Decline & Accept buttons OR Slide to answer */}
              {showDeclineButton ? (
                <div className="flex justify-between w-full px-8 mb-8">
                  <div className="flex flex-col items-center gap-2">
                    <motion.button
                      onClick={onDecline}
                      className="w-20 h-20 rounded-full bg-[#ff3b30] flex items-center justify-center"
                      whileTap={{ scale: 0.95 }}
                    >
                      <Phone className="w-10 h-10 text-white rotate-[135deg]" />
                    </motion.button>
                    <span className="text-white text-sm">Decline</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <motion.button
                      onClick={onAnswer}
                      className="w-20 h-20 rounded-full bg-[#34c759] flex items-center justify-center"
                      whileTap={{ scale: 0.95 }}
                    >
                      <Phone className="w-10 h-10 text-white" />
                    </motion.button>
                    <span className="text-white text-sm">Accept</span>
                  </div>
                </div>
              ) : (
                /* Slide to answer */
                <div className="w-full px-4 mb-8">
                  <div className="relative h-20 slide-to-answer rounded-full overflow-hidden">
                    <motion.div
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
                      drag="x"
                      dragConstraints={{ left: 0, right: 220 }}
                      dragElastic={0}
                      onDrag={(_, info) => {
                        setSliderPosition(info.offset.x);
                        setIsDragging(true);
                      }}
                      onDragEnd={handleSlideEnd}
                      animate={{ x: isDragging ? undefined : 0 }}
                    >
                      <Phone className="w-8 h-8 text-[#34c759]" />
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-white/80 text-lg tracking-wide">
                        slide <span className="text-white/50">to</span> answer
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {state.status === 'connected' && (
            <motion.div
              key="connected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full h-full pt-6"
            >
              {/* Caller name - large at top */}
              <button
                onClick={onEmergencyOverride}
                className="text-3xl font-light text-white mb-1 cursor-default focus:outline-none tracking-tight"
                style={{ WebkitTapHighlightColor: 'transparent', fontWeight: 300 }}
              >
                {scenario.callerName || scenario.defaultCallerName}
              </button>

              {/* Call duration - simple timer like a normal phone */}
              <p className="text-white/70 text-base mb-6">
                {formatDuration(state.duration)}
              </p>

              {/* 6 Action buttons in 3x2 grid */}
              <div className="grid grid-cols-3 gap-x-6 gap-y-5 px-4">
                {/* Row 1 */}
                <CallActionButton
                  icon={<MicOff className="w-7 h-7 text-white" />}
                  label="mute"
                />
                <CallActionButton
                  icon={<Grid3X3 className="w-7 h-7 text-white" />}
                  label="keypad"
                />
                <CallActionButton
                  icon={<Volume2 className="w-7 h-7 text-white" />}
                  label="speaker"
                />
                
                {/* Row 2 */}
                <CallActionButton
                  icon={<Plus className="w-7 h-7 text-white" />}
                  label="add call"
                />
                <CallActionButton
                  icon={<Video className="w-7 h-7 text-white" />}
                  label="video"
                />
                <CallActionButton
                  icon={<Headphones className="w-7 h-7 text-white" />}
                  label="audio"
                />
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* End call button */}
              <motion.button
                onClick={onEndCall}
                className="w-20 h-20 rounded-full bg-[#ff3b30] flex items-center justify-center mb-6"
                whileTap={{ scale: 0.95 }}
              >
                <Phone className="w-10 h-10 text-white rotate-[135deg]" />
              </motion.button>
            </motion.div>
          )}

          {state.status === 'ended' && (
            <motion.div
              key="ended"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center h-full gap-6"
            >
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
                <PhoneOff className="w-12 h-12 text-white/60" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-light text-white mb-2">Call Ended</h2>
                <p className="text-white/60 text-lg">{formatDuration(state.duration)}</p>
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
