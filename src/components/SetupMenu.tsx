'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, ChevronDown, Clock, Bell, Save, User, Users, Briefcase } from 'lucide-react';
import { AppConfig, IntensityLevel, TIMER_PRESETS } from '@/types/appConfig';
import { scenarios, Scenario } from '@/config/scenarios';

interface SetupMenuProps {
  onStart: (config: AppConfig) => void;
  voices: Array<{ id: string; name: string; gender: string; accent: string }>;
  selectedVoice: string;
  onSelectVoice: (id: string) => void;
  isLoadingVoices: boolean;
}

type TimerMode = 'duration' | 'alarm';

export function SetupMenu({
  onStart,
  voices,
  selectedVoice,
  onSelectVoice,
  isLoadingVoices,
}: SetupMenuProps) {
  // Form state
  const [contactName, setContactName] = useState('');
  const [selectedCaller, setSelectedCaller] = useState<string | null>(null);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [timerMode, setTimerMode] = useState<TimerMode>('duration');
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [alarmTime, setAlarmTime] = useState('');
  const [planName, setPlanName] = useState('');
  const [intensity, setIntensity] = useState<IntensityLevel>('medium');
  const [safePin, setSafePin] = useState('');

  const currentScenario = selectedCaller ? scenarios[selectedCaller] : null;

  // Set default contact name when caller type is selected
  useEffect(() => {
    if (currentScenario && !contactName) {
      setContactName(currentScenario.defaultCallerName);
    }
  }, [currentScenario, contactName]);

  const handleRandomizeName = () => {
    if (!currentScenario) return;
    const names = currentScenario.randomNames;
    const randomName = names[Math.floor(Math.random() * names.length)];
    setContactName(randomName);
  };

  const calculateSecondsUntilAlarm = (): number => {
    if (!alarmTime) return 60;
    const [hours, minutes] = alarmTime.split(':').map(Number);
    const now = new Date();
    const alarm = new Date();
    alarm.setHours(hours, minutes, 0, 0);
    
    // If alarm time has passed today, set for tomorrow
    if (alarm <= now) {
      alarm.setDate(alarm.getDate() + 1);
    }
    
    return Math.floor((alarm.getTime() - now.getTime()) / 1000);
  };

  const handleSave = () => {
    if (!selectedCaller) return;
    
    const seconds = timerMode === 'alarm' ? calculateSecondsUntilAlarm() : timerSeconds;
    
    onStart({
      timerSeconds: seconds === 0 ? null : seconds,
      intensity,
      safePin,
      scenarioId: selectedCaller,
      customCallerName: contactName || currentScenario?.defaultCallerName || 'Unknown',
      planName: planName || undefined,
    });
  };

  const canSave = selectedCaller !== null && selectedVoice !== '';

  const callerOptions = [
    { id: 'parents', label: 'Parents', icon: Users, emoji: '👨‍👩‍👧' },
    { id: 'sibling', label: 'Sibling', icon: User, emoji: '👧' },
    { id: 'colleague', label: 'Work', icon: Briefcase, emoji: '💼' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Setup Your Escape</h1>
          <p className="text-sm text-[#888899]">Configure your fake call</p>
        </div>

        {/* Settings Card */}
        <div className="glass rounded-3xl p-6 space-y-5">
          
          {/* 1. Contact Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Contact Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Enter name..."
                className="flex-1 px-4 py-3 rounded-xl bg-[#2a2a3a] text-white placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-[#00ff88]/50"
              />
              <motion.button
                onClick={handleRandomizeName}
                disabled={!selectedCaller}
                className="px-4 py-3 rounded-xl bg-[#2a2a3a] text-[#888899] hover:text-white hover:bg-[#3a3a4a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                whileTap={{ scale: 0.95 }}
                title="Randomize name"
              >
                <Shuffle className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* 2. Who's Calling */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Who's calling?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {callerOptions.map((option) => {
                const isSelected = selectedCaller === option.id;
                const scenario = scenarios[option.id];
                return (
                  <motion.button
                    key={option.id}
                    onClick={() => {
                      setSelectedCaller(option.id);
                      setContactName(scenario.defaultCallerName);
                    }}
                    className={`p-4 rounded-xl text-center transition-all ${
                      isSelected
                        ? 'ring-2'
                        : 'bg-[#2a2a3a] hover:bg-[#3a3a4a]'
                    }`}
                    style={{
                      backgroundColor: isSelected ? `${scenario.colors.primary}15` : undefined,
                      ringColor: isSelected ? scenario.colors.primary : undefined,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl block mb-1">{option.emoji}</span>
                    <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-[#888899]'}`}>
                      {option.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 3. Voice Option */}
          <div className={`transition-opacity ${!selectedCaller ? 'opacity-40 pointer-events-none' : ''}`}>
            <label className="block text-sm font-medium text-white mb-2">
              Voice
              {!selectedCaller && (
                <span className="text-xs text-[#555] ml-2">(select caller first)</span>
              )}
            </label>
            <button
              onClick={() => setShowVoiceSelector(!showVoiceSelector)}
              disabled={!selectedCaller}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#2a2a3a] hover:bg-[#3a3a4a] transition-colors disabled:cursor-not-allowed"
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
              {showVoiceSelector && selectedCaller && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 overflow-hidden"
                >
                  <div className="max-h-40 overflow-y-auto space-y-1 bg-[#1a1a24] rounded-xl p-2">
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

          {/* 4. Time Until Ring */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Time until ring
            </label>
            
            {/* Mode toggle */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setTimerMode('duration')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  timerMode === 'duration'
                    ? 'bg-[#00ff88] text-black'
                    : 'bg-[#2a2a3a] text-[#888899] hover:bg-[#3a3a4a]'
                }`}
              >
                <Clock className="w-4 h-4" />
                Duration
              </button>
              <button
                onClick={() => setTimerMode('alarm')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  timerMode === 'alarm'
                    ? 'bg-[#00ff88] text-black'
                    : 'bg-[#2a2a3a] text-[#888899] hover:bg-[#3a3a4a]'
                }`}
              >
                <Bell className="w-4 h-4" />
                Alarm
              </button>
            </div>

            {/* Duration presets */}
            {timerMode === 'duration' && (
              <div className="flex flex-wrap gap-2">
                {TIMER_PRESETS.map((preset) => (
                  <button
                    key={preset.seconds}
                    onClick={() => setTimerSeconds(preset.seconds)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      timerSeconds === preset.seconds
                        ? 'bg-[#00ff88] text-black'
                        : 'bg-[#2a2a3a] text-white hover:bg-[#3a3a4a]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}

            {/* Alarm time picker */}
            {timerMode === 'alarm' && (
              <input
                type="time"
                value={alarmTime}
                onChange={(e) => setAlarmTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#2a2a3a] text-white focus:outline-none focus:ring-2 focus:ring-[#00ff88]/50 [color-scheme:dark]"
              />
            )}
          </div>

          {/* 5. Plan Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Plan Name
              <span className="text-xs text-[#555] ml-2">(optional)</span>
            </label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="e.g., Date escape, Meeting bail..."
              className="w-full px-4 py-3 rounded-xl bg-[#2a2a3a] text-white placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-[#00ff88]/50"
            />
          </div>

          {/* 6. Save Button */}
          <motion.button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full py-4 rounded-xl font-semibold text-black bg-[#00ff88] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileHover={{ scale: canSave ? 1.02 : 1 }}
            whileTap={{ scale: canSave ? 0.98 : 1 }}
          >
            <Save className="w-5 h-5" />
            SAVE
          </motion.button>

          {!canSave && (
            <p className="text-xs text-center text-[#ff6b6b]">
              {!selectedCaller ? 'Please select who is calling' : 'Please select a voice'}
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#555] mt-4">
          Your escape is just a call away
        </p>
      </motion.div>
    </div>
  );
}
