'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Clock, Zap, ChevronRight, Bookmark } from 'lucide-react';
import { SavedPlan, AppConfig } from '@/types/appConfig';
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#00ff88] to-[#00cc6a] flex items-center justify-center"
          >
            <Bookmark className="w-7 h-7 text-black" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-1">You Good?</h1>
          <p className="text-sm text-[#888899]">Quick launch your saved plans</p>
        </div>

        {/* Plans list or empty state */}
        <div className="glass rounded-3xl p-4 mb-4">
          {plans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2a2a3a] flex items-center justify-center">
                <Bookmark className="w-8 h-8 text-[#555]" />
              </div>
              <p className="text-[#888899] mb-2">No saved plans yet</p>
              <p className="text-xs text-[#555]">Create your first plan to quick launch it later</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
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
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#2a2a3a] hover:bg-[#3a3a4a] transition-all text-left"
                      >
                        {/* Scenario emoji */}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                          style={{ backgroundColor: `${scenario.colors.primary}20` }}
                        >
                          {scenario.callerEmoji}
                        </div>

                        {/* Plan info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white truncate">
                              {plan.name}
                            </span>
                            {plan.intensity === 'high' && (
                              <span className="px-1.5 py-0.5 text-[10px] rounded bg-[#ff6b6b]/20 text-[#ff6b6b]">
                                Persistent
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[#888899] mt-0.5">
                            <span>{plan.customCallerName}</span>
                            <span className="flex items-center gap-1">
                              {plan.timerSeconds === 0 ? (
                                <><Zap className="w-3 h-3" /> Instant</>
                              ) : (
                                <><Clock className="w-3 h-3" /> {formatTimer(plan.timerSeconds)}</>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Launch arrow */}
                        <ChevronRight className="w-5 h-5 text-[#555] group-hover:text-[#00ff88] transition-colors" />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePlan(plan.id);
                        }}
                        className="absolute right-12 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 text-[#555] hover:text-[#ff6b6b] transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Create new button */}
        <motion.button
          onClick={onCreateNew}
          className="w-full py-4 rounded-xl font-semibold text-black bg-[#00ff88] flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          Create New Plan
        </motion.button>

        {/* Footer hint */}
        <p className="text-center text-xs text-[#555] mt-4">
          Tap a plan to launch instantly
        </p>
      </motion.div>
    </div>
  );
}
