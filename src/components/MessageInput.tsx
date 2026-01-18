'use client';

import { useState, FormEvent, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Loader2 } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isSpeaking?: boolean;
}

export function MessageInput({ onSend, disabled, isSpeaking }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { isRecording, startRecording, stopRecording, error } = useAudioRecorder();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isSpeaking) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleMicMouseDown = useCallback(async () => {
    if (disabled || isSpeaking || isTranscribing) return;
    
    try {
      await startRecording();
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, [disabled, isSpeaking, isTranscribing, startRecording]);

  const handleMicMouseUp = useCallback(async () => {
    if (!isRecording) return;
    
    try {
      const audioBlob = await stopRecording();
      
      if (audioBlob && audioBlob.size > 0) {
        setIsTranscribing(true);
        
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.text && data.text.trim()) {
            // Auto-send the transcribed message
            onSend(data.text.trim());
          }
        } else {
          console.error('Transcription failed');
        }
        
        setIsTranscribing(false);
      }
    } catch (err) {
      console.error('Failed to process recording:', err);
      setIsTranscribing(false);
    }
  }, [isRecording, stopRecording, onSend]);

  // Handle mouse leaving the button while recording
  const handleMicMouseLeave = useCallback(() => {
    if (isRecording) {
      handleMicMouseUp();
    }
  }, [isRecording, handleMicMouseUp]);

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-3 glass rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Push-to-talk mic button */}
      <motion.button
        type="button"
        onMouseDown={handleMicMouseDown}
        onMouseUp={handleMicMouseUp}
        onMouseLeave={handleMicMouseLeave}
        onTouchStart={handleMicMouseDown}
        onTouchEnd={handleMicMouseUp}
        disabled={disabled || isSpeaking || isTranscribing}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all select-none ${
          isRecording 
            ? 'bg-[#ff6b6b] scale-110' 
            : isTranscribing
            ? 'bg-[#00ff88]/50'
            : 'bg-[#2a2a3a] hover:bg-[#3a3a4a]'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
        whileTap={{ scale: 1.1 }}
      >
        <AnimatePresence mode="wait">
          {isTranscribing ? (
            <motion.div
              key="transcribing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ rotate: { duration: 1, repeat: Infinity, ease: 'linear' } }}
            >
              <Loader2 className="w-4 h-4 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="mic"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Mic className={`w-4 h-4 ${isRecording ? 'text-white' : 'text-white'}`} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Recording indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-center gap-2 overflow-hidden"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6b6b] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ff6b6b]"></span>
            </span>
            <span className="text-xs text-[#ff6b6b] whitespace-nowrap">Recording...</span>
          </motion.div>
        )}
        {isTranscribing && !isRecording && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-center gap-2 overflow-hidden"
          >
            <span className="text-xs text-[#00ff88] whitespace-nowrap">Transcribing...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error display */}
      {error && !isRecording && !isTranscribing && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-[#ff6b6b] whitespace-nowrap"
        >
          {error}
        </motion.span>
      )}

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={
          isRecording
            ? "Hold to speak..."
            : isTranscribing
            ? "Transcribing..."
            : isSpeaking 
            ? "AI is responding..." 
            : "Hold mic or type..."
        }
        disabled={disabled || isSpeaking || isRecording || isTranscribing}
        className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-[#888899] text-sm px-2 min-w-0"
        autoComplete="off"
      />
      
      <motion.button
        type="submit"
        disabled={!message.trim() || disabled || isSpeaking || isRecording || isTranscribing}
        className="w-10 h-10 rounded-full bg-[#00ff88] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Send className="w-4 h-4 text-black" />
      </motion.button>
    </motion.form>
  );
}
