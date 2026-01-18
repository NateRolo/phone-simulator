'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, ChevronRight, Clock, Bell, User, Users, Briefcase, Play, Bookmark, ChevronLeft, Volume2, VolumeX, Vibrate, Phone, Mic } from 'lucide-react';
import { AppConfig, IntensityLevel, TIMER_PRESETS, SavedPlan } from '@/types/appConfig';
import { scenarios } from '@/config/scenarios';
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

  const currentRingtone = ringtones.find((r: { id: string }) => r.id === selectedRingtone) || ringtones[0];
  const currentScenario = selectedCaller ? scenarios[selectedCaller] : null;

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
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const canRun = selectedCaller !== null && selectedVoice !== '';

  const callerOptions = [
    { id: 'parents', label: 'Parents', icon: Users, emoji: '👨‍👩‍👧', color: '#ff6b9d' },
    { id: 'sibling', label: 'Sibling', icon: User, emoji: '👧', color: '#9b59b6' },
    { id: 'colleague', label: 'Work', icon: Briefcase, emoji: '💼', color: '#007aff' },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* iOS Navigation Bar */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          {hasSavedPlans ? (
            <button onClick={onBack} className="flex items-center text-[#007aff]">
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          ) : (
            <div className="w-16" />
          )}
          <h1 className="text-lg font-semibold text-white">New Plan</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* Plan Name Section */}
        <div className="ios-card overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#38383a]">
            <div className="w-7 h-7 rounded-lg bg-[#ff9500] flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-white" />
            </div>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="Plan Name"
              className="flex-1 bg-transparent text-white placeholder:text-[#8e8e93] focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-7 h-7 rounded-lg bg-[#34c759] flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Contact Name"
              className="flex-1 bg-transparent text-white placeholder:text-[#8e8e93] focus:outline-none"
            />
            <button
              onClick={handleRandomizeName}
              disabled={!selectedCaller}
              className="text-[#007aff] disabled:text-[#48484a]"
            >
              <Shuffle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Who's Calling Section */}
        <div>
          <p className="text-[#8e8e93] text-sm uppercase tracking-wide px-4 mb-2">Who's Calling</p>
          <div className="ios-card overflow-hidden">
            {callerOptions.map((option, index) => (
              <button
                key={option.id}
                onClick={() => {
                  setSelectedCaller(option.id);
                  setContactName(scenarios[option.id].defaultCallerName);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 ${
                  index < callerOptions.length - 1 ? 'border-b border-[#38383a]' : ''
                }`}
              >
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: option.color }}
                >
                  <option.icon className="w-4 h-4 text-white" />
                </div>
                <span className="flex-1 text-left text-white">{option.label}</span>
                {selectedCaller === option.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full bg-[#007aff] flex items-center justify-center"
                  >
                    <span className="text-white text-sm">✓</span>
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Voice & Ringtone Section */}
        <div>
          <p className="text-[#8e8e93] text-sm uppercase tracking-wide px-4 mb-2">Audio</p>
          <div className="ios-card overflow-hidden">
            {/* Voice */}
            <button
              onClick={() => selectedCaller && setShowVoiceSelector(!showVoiceSelector)}
              disabled={!selectedCaller}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#38383a] disabled:opacity-50"
            >
              <div className="w-7 h-7 rounded-lg bg-[#5856d6] flex items-center justify-center">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <span className="flex-1 text-left text-white">Voice</span>
              <span className="text-[#8e8e93] text-sm mr-1">
                {isLoadingVoices ? 'Loading...' : voices.find(v => v.id === selectedVoice)?.name || 'Select'}
              </span>
              <ChevronRight className="w-5 h-5 text-[#48484a]" />
            </button>

            <AnimatePresence>
              {showVoiceSelector && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-[#1c1c1e]"
                >
                  {voices.map((voice, i) => (
                    <button
                      key={voice.id}
                      onClick={() => {
                        onSelectVoice(voice.id);
                        setShowVoiceSelector(false);
                      }}
                      className={`w-full flex items-center px-4 py-2.5 pl-14 ${
                        i < voices.length - 1 ? 'border-b border-[#38383a]' : ''
                      }`}
                    >
                      <span className={`flex-1 text-left ${selectedVoice === voice.id ? 'text-[#007aff]' : 'text-white'}`}>
                        {voice.name}
                      </span>
                      <span className="text-[#8e8e93] text-xs">{voice.gender}</span>
                      {selectedVoice === voice.id && (
                        <span className="text-[#007aff] ml-2">✓</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ringtone */}
            <button
              onClick={() => setShowRingtoneSelector(!showRingtoneSelector)}
              className="w-full flex items-center gap-3 px-4 py-3"
            >
              <div className="w-7 h-7 rounded-lg bg-[#ff3b30] flex items-center justify-center">
                {currentRingtone.audioUrl ? (
                  <Volume2 className="w-4 h-4 text-white" />
                ) : currentRingtone.vibrate ? (
                  <Vibrate className="w-4 h-4 text-white" />
                ) : (
                  <VolumeX className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="flex-1 text-left text-white">Ringtone</span>
              <span className="text-[#8e8e93] text-sm mr-1">{currentRingtone.name}</span>
              <ChevronRight className="w-5 h-5 text-[#48484a]" />
            </button>

            <AnimatePresence>
              {showRingtoneSelector && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-[#1c1c1e]"
                >
                  {ringtones.map((ringtone: { id: string; name: string; audioUrl: string | null; vibrate: boolean }, i: number) => (
                    <button
                      key={ringtone.id}
                      onClick={() => {
                        setSelectedRingtone(ringtone.id);
                        onPreviewRingtone(ringtone.id);
                        setShowRingtoneSelector(false);
                      }}
                      className={`w-full flex items-center px-4 py-2.5 pl-14 ${
                        i < ringtones.length - 1 ? 'border-b border-[#38383a]' : ''
                      }`}
                    >
                      <span className={`flex-1 text-left ${selectedRingtone === ringtone.id ? 'text-[#007aff]' : 'text-white'}`}>
                        {ringtone.name}
                      </span>
                      {selectedRingtone === ringtone.id && (
                        <span className="text-[#007aff] ml-2">✓</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Timer Section */}
        <div>
          <p className="text-[#8e8e93] text-sm uppercase tracking-wide px-4 mb-2">Time Until Ring</p>
          <div className="ios-card overflow-hidden">
            {/* Mode Toggle */}
            <div className="flex p-1 m-2 bg-[#1c1c1e] rounded-lg">
              <button
                onClick={() => setTimerMode('duration')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                  timerMode === 'duration' ? 'bg-[#3a3a3c] text-white' : 'text-[#8e8e93]'
                }`}
              >
                <Clock className="w-4 h-4" />
                Duration
              </button>
              <button
                onClick={() => setTimerMode('alarm')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                  timerMode === 'alarm' ? 'bg-[#3a3a3c] text-white' : 'text-[#8e8e93]'
                }`}
              >
                <Bell className="w-4 h-4" />
                Alarm
              </button>
            </div>

            {timerMode === 'duration' && (
              <div className="flex flex-wrap gap-2 p-3">
                {TIMER_PRESETS.map((preset) => (
                  <button
                    key={preset.seconds}
                    onClick={() => setTimerSeconds(preset.seconds)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      timerSeconds === preset.seconds
                        ? 'bg-[#007aff] text-white'
                        : 'bg-[#3a3a3c] text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}

            {timerMode === 'alarm' && (
              <div className="p-3">
                <input
                  type="time"
                  value={alarmTime}
                  onChange={(e) => setAlarmTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[#3a3a3c] text-white text-center text-xl focus:outline-none [color-scheme:dark]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <motion.button
            onClick={handleRun}
            disabled={!canRun}
            className="w-full py-4 rounded-xl font-semibold text-white bg-[#34c759] disabled:bg-[#48484a] disabled:text-[#8e8e93] flex items-center justify-center gap-2"
            whileTap={{ scale: canRun ? 0.98 : 1 }}
          >
            <Phone className="w-5 h-5" />
            Start Call
          </motion.button>

          <motion.button
            onClick={handleSavePlan}
            disabled={!canRun}
            className="w-full py-4 rounded-xl font-semibold text-[#007aff] bg-[#1c1c1e] disabled:text-[#48484a] flex items-center justify-center gap-2"
            whileTap={{ scale: canRun ? 0.98 : 1 }}
          >
            <Bookmark className="w-5 h-5" />
            Save Plan
          </motion.button>
        </div>

        {/* Status Messages */}
        <AnimatePresence>
          {showSaveSuccess && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-center text-[#34c759]"
            >
              ✓ Plan saved successfully
            </motion.p>
          )}
        </AnimatePresence>

        {!canRun && !showSaveSuccess && (
          <p className="text-sm text-center text-[#ff3b30]">
            {!selectedCaller ? 'Please select who is calling' : 'Please select a voice'}
          </p>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-[#48484a] pb-8">
          You Good? • Your discreet exit strategy
        </p>
      </div>
    </div>
  );
}
