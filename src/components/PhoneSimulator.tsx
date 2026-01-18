'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneOff, Settings, ChevronDown, Sparkles } from 'lucide-react';
import { PhoneFrame } from './PhoneFrame';
import { CallScreen } from './CallScreen';
import { ConversationView } from './ConversationView';
import { MessageInput } from './MessageInput';
import { WaveformVisualizer } from './WaveformVisualizer';
import { useConversation } from '@/hooks/useConversation';
import { useAutoRecorder } from '@/hooks/useAutoRecorder';
import { scenarios } from '@/config/scenarios';

const RECORDING_DURATION = 4000; // 4 seconds

export function PhoneSimulator() {
  const {
    state,
    voices,
    selectedVoice,
    selectedScenario,
    currentScenario,
    isLoadingVoices,
    setSelectedVoice,
    setSelectedScenario,
    fetchVoices,
    startCall,
    endCall,
    sendMessage,
  } = useConversation();

  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const wasAISpeakingRef = useRef(false);

  const processRecording = useCallback(async (audioBlob: Blob) => {
    if (!audioBlob || audioBlob.size === 0) return;
    
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.text && data.text.trim()) {
          sendMessage(data.text.trim());
        }
      }
    } catch (err) {
      console.error('Failed to transcribe:', err);
    } finally {
      setIsTranscribing(false);
    }
  }, [sendMessage]);

  const { isRecording, timeRemaining, isActive, startLoop, stopLoop, triggerNextCycle } = useAutoRecorder({
    onRecordingComplete: processRecording,
    recordingDuration: RECORDING_DURATION,
  });

  // Start recording loop when call connects
  useEffect(() => {
    if (state.status === 'connected' && !isActive && !state.isSpeaking && !state.isThinking && !isTranscribing) {
      startLoop();
    }
  }, [state.status, isActive, state.isSpeaking, state.isThinking, isTranscribing, startLoop]);

  // Stop loop when call ends
  useEffect(() => {
    if (state.status !== 'connected' && isActive) {
      stopLoop();
    }
  }, [state.status, isActive, stopLoop]);

  // Trigger next recording cycle when AI finishes speaking
  useEffect(() => {
    if (wasAISpeakingRef.current && !state.isSpeaking && !state.isThinking && !isTranscribing) {
      // AI just finished speaking, trigger next cycle
      triggerNextCycle();
    }
    wasAISpeakingRef.current = state.isSpeaking;
  }, [state.isSpeaking, state.isThinking, isTranscribing, triggerNextCycle]);

  useEffect(() => {
    fetchVoices();
  }, [fetchVoices]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const scenarioList = Object.values(scenarios);

  const getActivityStatus = () => {
    if (isRecording) return `Recording (${timeRemaining}s)`;
    if (isTranscribing) return 'Processing...';
    if (state.isThinking) return 'Thinking...';
    if (state.isSpeaking) return `${currentScenario.callerName} Speaking`;
    return 'Waiting...';
  };

  return (
    <div className="relative">
      {/* Left panel - Settings */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute -left-64 top-8 w-56"
      >
        {/* Scenario Selector */}
        <div className="glass rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" style={{ color: currentScenario.colors.primary }} />
            <span className="text-sm font-medium text-white">Scenario</span>
          </div>
          
          <div className="space-y-2">
            {scenarioList.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                disabled={state.status !== 'idle'}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedScenario === scenario.id
                    ? 'ring-2'
                    : 'hover:bg-[#2a2a3a]'
                } ${state.status !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{
                  backgroundColor: selectedScenario === scenario.id 
                    ? `${scenario.colors.primary}20` 
                    : undefined,
                  color: selectedScenario === scenario.id 
                    ? scenario.colors.primary 
                    : 'white',
                  ringColor: selectedScenario === scenario.id 
                    ? scenario.colors.primary 
                    : undefined,
                }}
              >
                <div className="flex items-center gap-2">
                  <span>{scenario.callerEmoji}</span>
                  <div>
                    <div className="font-medium">{scenario.name}</div>
                    <div className="text-[10px] text-[#888899]">{scenario.callerName}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Voice selector */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4" style={{ color: currentScenario.colors.primary }} />
            <span className="text-sm font-medium text-white">Voice</span>
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
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {voices.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => {
                        setSelectedVoice(voice.id);
                        setShowVoiceSelector(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedVoice === voice.id
                          ? 'text-white'
                          : 'hover:bg-[#2a2a3a] text-white'
                      }`}
                      style={{
                        backgroundColor: selectedVoice === voice.id 
                          ? `${currentScenario.colors.primary}20` 
                          : undefined,
                        color: selectedVoice === voice.id 
                          ? currentScenario.colors.primary 
                          : undefined,
                      }}
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
          <h3 className="text-sm font-medium text-white mb-2">How it works</h3>
          <ul className="text-xs text-[#888899] space-y-2">
            <li className="flex items-start gap-2">
              <span style={{ color: currentScenario.colors.primary }}>1.</span>
              <span>Pick a scenario above</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: currentScenario.colors.primary }}>2.</span>
              <span>Tap to answer the call</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: currentScenario.colors.primary }}>3.</span>
              <span>You have 4 seconds to speak</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: currentScenario.colors.primary }}>4.</span>
              <span>AI responds, then repeat!</span>
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
            scenario={currentScenario}
          />
        ) : (
          <div className="flex flex-col h-full">
            {/* Connected header */}
            <div className="flex items-center justify-between px-2 py-3">
              <div className="flex items-center gap-3">
                <div 
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentScenario.colors.gradient} p-[2px]`}
                >
                  <div className="w-full h-full rounded-full bg-[#1a1a24] flex items-center justify-center">
                    <span className="text-lg">{currentScenario.callerEmoji}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">{currentScenario.callerName}</h3>
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2 h-2 rounded-full animate-pulse" 
                      style={{ backgroundColor: currentScenario.colors.primary }}
                    />
                    <span 
                      className="text-xs"
                      style={{ color: currentScenario.colors.primary }}
                    >
                      {formatDuration(state.duration)}
                    </span>
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
            <AnimatePresence mode="wait">
              {isRecording && (
                <motion.div
                  key="recording"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-center gap-3 py-3"
                >
                  <WaveformVisualizer
                    isActive={true}
                    color="#00ff88"
                    barCount={5}
                  />
                  <span className="text-sm font-mono text-[#00ff88]">{timeRemaining}s</span>
                  <span className="text-xs text-[#888899]">Speak now...</span>
                </motion.div>
              )}
              {isTranscribing && !isRecording && (
                <motion.div
                  key="transcribing"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-center gap-2 py-2"
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-[#00ccff]"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#888899]">Processing...</span>
                </motion.div>
              )}
              {state.isThinking && !isTranscribing && !isRecording && (
                <motion.div
                  key="thinking"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-center gap-2 py-2"
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: currentScenario.colors.primary }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#888899]">Thinking...</span>
                </motion.div>
              )}
              {state.isSpeaking && !state.isThinking && !isRecording && (
                <motion.div
                  key="speaking"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-center gap-2 py-2"
                >
                  <WaveformVisualizer
                    isActive={true}
                    color={currentScenario.colors.primary}
                    barCount={5}
                  />
                  <span className="text-xs text-[#888899]">{currentScenario.callerName} speaking</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <ConversationView messages={state.messages} />

            {/* Input - simplified for auto mode */}
            <div className="mt-auto pb-4">
              <MessageInput
                onSend={sendMessage}
                disabled={state.status !== 'connected' || state.isThinking || state.isSpeaking || isRecording}
                isRecording={isRecording}
                timeRemaining={timeRemaining}
                isTranscribing={isTranscribing}
                isAISpeaking={state.isSpeaking}
                isThinking={state.isThinking}
              />
            </div>
          </div>
        )}
      </PhoneFrame>

      {/* Right panel - Stats */}
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
              <span className="text-xs text-[#888899]">Scenario</span>
              <span 
                className="text-xs font-medium px-2 py-1 rounded-full"
                style={{ 
                  backgroundColor: `${currentScenario.colors.primary}20`,
                  color: currentScenario.colors.primary 
                }}
              >
                {currentScenario.name}
              </span>
            </div>

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
              <span className="text-xs text-white">{getActivityStatus()}</span>
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
