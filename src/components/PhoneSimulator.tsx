'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { PhoneOff } from 'lucide-react';
import { PhoneFrame } from './PhoneFrame';
import { SetupMenu } from './SetupMenu';
import { QuickLaunch } from './QuickLaunch';
import { FakeHomeScreen } from './FakeHomeScreen';
import { CallScreen } from './CallScreen';
import { PinEntryModal } from './PinEntryModal';
import { useConversation } from '@/hooks/useConversation';
import { useAutoRecorder } from '@/hooks/useAutoRecorder';
import { useSavedPlans } from '@/hooks/useSavedPlans';
import { useRingtone } from '@/hooks/useRingtone';
import { AppConfig, AppPhase, SavedPlan, MAX_CALLS_HIGH_INTENSITY, DELAY_BETWEEN_CALLS_MS } from '@/types/appConfig';
import { defaultRingtone } from '@/config/ringtones';

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
    setCustomCallerName,
    fetchVoices,
    triggerRinging,
    answerCall,
    sendInitialGreeting,
    endCall,
    resetToIdle,
    sendMessage,
  } = useConversation();

  // Saved plans
  const { plans, isLoaded: plansLoaded, savePlan, markPlanUsed, deletePlan } = useSavedPlans();
  
  // Ringtone
  const { 
    selectedRingtoneId, 
    setSelectedRingtoneId, 
    isPlaying: isRingtonePlaying,
    play: playRingtone, 
    stop: stopRingtone,
    previewRingtone,
  } = useRingtone();
  
  // App-level state - start with quick-launch if there are saved plans
  const [appPhase, setAppPhase] = useState<AppPhase>('quick-launch');
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
    setCustomCallerName(newConfig.customCallerName);
    setSelectedRingtoneId(newConfig.ringtoneId || defaultRingtone);
    setCallCount(0);
    
    if (newConfig.timerSeconds === null || newConfig.timerSeconds === 0) {
      // Instant call
      setAppPhase('ringing');
      triggerRinging();
      playRingtone();
    } else {
      // Start timer
      setAppPhase('waiting');
      setTimerSecondsLeft(newConfig.timerSeconds);
    }
  }, [setSelectedScenario, setCustomCallerName, setSelectedRingtoneId, triggerRinging, playRingtone]);

  // Handle launching a saved plan
  const handleLaunchPlan = useCallback((plan: SavedPlan) => {
    // Mark the plan as used
    markPlanUsed(plan.id);
    
    // Set the voice
    setSelectedVoice(plan.voiceId);
    
    // Create config from plan
    const planConfig: AppConfig = {
      timerSeconds: plan.timerSeconds === 0 ? null : plan.timerSeconds,
      intensity: plan.intensity,
      safePin: plan.safePin,
      scenarioId: plan.scenarioId,
      customCallerName: plan.customCallerName,
      ringtoneId: plan.ringtoneId || defaultRingtone,
      planName: plan.name,
    };
    
    handleSetupComplete(planConfig);
  }, [markPlanUsed, setSelectedVoice, handleSetupComplete]);

  // Handle saving a new plan
  const handleSavePlan = useCallback((planData: Omit<SavedPlan, 'id' | 'createdAt'>) => {
    savePlan(planData);
  }, [savePlan]);

  // Timer countdown
  useEffect(() => {
    if (appPhase !== 'waiting' || timerSecondsLeft === null) return;

    if (timerSecondsLeft <= 0) {
      setAppPhase('ringing');
      triggerRinging();
      playRingtone();
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimerSecondsLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [appPhase, timerSecondsLeft, triggerRinging, playRingtone]);

  // Sync app phase with conversation state
  useEffect(() => {
    if (state.status === 'connected' && appPhase === 'ringing') {
      setAppPhase('connected');
    }
  }, [state.status, appPhase]);

  // Handle answer
  const handleAnswer = useCallback(() => {
    stopRingtone();
    setCallCount(prev => prev + 1);
    answerCall();
    setAppPhase('connected');
    
    // AI speaks first with a greeting
    setTimeout(() => {
      sendInitialGreeting();
    }, 500); // Small delay for smooth transition
  }, [stopRingtone, answerCall, sendInitialGreeting]);

  // Handle decline (in high intensity, triggers new call)
  const handleDecline = useCallback(() => {
    if (!config) return;
    
    stopRingtone();
    resetToIdle();
    
    if (config.intensity === 'high' && callCount < MAX_CALLS_HIGH_INTENSITY) {
      // Schedule next call
      nextCallTimerRef.current = setTimeout(() => {
        triggerRinging();
        playRingtone();
        setAppPhase('ringing');
      }, DELAY_BETWEEN_CALLS_MS);
    } else {
      // Single call mode or max calls reached - back to quick launch
      setAppPhase('quick-launch');
      setConfig(null);
    }
  }, [config, callCount, stopRingtone, resetToIdle, triggerRinging, playRingtone]);

  // Handle end call
  const handleEndCall = useCallback(() => {
    if (!config) return;
    
    endCall();
    
    if (config.intensity === 'high' && callCount < MAX_CALLS_HIGH_INTENSITY) {
      // Schedule next call after delay
      nextCallTimerRef.current = setTimeout(() => {
        resetToIdle();
        triggerRinging();
        playRingtone();
        setAppPhase('ringing');
      }, DELAY_BETWEEN_CALLS_MS);
    } else {
      // Single call or max reached
      setTimeout(() => {
        setAppPhase('quick-launch');
        setConfig(null);
        resetToIdle();
      }, 2000);
    }
  }, [config, callCount, endCall, resetToIdle, triggerRinging, playRingtone]);

  // Handle emergency override (hidden button on caller name)
  const handleEmergencyOverride = useCallback(() => {
    // Clear any pending timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (nextCallTimerRef.current) clearTimeout(nextCallTimerRef.current);
    
    stopRingtone();
    resetToIdle();
    setAppPhase('quick-launch');
    setConfig(null);
    setCallCount(0);
    setShowPinModal(false);
  }, [stopRingtone, resetToIdle]);

  // Cancel waiting timer
  const handleCancelWaiting = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setAppPhase('quick-launch');
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
    setAppPhase('quick-launch');
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

  // Render quick launch screen
  if (appPhase === 'quick-launch') {
    return (
      <QuickLaunch
        plans={plans}
        onLaunchPlan={handleLaunchPlan}
        onDeletePlan={deletePlan}
        onCreateNew={() => setAppPhase('setup')}
      />
    );
  }

  // Render setup menu (full screen, no phone frame)
  if (appPhase === 'setup') {
    return (
      <SetupMenu
        onStart={handleSetupComplete}
        onSavePlan={handleSavePlan}
        onBack={() => setAppPhase('quick-launch')}
        voices={voices}
        selectedVoice={selectedVoice}
        onSelectVoice={setSelectedVoice}
        isLoadingVoices={isLoadingVoices}
        hasSavedPlans={plans.length > 0}
        onPreviewRingtone={previewRingtone}
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

        {/* Connected state - iOS in-call UI */}
        {appPhase === 'connected' && state.status === 'connected' && (
          <div className="relative h-full">
            {/* PIN entry modal overlay */}
            <PinEntryModal
              isOpen={showPinModal}
              correctPin={config?.safePin || '1234'}
              onSuccess={handlePinSuccess}
              onClose={() => setShowPinModal(false)}
            />

            {/* iOS Call Screen */}
            <CallScreen
              state={state}
              onAnswer={() => {}}
              onDecline={() => {}}
              onEndCall={handleEndCall}
              onEmergencyOverride={handleEmergencyOverride}
              scenario={currentScenario}
              showDeclineButton={false}
            />

            {/* High intensity indicator overlay */}
            {config?.intensity === 'high' && (
              <div className="absolute top-20 left-0 right-0 flex items-center justify-center gap-2 py-1 z-20">
                <span className="text-[10px] text-white/60 bg-black/30 px-2 py-1 rounded-full">
                  Call {callCount}/{MAX_CALLS_HIGH_INTENSITY}
                </span>
                <button
                  onClick={handleRequestPinEntry}
                  className="text-[10px] text-white/40 hover:text-white/80 transition-colors bg-black/30 px-2 py-1 rounded-full"
                >
                  PIN to exit
                </button>
              </div>
            )}
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
