'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Clock, Zap, ChevronRight, Phone } from 'lucide-react';
import { SavedPlan } from '@/types/appConfig';
import { scenarios } from '@/config/scenarios';

interface QuickLaunchProps {
  plans: SavedPlan[];
  onLaunchPlan: (plan: SavedPlan) => void;
  onDeletePlan: (id: string) => void;
  onCreateNew: () => void;
}

export function QuickLaunch({
  plans,
  onLaunchPlan,
  onDeletePlan,
  onCreateNew,
}: QuickLaunchProps) {
  const formatTimer = (seconds: number) => {
    if (seconds === 0) return 'Instant';
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)} min`;
  };

  const getScenarioInfo = (scenarioId: string) => {
    return scenarios[scenarioId] || scenarios.parents;
  };

  return (
    <div className="min-h-screen bg-black">
      {/* iOS Navigation Bar */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-center px-4 py-3">
          <h1 className="text-lg font-semibold text-white">You Good?</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        {/* App Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="flex justify-center mb-2"
        >
          <div className="w-20 h-20 rounded-[22px] bg-gradient-to-br from-[#34c759] to-[#30a14e] flex items-center justify-center shadow-lg">
            <Phone className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <p className="text-center text-[#8e8e93] text-sm mb-6">
          Your discreet exit strategy
        </p>

        {/* Quick Launch Section */}
        <div>
          <p className="text-[#8e8e93] text-sm uppercase tracking-wide px-4 mb-2">
            Saved Plans
          </p>
          
          {plans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ios-card p-8 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2c2c2e] flex items-center justify-center">
                <Phone className="w-8 h-8 text-[#48484a]" />
              </div>
              <p className="text-[#8e8e93] mb-1">No saved plans yet</p>
              <p className="text-xs text-[#48484a]">Create a plan to quick launch it later</p>
            </motion.div>
          ) : (
            <div className="ios-card overflow-hidden">
              <AnimatePresence>
                {plans.map((plan, index) => {
                  const scenario = getScenarioInfo(plan.scenarioId);
                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative"
                    >
                      <button
                        onClick={() => onLaunchPlan(plan)}
                        className={`w-full flex items-center gap-3 px-4 py-3 ${
                          index < plans.length - 1 ? 'border-b border-[#38383a]' : ''
                        }`}
                      >
                        {/* Scenario Icon */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                          style={{ backgroundColor: scenario.colors.primary + '30' }}
                        >
                          {scenario.callerEmoji}
                        </div>

                        {/* Plan Info */}
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white truncate">
                              {plan.name}
                            </span>
                            {plan.intensity === 'high' && (
                              <span className="px-1.5 py-0.5 text-[10px] rounded bg-[#ff3b30]/20 text-[#ff3b30]">
                                Persistent
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#8e8e93] mt-0.5">
                            <span>{plan.customCallerName}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              {plan.timerSeconds === 0 ? (
                                <><Zap className="w-3 h-3" /> Instant</>
                              ) : (
                                <><Clock className="w-3 h-3" /> {formatTimer(plan.timerSeconds)}</>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Launch Arrow */}
                        <ChevronRight className="w-5 h-5 text-[#48484a] group-hover:text-[#007aff] transition-colors" />
                      </button>

                      {/* Delete Button - Swipe or hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePlan(plan.id);
                        }}
                        className="absolute right-14 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-[#ff3b30]" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Create New Button */}
        <motion.button
          onClick={onCreateNew}
          className="w-full py-4 rounded-xl font-semibold text-white bg-[#007aff] flex items-center justify-center gap-2"
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          Create New Plan
        </motion.button>

        {/* Footer Hint */}
        <p className="text-center text-xs text-[#48484a] pt-4">
          Tap a plan to launch instantly
        </p>
      </div>
    </div>
  );
}
