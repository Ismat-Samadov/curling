'use client';

import { useState, useCallback } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export function useConfirm() {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: { title: '', message: '' },
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(true);
    }
    setConfirmState({ isOpen: false, options: { title: '', message: '' }, resolve: null });
  }, [confirmState]);

  const handleCancel = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(false);
    }
    setConfirmState({ isOpen: false, options: { title: '', message: '' }, resolve: null });
  }, [confirmState]);

  const ConfirmDialogComponent = useCallback(() => {
    if (!confirmState.isOpen) return null;

    return (
      <ConfirmDialog
        title={confirmState.options.title}
        message={confirmState.options.message}
        confirmText={confirmState.options.confirmText}
        cancelText={confirmState.options.cancelText}
        type={confirmState.options.type}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
  }, [confirmState, handleConfirm, handleCancel]);

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
  };
}
