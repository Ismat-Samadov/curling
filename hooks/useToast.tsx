'use client';

import { useState, useCallback } from 'react';
import Toast, { ToastType } from '@/components/Toast';

interface ToastState {
  message: string;
  type: ToastType;
  id: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { message, type, id }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const ToastContainer = useCallback(() => (
    <div className="fixed top-20 sm:top-20 right-2 sm:right-4 left-2 sm:left-auto z-[100] flex flex-col gap-2 sm:gap-3 pointer-events-none max-w-full sm:max-w-md">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto animate-slide-in-right"
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  ), [toasts, removeToast]);

  return {
    showToast,
    success: (message: string) => showToast(message, 'success'),
    error: (message: string) => showToast(message, 'error'),
    warning: (message: string) => showToast(message, 'warning'),
    info: (message: string) => showToast(message, 'info'),
    ToastContainer,
  };
}
