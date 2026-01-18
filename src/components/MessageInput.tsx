'use client';

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic } from 'lucide-react';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isRecording?: boolean;
  timeRemaining?: number;
  isTranscribing?: boolean;
  isAISpeaking?: boolean;
  isThinking?: boolean;
}

export function MessageInput({
  onSend,
  disabled,
  isRecording,
  timeRemaining,
  isTranscribing,
  isAISpeaking,
  isThinking,
}: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const getPlaceholder = () => {
    if (isRecording) return `Speak now... (${timeRemaining}s)`;
    if (isTranscribing) return "Processing your speech...";
    if (isThinking) return "Thinking...";
    if (isAISpeaking) return "Listening to response...";
    return "Type a message...";
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-3 glass rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Recording indicator */}
      <div className="w-10 h-10 rounded-full bg-[#2a2a3a] flex items-center justify-center relative">
        {isRecording && (
          <svg className="absolute inset-0 w-10 h-10 -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="rgba(0,255,136,0.2)"
              strokeWidth="2"
            />
            <motion.circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="#00ff88"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 1 }}
              animate={{ pathLength: 0 }}
              transition={{ duration: 4, ease: 'linear' }}
            />
          </svg>
        )}
        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div
              key="recording"
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-3 h-3 rounded-full bg-[#00ff88]"
            />
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Mic className={`w-4 h-4 ${isAISpeaking || isThinking ? 'text-[#555]' : 'text-[#888899]'}`} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status text */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-center gap-2 overflow-hidden"
          >
            <span className="text-sm font-mono text-[#00ff88]">{timeRemaining}s</span>
          </motion.div>
        )}
        {isTranscribing && !isRecording && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="overflow-hidden"
          >
            <span className="text-xs text-[#00ccff] whitespace-nowrap">Processing...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={getPlaceholder()}
        disabled={disabled}
        className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-[#888899] text-sm px-2 min-w-0"
        autoComplete="off"
      />
      
      <motion.button
        type="submit"
        disabled={!message.trim() || disabled}
        className="w-10 h-10 rounded-full bg-[#00ff88] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Send className="w-4 h-4 text-black" />
      </motion.button>
    </motion.form>
  );
}
