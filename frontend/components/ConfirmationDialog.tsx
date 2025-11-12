'use client';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'info',
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-pink-600 hover:bg-pink-700',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full animate-scale-in">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-pink-300 mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-pink-200 mb-6">{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-pink-800 text-gray-700 dark:text-pink-200 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors font-medium"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${variantStyles[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

