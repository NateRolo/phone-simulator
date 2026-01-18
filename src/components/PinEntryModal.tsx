'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Delete } from 'lucide-react';

interface PinEntryModalProps {
  isOpen: boolean;
  correctPin: string;
  onSuccess: () => void;
  onClose: () => void;
  attemptsLeft?: number;
}

// iOS keypad with letters
const keypadButtons = [
  { digit: '1', letters: '' },
  { digit: '2', letters: 'ABC' },
  { digit: '3', letters: 'DEF' },
  { digit: '4', letters: 'GHI' },
  { digit: '5', letters: 'JKL' },
  { digit: '6', letters: 'MNO' },
  { digit: '7', letters: 'PQRS' },
  { digit: '8', letters: 'TUV' },
  { digit: '9', letters: 'WXYZ' },
  { digit: '', letters: '' }, // Empty
  { digit: '0', letters: '' },
  { digit: 'del', letters: '' }, // Delete
];

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

  const pinLength = correctPin.length || 6;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 ios-gradient flex flex-col items-center"
        >
          {/* Dynamic Island style notch */}
          <div className="flex justify-center pt-4">
            <div className="w-28 h-8 bg-black rounded-full flex items-center justify-between px-3">
              <Lock className="w-4 h-4 text-white/80" />
              <div className="w-5 h-5 rounded-full border-2 border-white/40 flex items-center justify-center">
                <span className="text-[8px] text-white/60">☺</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="mt-16 mb-6">
            <h2 className="text-xl font-normal text-white">Enter Passcode</h2>
          </div>

          {/* PIN Dots */}
          <motion.div
            animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.3 }}
            className="flex gap-5 mb-12"
          >
            {Array.from({ length: pinLength }).map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
                  error
                    ? 'border-[#ff3b30] bg-[#ff3b30]'
                    : i < pin.length
                    ? 'border-white bg-white'
                    : 'border-white/60 bg-transparent'
                }`}
              />
            ))}
          </motion.div>

          {/* Error message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-white/80 mb-4 -mt-8"
            >
              Wrong passcode. {attempts} attempts left.
            </motion.p>
          )}

          {/* iOS Numeric Keypad */}
          <div className="grid grid-cols-3 gap-x-6 gap-y-4 px-8">
            {keypadButtons.map((btn, index) => {
              if (btn.digit === '') {
                return <div key={index} className="w-20 h-20" />;
              }
              
              if (btn.digit === 'del') {
                return (
                  <button
                    key={index}
                    onClick={handleDelete}
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                  >
                    <Delete className="w-7 h-7 text-white" />
                  </button>
                );
              }

              return (
                <motion.button
                  key={index}
                  onClick={() => handleDigitPress(btn.digit)}
                  className="w-20 h-20 rounded-full ios-keypad-button flex flex-col items-center justify-center"
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-3xl font-light text-white">{btn.digit}</span>
                  {btn.letters && (
                    <span className="text-[10px] tracking-[0.2em] text-white/80 mt-0.5">
                      {btn.letters}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Bottom buttons - Emergency & Cancel */}
          <div className="flex justify-between w-full px-12 mt-auto pb-12">
            <button 
              onClick={onClose}
              className="text-white/80 text-lg"
            >
              Emergency
            </button>
            <button 
              onClick={onClose}
              className="text-white/80 text-lg"
            >
              Cancel
            </button>
          </div>

          {/* Home indicator */}
          <div className="flex justify-center pb-2">
            <div className="w-32 h-1 bg-white/30 rounded-full" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
