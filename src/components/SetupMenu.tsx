'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, ChevronDown, Clock, Bell, User, Users, Briefcase, Play, Bookmark, ArrowLeft, Volume2, VolumeX, Vibrate } from 'lucide-react';
import { AppConfig, IntensityLevel, TIMER_PRESETS, SavedPlan } from '@/types/appConfig';
import { scenarios, getPreferredGender } from '@/config/scenarios';
import { ringtones, defaultRingtone } from '@/config/ringtones';

interface SetupMenuProps {
  onStart: (config: AppConfig) => void;
  onSavePlan: (plan: Omit<SavedPlan, 'id' | 'createdAt'>) => void;
  onBack: () => void;
  voices: Array<{ id: string; name: string; gender: string; accent: string }>;
  selectedVoice: string;
  onSelectVoice: (id: string) => void;
  isLoadingVoices: boolean;
  hasSavedPlans: boolean;
  onPreviewRingtone: (ringtoneId: string) => void;
}

type TimerMode = 'duration' | 'alarm';

export function SetupMenu({
  onStart,
  onSavePlan,
  onBack,
  voices,
  selectedVoice,
  onSelectVoice,
  isLoadingVoices,
  hasSavedPlans,
  onPreviewRingtone,
}: SetupMenuProps) {
  // Form state
  const [contactName, setContactName] = useState('');
  const [selectedCaller, setSelectedCaller] = useState<string | null>(null);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [showRingtoneSelector, setShowRingtoneSelector] = useState(false);
  const [selectedRingtone, setSelectedRingtone] = useState<string>(defaultRingtone);
  const [timerMode, setTimerMode] = useState<TimerMode>('duration');
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [alarmTime, setAlarmTime] = useState('');
  const [planName, setPlanName] = useState('');
  const [intensity, setIntensity] = useState<IntensityLevel>('medium');
  const [safePin, setSafePin] = useState('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const currentRingtone = ringtones.find(r => r.id === selectedRingtone) || ringtones[0];

  const currentScenario = selectedCaller ? scenarios[selectedCaller] : null;

  // Filter voices based on caller type and contact name
  const getFilteredVoices = () => {
    if (!currentScenario || !contactName) return voices;
    
    const preferredGender = getPreferredGender(contactName, currentScenario);
    
    // Filter by gender if we have a preference
    let filtered = voices;
    if (preferredGender !== 'any') {
      const genderFiltered = voices.filter(v => 
        v.gender.toLowerCase() === preferredGender
      );
      // Only use filtered list if we have results
      if (genderFiltered.length > 0) {
        filtered = genderFiltered;
      }
    }
    
    // Sort by appropriateness (put matching gender first)
    return filtered.sort((a, b) => {
      const aMatches = preferredGender === 'any' || a.gender.toLowerCase() === preferredGender;
      const bMatches = preferredGender === 'any' || b.gender.toLowerCase() === preferredGender;
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });
  };

  const filteredVoices = getFilteredVoices();

  // Set default contact name when caller type is selected
  useEffect(() => {
    if (currentScenario && !contactName) {
      setContactName(currentScenario.defaultCallerName);
    }
  }, [currentScenario, contactName]);

  // Auto-select appropriate voice when caller or contact name changes
  useEffect(() => {
    if (!currentScenario || !contactName || voices.length === 0) return;
    
    const preferredGender = getPreferredGender(contactName, currentScenario);
    
    // Check if current voice matches the preferred gender
    const currentVoice = voices.find(v => v.id === selectedVoice);
    const currentMatches = currentVoice && (
      preferredGender === 'any' || 
      currentVoice.gender.toLowerCase() === preferredGender
    );
    
    // If current voice doesn't match, auto-select a better one
    if (!currentMatches && filteredVoices.length > 0) {
      onSelectVoice(filteredVoices[0].id);
    }
  }, [contactName, currentScenario, voices, selectedVoice, filteredVoices, onSelectVoice]);

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

  const getTimerValue = () => {
    return timerMode === 'alarm' ? calculateSecondsUntilAlarm() : timerSeconds;
  };

  const handleRun = () => {
    if (!selectedCaller) return;
    
    const seconds = getTimerValue();
    
    onStart({
      timerSeconds: seconds === 0 ? null : seconds,
      intensity,
      safePin,
      scenarioId: selectedCaller,
      customCallerName: contactName || currentScenario?.defaultCallerName || 'Unknown',
      ringtoneId: selectedRingtone,
      planName: planName || undefined,
    });
  };

  const handleSavePlan = () => {
    if (!selectedCaller || !selectedVoice) return;
    
    const name = planName.trim() || `${contactName} Call`;
    
    onSavePlan({
      name,
      scenarioId: selectedCaller,
      customCallerName: contactName || currentScenario?.defaultCallerName || 'Unknown',
      voiceId: selectedVoice,
      ringtoneId: selectedRingtone,
      timerSeconds: getTimerValue(),
      intensity,
      safePin,
    });
    
    // Show success feedback
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const canRun = selectedCaller !== null && selectedVoice !== '';

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
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-6">
          {hasSavedPlans && (
            <motion.button
              onClick={onBack}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-2 rounded-xl bg-[#2a2a3a] hover:bg-[#3a3a4a] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#888899]" />
            </motion.button>
          )}
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-white mb-1">
              {hasSavedPlans ? 'New Plan' : 'You Good?'}
            </h1>
            <p className="text-sm text-[#888899]">Setup your escape call</p>
          </div>
          {hasSavedPlans && <div className="w-9" />} {/* Spacer for centering */}
        </div>

        {/* Settings Card */}
        <div className="glass rounded-3xl p-6 space-y-5">
          
          {/* Plan Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Plan Name
              <span className="text-xs text-[#555] ml-2">(for saving)</span>
            </label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="e.g., Date Escape, Meeting Bail..."
              className="w-full px-4 py-3 rounded-xl bg-[#2a2a3a] text-white placeholder:text-[#555] focus:outline-none focus:ring-2 focus:ring-[#00ff88]/50"
            />
          </div>

          {/* Who's Calling */}
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

          {/* Contact Name */}
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

          {/* Voice Option */}
          <div className={`transition-opacity ${!selectedCaller ? 'opacity-40 pointer-events-none' : ''}`}>
            <label className="block text-sm font-medium text-white mb-2">
              Voice
              {!selectedCaller && (
                <span className="text-xs text-[#555] ml-2">(select caller first)</span>
              )}
              {currentScenario && contactName && (
                <span className="text-xs text-[#00ff88] ml-2">
                  ({getPreferredGender(contactName, currentScenario) === 'any' 
                    ? 'any voice' 
                    : `${getPreferredGender(contactName, currentScenario)} voices`})
                </span>
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
                  <div className="max-h-48 overflow-y-auto space-y-1 bg-[#1a1a24] rounded-xl p-2">
                    {filteredVoices.length > 0 && filteredVoices.length < voices.length && (
                      <div className="px-3 py-1 text-[10px] text-[#00ff88] border-b border-[#2a2a3a] mb-1">
                        Recommended for "{contactName}"
                      </div>
                    )}
                    {filteredVoices.map((voice) => {
                      const preferredGender = currentScenario ? getPreferredGender(contactName, currentScenario) : 'any';
                      const isRecommended = preferredGender === 'any' || voice.gender.toLowerCase() === preferredGender;
                      
                      return (
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
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{voice.name}</span>
                            {isRecommended && (
                              <span className="text-[8px] px-1.5 py-0.5 bg-[#00ff88]/20 text-[#00ff88] rounded">
                                ✓
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#888899]">
                            {voice.gender} • {voice.accent}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Ringtone Selector */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Ringtone
            </label>
            <button
              onClick={() => setShowRingtoneSelector(!showRingtoneSelector)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#2a2a3a] hover:bg-[#3a3a4a] transition-colors"
            >
              <div className="flex items-center gap-3">
                {currentRingtone.audioUrl ? (
                  <Volume2 className="w-4 h-4 text-[#00ff88]" />
                ) : currentRingtone.vibrate ? (
                  <Vibrate className="w-4 h-4 text-[#888899]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-[#555]" />
                )}
                <div className="text-left">
                  <span className="text-sm text-white">{currentRingtone.name}</span>
                  <span className="text-xs text-[#888899] ml-2">{currentRingtone.description}</span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#888899] transition-transform ${
                  showRingtoneSelector ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {showRingtoneSelector && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 overflow-hidden"
                >
                  <div className="space-y-1 bg-[#1a1a24] rounded-xl p-2">
                    {ringtones.map((ringtone) => (
                      <button
                        key={ringtone.id}
                        onClick={() => {
                          setSelectedRingtone(ringtone.id);
                          onPreviewRingtone(ringtone.id);
                          setShowRingtoneSelector(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedRingtone === ringtone.id
                            ? 'bg-[#00ff88]/20 text-[#00ff88]'
                            : 'hover:bg-[#2a2a3a] text-white'
                        }`}
                      >
                        {ringtone.audioUrl ? (
                          <Volume2 className="w-4 h-4" />
                        ) : ringtone.vibrate ? (
                          <Vibrate className="w-4 h-4" />
                        ) : (
                          <VolumeX className="w-4 h-4" />
                        )}
                        <div className="text-left">
                          <div className="font-medium">{ringtone.name}</div>
                          <div className="text-[10px] text-[#888899]">{ringtone.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Time Until Ring */}
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

          {/* Action Buttons */}
          <div className="flex gap-3">
            {/* Save Plan Button */}
            <motion.button
              onClick={handleSavePlan}
              disabled={!canRun}
              className="flex-1 py-4 rounded-xl font-semibold text-white bg-[#2a2a3a] hover:bg-[#3a3a4a] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileHover={{ scale: canRun ? 1.02 : 1 }}
              whileTap={{ scale: canRun ? 0.98 : 1 }}
            >
              <Bookmark className="w-5 h-5" />
              Save
            </motion.button>

            {/* Run Button */}
            <motion.button
              onClick={handleRun}
              disabled={!canRun}
              className="flex-[2] py-4 rounded-xl font-semibold text-black bg-[#00ff88] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              whileHover={{ scale: canRun ? 1.02 : 1 }}
              whileTap={{ scale: canRun ? 0.98 : 1 }}
            >
              <Play className="w-5 h-5" />
              Run
            </motion.button>
          </div>

          {/* Save success message */}
          <AnimatePresence>
            {showSaveSuccess && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-xs text-center text-[#00ff88]"
              >
                ✓ Plan saved! Access it from Quick Launch.
              </motion.p>
            )}
          </AnimatePresence>

          {!canRun && !showSaveSuccess && (
            <p className="text-xs text-center text-[#ff6b6b]">
              {!selectedCaller ? 'Please select who is calling' : 'Please select a voice'}
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#555] mt-4">
          You Good? • Your discreet exit strategy
        </p>
      </motion.div>
    </div>
  );
}
