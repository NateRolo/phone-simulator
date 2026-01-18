'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneOff } from 'lucide-react';
import { PhoneFrame } from './PhoneFrame';
import { SetupMenu } from './SetupMenu';
import { FakeHomeScreen } from './FakeHomeScreen';
import { CallScreen } from './CallScreen';
import { ConversationView } from './ConversationView';
import { MessageInput } from './MessageInput';
import { WaveformVisualizer } from './WaveformVisualizer';
import { PinEntryModal } from './PinEntryModal';
import { useConversation } from '@/hooks/useConversation';
import { useAutoRecorder } from '@/hooks/useAutoRecorder';
import { AppConfig, AppPhase, MAX_CALLS_HIGH_INTENSITY, DELAY_BETWEEN_CALLS_MS } from '@/types/appConfig';

const RECORDING_DURATION = 4000;

export function PhoneSimulator() {
  const {
    state,
    voices,
    selectedVoice,
    currentScenario,
    isLoadingVoices,
    setSelectedVoice,
    setSelectedScenario,
    fetchVoices,
    triggerRinging,
    answerCall,
    endCall,
    resetToIdle,
    sendMessage,
  } = useConversation();

  // App-level state
  const [appPhase, setAppPhase] = useState<AppPhase>('setup');
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(null);
  const [callCount, setCallCount] = useState(0);
  const [showPinModal, setShowPinModal] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const nextCallTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wasAISpeakingRef = useRef(false);

  // Fetch voices on mount
  useEffect(() => {
    fetchVoices();
  }, [fetchVoices]);

  // Handle setup completion
  const handleSetupComplete = useCallback((newConfig: AppConfig) => {
    setConfig(newConfig);
    setSelectedScenario(newConfig.scenarioId);
    setCallCount(0);
    
    if (newConfig.timerSeconds === null || newConfig.timerSeconds === 0) {
      // Instant call
      setAppPhase('ringing');
      triggerRinging();
    } else {
      // Start timer
      setAppPhase('waiting');
      setTimerSecondsLeft(newConfig.timerSeconds);
    }
  }, [setSelectedScenario, triggerRinging]);

  // Timer countdown
  useEffect(() => {
    if (appPhase !== 'waiting' || timerSecondsLeft === null) return;

    if (timerSecondsLeft <= 0) {
      setAppPhase('ringing');
      triggerRinging();
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimerSecondsLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [appPhase, timerSecondsLeft, triggerRinging]);

  // Sync app phase with conversation state
  useEffect(() => {
    if (state.status === 'connected' && appPhase === 'ringing') {
      setAppPhase('connected');
    }
  }, [state.status, appPhase]);

  // Handle answer
  const handleAnswer = useCallback(() => {
    setCallCount(prev => prev + 1);
    answerCall();
    setAppPhase('connected');
  }, [answerCall]);

  // Handle decline (in high intensity, triggers new call)
  const handleDecline = useCallback(() => {
    if (!config) return;
    
    resetToIdle();
    
    if (config.intensity === 'high' && callCount < MAX_CALLS_HIGH_INTENSITY) {
      // Schedule next call
      nextCallTimerRef.current = setTimeout(() => {
        triggerRinging();
        setAppPhase('ringing');
      }, DELAY_BETWEEN_CALLS_MS);
    } else {
      // Single call mode or max calls reached - back to setup
      setAppPhase('setup');
      setConfig(null);
    }
  }, [config, callCount, resetToIdle, triggerRinging]);

  // Handle end call
  const handleEndCall = useCallback(() => {
    if (!config) return;
    
    endCall();
    
    if (config.intensity === 'high' && callCount < MAX_CALLS_HIGH_INTENSITY) {
      // Schedule next call after delay
      nextCallTimerRef.current = setTimeout(() => {
        resetToIdle();
        triggerRinging();
        setAppPhase('ringing');
      }, DELAY_BETWEEN_CALLS_MS);
    } else {
      // Single call or max reached
      setTimeout(() => {
        setAppPhase('setup');
        setConfig(null);
        resetToIdle();
      }, 2000);
    }
  }, [config, callCount, endCall, resetToIdle, triggerRinging]);

  // Handle emergency override (hidden button on caller name)
  const handleEmergencyOverride = useCallback(() => {
    // Clear any pending timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (nextCallTimerRef.current) clearTimeout(nextCallTimerRef.current);
    
    resetToIdle();
    setAppPhase('setup');
    setConfig(null);
    setCallCount(0);
    setShowPinModal(false);
  }, [resetToIdle]);

  // Cancel waiting timer
  const handleCancelWaiting = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAppPhase('setup');
    setConfig(null);
    setTimerSecondsLeft(null);
  }, []);

  // Handle PIN entry for high intensity mode
  const handleRequestPinEntry = useCallback(() => {
    setShowPinModal(true);
  }, []);

  const handlePinSuccess = useCallback(() => {
    setShowPinModal(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (nextCallTimerRef.current) clearTimeout(nextCallTimerRef.current);
    
    resetToIdle();
    setAppPhase('setup');
    setConfig(null);
    setCallCount(0);
  }, [resetToIdle]);

  // Audio recording for conversation
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

  // Start recording loop when connected
  useEffect(() => {
    if (state.status === 'connected' && !isActive && !state.isSpeaking && !state.isThinking && !isTranscribing) {
      startLoop();
    }
  }, [state.status, isActive, state.isSpeaking, state.isThinking, isTranscribing, startLoop]);

  // Stop loop when not connected
  useEffect(() => {
    if (state.status !== 'connected' && isActive) {
      stopLoop();
    }
  }, [state.status, isActive, stopLoop]);

  // Trigger next recording cycle when AI finishes speaking
  useEffect(() => {
    if (wasAISpeakingRef.current && !state.isSpeaking && !state.isThinking && !isTranscribing) {
      triggerNextCycle();
    }
    wasAISpeakingRef.current = state.isSpeaking;
  }, [state.isSpeaking, state.isThinking, isTranscribing, triggerNextCycle]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render setup menu (full screen, no phone frame)
  if (appPhase === 'setup') {
    return (
      <SetupMenu
        onStart={handleSetupComplete}
        voices={voices}
        selectedVoice={selectedVoice}
        onSelectVoice={setSelectedVoice}
        isLoadingVoices={isLoadingVoices}
      />
    );
  }

  // Render phone frame for all other states
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] flex items-center justify-center p-4">
      <PhoneFrame>
        {/* Waiting state - fake home screen */}
        {appPhase === 'waiting' && (
          <FakeHomeScreen
            timerSecondsLeft={timerSecondsLeft}
            onCancel={handleCancelWaiting}
          />
        )}

        {/* Ringing state */}
        {appPhase === 'ringing' && state.status === 'ringing' && (
          <CallScreen
            state={state}
            onAnswer={handleAnswer}
            onDecline={handleDecline}
            onEndCall={handleEndCall}
            onEmergencyOverride={handleEmergencyOverride}
            scenario={currentScenario}
            showDeclineButton={true}
          />
        )}

        {/* Connected state */}
        {appPhase === 'connected' && state.status === 'connected' && (
          <div className="flex flex-col h-full relative">
            {/* PIN entry modal overlay */}
            <PinEntryModal
              isOpen={showPinModal}
              correctPin={config?.safePin || '1234'}
              onSuccess={handlePinSuccess}
              onClose={() => setShowPinModal(false)}
            />

            {/* Header */}
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
                  {/* Hidden emergency override */}
                  <button
                    onClick={handleEmergencyOverride}
                    className="text-sm font-medium text-white cursor-default focus:outline-none"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {currentScenario.callerName}
                  </button>
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
                onClick={handleEndCall}
                className="w-10 h-10 rounded-full bg-[#ff6b6b]/20 flex items-center justify-center"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 107, 107, 0.4)' }}
                whileTap={{ scale: 0.95 }}
              >
                <PhoneOff className="w-5 h-5 text-[#ff6b6b]" />
              </motion.button>
            </div>

            {/* High intensity indicator */}
            {config?.intensity === 'high' && (
              <div className="flex items-center justify-center gap-2 py-1">
                <span className="text-[10px] text-[#888899]">
                  Call {callCount} of {MAX_CALLS_HIGH_INTENSITY}
                </span>
                <button
                  onClick={handleRequestPinEntry}
                  className="text-[10px] text-[#ff6b6b]/50 hover:text-[#ff6b6b] transition-colors"
                >
                  Enter PIN to exit
                </button>
              </div>
            )}

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
                  <WaveformVisualizer isActive={true} color="#00ff88" barCount={5} />
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
                  <WaveformVisualizer isActive={true} color={currentScenario.colors.primary} barCount={5} />
                  <span className="text-xs text-[#888899]">{currentScenario.callerName} speaking</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <ConversationView messages={state.messages} />

            {/* Input */}
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

        {/* Ended state (brief) */}
        {state.status === 'ended' && (
          <div className="flex flex-col h-full items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 rounded-full bg-[#2a2a3a] flex items-center justify-center">
                <PhoneOff className="w-8 h-8 text-[#888899]" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-white">Call Ended</h2>
                <p className="text-sm text-[#888899]">{formatDuration(state.duration)}</p>
              </div>
              {config?.intensity === 'high' && callCount < MAX_CALLS_HIGH_INTENSITY && (
                <p className="text-xs text-[#ff6b6b] animate-pulse">
                  Next call coming...
                </p>
              )}
            </motion.div>
          </div>
        )}
      </PhoneFrame>
    </div>
  );
}
