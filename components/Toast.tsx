'use client';

import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  return (
    <div className={`${bgColors[type]} text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl backdrop-blur-sm flex items-center gap-2 sm:gap-3 w-full border border-white/20`}>
      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center">
        <span className="text-xl sm:text-2xl">{icons[type]}</span>
      </div>
      <p className="flex-1 font-medium text-sm sm:text-base leading-snug">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center text-white text-lg sm:text-xl font-bold"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}
