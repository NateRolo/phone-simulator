'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, Delete } from 'lucide-react';

interface PinEntryModalProps {
  isOpen: boolean;
  correctPin: string;
  onSuccess: () => void;
  onClose: () => void;
  attemptsLeft?: number;
}

export function PinEntryModal({
  isOpen,
  correctPin,
  onSuccess,
  onClose,
  attemptsLeft = 3,
}: PinEntryModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(attemptsLeft);

  const handleDigitPress = (digit: string) => {
    if (pin.length >= 6) return;
    
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);

    // Auto-submit when PIN length matches
    if (newPin.length === correctPin.length) {
      if (newPin === correctPin) {
        onSuccess();
      } else {
        setError(true);
        setAttempts(prev => prev - 1);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 500);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const numpadDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6"
        >
          {/* Close button - hidden in corner */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/30 hover:text-white/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-16 h-16 rounded-full bg-[#00ff88]/20 flex items-center justify-center mb-6"
          >
            <Lock className="w-8 h-8 text-[#00ff88]" />
          </motion.div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-white mb-2">Enter Safe PIN</h2>
          <p className="text-sm text-[#888899] mb-6 text-center">
            Enter your PIN to stop the calls
          </p>

          {/* PIN Display */}
          <motion.div
            animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.3 }}
            className="flex gap-3 mb-8"
          >
            {Array.from({ length: correctPin.length }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  error
                    ? 'border-[#ff6b6b] bg-[#ff6b6b]'
                    : i < pin.length
                    ? 'border-[#00ff88] bg-[#00ff88]'
                    : 'border-[#555] bg-transparent'
                }`}
              />
            ))}
          </motion.div>

          {/* Error message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-[#ff6b6b] mb-4"
            >
              Wrong PIN. {attempts} attempts left.
            </motion.p>
          )}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-4 w-64">
            {numpadDigits.map((digit, index) => {
              if (digit === '') {
                return <div key={index} />;
              }
              
              if (digit === 'del') {
                return (
                  <button
                    key={index}
                    onClick={handleDelete}
                    className="h-14 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
                  >
                    <Delete className="w-6 h-6" />
                  </button>
                );
              }

              return (
                <motion.button
                  key={index}
                  onClick={() => handleDigitPress(digit)}
                  className="h-14 rounded-full bg-[#2a2a3a] text-white text-xl font-medium hover:bg-[#3a3a4a] transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  {digit}
                </motion.button>
              );
            })}
          </div>

          {/* Attempts indicator */}
          <p className="text-xs text-[#555] mt-6">
            {attempts} attempts remaining
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
