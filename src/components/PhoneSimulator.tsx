'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Settings, ChevronDown } from 'lucide-react';
import { PhoneFrame } from './PhoneFrame';
import { CallScreen } from './CallScreen';
import { ConversationView } from './ConversationView';
import { MessageInput } from './MessageInput';
import { WaveformVisualizer } from './WaveformVisualizer';
import { useConversation } from '@/hooks/useConversation';

export function PhoneSimulator() {
  const {
    state,
    voices,
    selectedVoice,
    isLoadingVoices,
    setSelectedVoice,
    fetchVoices,
    startCall,
    endCall,
    sendMessage,
  } = useConversation();

  const [showVoiceSelector, setShowVoiceSelector] = useState(false);

  useEffect(() => {
    fetchVoices();
  }, [fetchVoices]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      {/* Voice selector (outside phone) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute -left-64 top-8 w-56"
      >
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-[#00ff88]" />
            <span className="text-sm font-medium text-white">Voice Settings</span>
          </div>
          
          <button
            onClick={() => setShowVoiceSelector(!showVoiceSelector)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#2a2a3a] hover:bg-[#3a3a4a] transition-colors"
          >
            <span className="text-sm text-white truncate">
              {isLoadingVoices
                ? 'Loading...'
                : voices.find((v) => v.id === selectedVoice)?.name || 'Select voice'}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-[#888899] transition-transform ${
                showVoiceSelector ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {showVoiceSelector && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 overflow-hidden"
              >
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {voices.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => {
                        setSelectedVoice(voice.id);
                        setShowVoiceSelector(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedVoice === voice.id
                          ? 'bg-[#00ff88]/20 text-[#00ff88]'
                          : 'hover:bg-[#2a2a3a] text-white'
                      }`}
                    >
                      <div className="font-medium">{voice.name}</div>
                      <div className="text-[10px] text-[#888899]">
                        {voice.gender} • {voice.accent}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 glass rounded-2xl p-4"
        >
          <h3 className="text-sm font-medium text-white mb-2">How to escape</h3>
          <ul className="text-xs text-[#888899] space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-[#ff6b9d]">1.</span>
              <span>Tap to receive "Mom's" call</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ff6b9d]">2.</span>
              <span>Hold mic & respond naturally</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ff6b9d]">3.</span>
              <span>Mom will give you an excuse</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#ff6b9d]">4.</span>
              <span>Say goodbye & make your exit!</span>
            </li>
          </ul>
        </motion.div>
      </motion.div>

      {/* Phone */}
      <PhoneFrame>
        {state.status === 'idle' || state.status === 'ringing' || state.status === 'ended' ? (
          <CallScreen
            state={state}
            onStartCall={startCall}
            onEndCall={endCall}
          />
        ) : (
          <div className="flex flex-col h-full">
            {/* Connected header */}
            <div className="flex items-center justify-between px-2 py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff6b9d] to-[#c44569] p-[2px]">
                  <div className="w-full h-full rounded-full bg-[#1a1a24] flex items-center justify-center">
                    <span className="text-lg">👩</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">Mom</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ff6b9d] animate-pulse" />
                    <span className="text-xs text-[#ff6b9d]">{formatDuration(state.duration)}</span>
                  </div>
                </div>
              </div>
              
              <motion.button
                onClick={endCall}
                className="w-10 h-10 rounded-full bg-[#ff6b6b]/20 flex items-center justify-center"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 107, 107, 0.4)' }}
                whileTap={{ scale: 0.95 }}
              >
                <PhoneOff className="w-5 h-5 text-[#ff6b6b]" />
              </motion.button>
            </div>

            {/* Status indicator */}
            <AnimatePresence>
              {state.isThinking && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-center gap-2 py-2"
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-[#00ff88]"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#888899]">AI is thinking...</span>
                </motion.div>
              )}
              {state.isSpeaking && !state.isThinking && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-center gap-2 py-2"
                >
                  <WaveformVisualizer
                    isActive={true}
                    color={state.currentSpeaker === 'caller' ? '#ff6b6b' : '#00ff88'}
                    barCount={5}
                  />
                  <span className="text-xs text-[#888899]">
                    {state.currentSpeaker === 'receiver' ? 'AI speaking' : 'You'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <ConversationView messages={state.messages} />

            {/* Input */}
            <div className="mt-auto pb-4">
              <MessageInput
                onSend={sendMessage}
                disabled={state.status !== 'connected' || state.isThinking}
                isSpeaking={state.isSpeaking || state.isThinking}
              />
            </div>
          </div>
        )}
      </PhoneFrame>

      {/* Stats panel (outside phone) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute -right-64 top-8 w-56"
      >
        <div className="glass rounded-2xl p-4">
          <h3 className="text-sm font-medium text-white mb-3">Call Stats</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#888899]">Status</span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                state.status === 'connected'
                  ? 'bg-[#00ff88]/20 text-[#00ff88]'
                  : state.status === 'ringing'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-[#2a2a3a] text-[#888899]'
              }`}>
                {state.status.charAt(0).toUpperCase() + state.status.slice(1)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#888899]">Duration</span>
              <span className="text-xs font-mono text-white">{formatDuration(state.duration)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#888899]">Messages</span>
              <span className="text-xs text-white">{state.messages.length}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#888899]">Activity</span>
              <span className="text-xs text-white">
                {state.isThinking 
                  ? 'Thinking...' 
                  : state.isSpeaking 
                  ? (state.currentSpeaker === 'receiver' ? 'AI Speaking' : 'You') 
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Powered by */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-4 text-center"
        >
          <p className="text-xs text-[#888899]">Powered by</p>
          <p className="text-sm font-semibold gradient-text">OpenAI + ElevenLabs</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
