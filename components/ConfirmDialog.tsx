'use client';

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Təsdiq et',
  cancelText = 'Ləğv et',
  type = 'warning',
}: ConfirmDialogProps) {
  const typeConfig = {
    danger: {
      color: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      icon: '⚠️',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    warning: {
      color: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      icon: '⚡',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    info: {
      color: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
      icon: 'ℹ️',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
  };

  const config = typeConfig[type];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon Header */}
        <div className={`${config.iconBg} p-6 flex justify-center`}>
          <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
            <span className="text-4xl">{config.icon}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">{title}</h3>
          <p className="text-gray-600 mb-6 text-center leading-relaxed">{message}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all focus:ring-2 focus:ring-gray-300 focus:outline-none"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-6 py-3 ${config.color} text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl focus:ring-2 focus:outline-none transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
