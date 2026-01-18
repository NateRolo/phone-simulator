'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Clock, Zap, Lock, ChevronDown, Play } from 'lucide-react';
import { AppConfig, IntensityLevel, TIMER_PRESETS } from '@/types/appConfig';
import { scenarios, Scenario } from '@/config/scenarios';

interface SetupMenuProps {
  onStart: (config: AppConfig) => void;
  voices: Array<{ id: string; name: string; gender: string; accent: string }>;
  selectedVoice: string;
  onSelectVoice: (id: string) => void;
  isLoadingVoices: boolean;
}

export function SetupMenu({
  onStart,
  voices,
  selectedVoice,
  onSelectVoice,
  isLoadingVoices,
}: SetupMenuProps) {
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [intensity, setIntensity] = useState<IntensityLevel>('medium');
  const [safePin, setSafePin] = useState('');
  const [scenarioId, setScenarioId] = useState('family');
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [pinError, setPinError] = useState('');

  const scenarioList = Object.values(scenarios);
  const currentScenario = scenarios[scenarioId];

  const handleStart = () => {
    if (intensity === 'high' && safePin.length < 4) {
      setPinError('PIN must be at least 4 digits');
      return;
    }
    
    onStart({
      timerSeconds: timerSeconds === 0 ? null : timerSeconds,
      intensity,
      safePin,
      scenarioId,
    });
  };

  const canStart = intensity === 'medium' || (intensity === 'high' && safePin.length >= 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#00ff88] to-[#00cc6a] flex items-center justify-center"
          >
            <Shield className="w-8 h-8 text-black" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">Escape Call</h1>
          <p className="text-sm text-[#888899]">Your discreet exit strategy</p>
        </div>

        {/* Setup Card */}
        <div className="glass rounded-3xl p-6 space-y-6">
          {/* Scenario Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
              <span>📞</span> Who's calling?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {scenarioList.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => setScenarioId(scenario.id)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    scenarioId === scenario.id
                      ? 'ring-2'
                      : 'bg-[#2a2a3a] hover:bg-[#3a3a4a]'
                  }`}
                  style={{
                    backgroundColor: scenarioId === scenario.id 
                      ? `${scenario.colors.primary}15` 
                      : undefined,
                    ringColor: scenarioId === scenario.id 
                      ? scenario.colors.primary 
                      : undefined,
                  }}
                >
                  <span className="text-2xl">{scenario.callerEmoji}</span>
                  <p className="text-xs text-white mt-1">{scenario.callerName}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Timer Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
              <Clock className="w-4 h-4" style={{ color: currentScenario.colors.primary }} />
              When should the call come in?
            </label>
            <div className="flex flex-wrap gap-2">
              {TIMER_PRESETS.map((preset) => (
                <button
                  key={preset.seconds}
                  onClick={() => setTimerSeconds(preset.seconds)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    timerSeconds === preset.seconds
                      ? 'text-black'
                      : 'bg-[#2a2a3a] text-white hover:bg-[#3a3a4a]'
                  }`}
                  style={{
                    backgroundColor: timerSeconds === preset.seconds 
                      ? currentScenario.colors.primary 
                      : undefined,
                  }}
                >
                  {preset.seconds === 0 ? (
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" /> {preset.label}
                    </span>
                  ) : (
                    preset.label
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Intensity Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
              <Zap className="w-4 h-4" style={{ color: currentScenario.colors.primary }} />
              Intensity level
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIntensity('medium')}
                className={`p-4 rounded-xl text-left transition-all ${
                  intensity === 'medium'
                    ? 'ring-2 ring-[#00ff88] bg-[#00ff88]/10'
                    : 'bg-[#2a2a3a] hover:bg-[#3a3a4a]'
                }`}
              >
                <p className="text-sm font-medium text-white">Single Call</p>
                <p className="text-xs text-[#888899] mt-1">One call, easy exit</p>
              </button>
              <button
                onClick={() => setIntensity('high')}
                className={`p-4 rounded-xl text-left transition-all ${
                  intensity === 'high'
                    ? 'ring-2 ring-[#ff6b6b] bg-[#ff6b6b]/10'
                    : 'bg-[#2a2a3a] hover:bg-[#3a3a4a]'
                }`}
              >
                <p className="text-sm font-medium text-white">Persistent</p>
                <p className="text-xs text-[#888899] mt-1">Keeps calling until PIN</p>
              </button>
            </div>
          </div>

          {/* Safe PIN (only for high intensity) */}
          <AnimatePresence>
            {intensity === 'high' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                  <Lock className="w-4 h-4 text-[#ff6b6b]" />
                  Safe PIN (to stop calls)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={safePin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setSafePin(value);
                    setPinError('');
                  }}
                  placeholder="Enter 4-6 digit PIN"
                  className="w-full px-4 py-3 rounded-xl bg-[#2a2a3a] text-white text-center text-lg tracking-widest font-mono placeholder:text-[#555] placeholder:tracking-normal placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b6b]"
                />
                {pinError && (
                  <p className="text-xs text-[#ff6b6b] mt-2">{pinError}</p>
                )}
                <p className="text-xs text-[#888899] mt-2">
                  You'll need this PIN to stop the repeated calls
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
              🎙️ AI Voice
            </label>
            <button
              onClick={() => setShowVoiceSelector(!showVoiceSelector)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#2a2a3a] hover:bg-[#3a3a4a] transition-colors"
            >
              <span className="text-sm text-white">
                {isLoadingVoices
                  ? 'Loading voices...'
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
                  <div className="max-h-32 overflow-y-auto space-y-1 bg-[#1a1a24] rounded-xl p-2">
                    {voices.map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => {
                          onSelectVoice(voice.id);
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

          {/* Start Button */}
          <motion.button
            onClick={handleStart}
            disabled={!canStart}
            className="w-full py-4 rounded-xl font-semibold text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: currentScenario.colors.primary }}
            whileHover={{ scale: canStart ? 1.02 : 1 }}
            whileTap={{ scale: canStart ? 0.98 : 1 }}
          >
            <Play className="w-5 h-5" />
            {timerSeconds === 0 ? 'Start Now' : 'Arm & Wait'}
          </motion.button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#555] mt-6">
          Discreetly escape any situation
        </p>
      </motion.div>
    </div>
  );
}
