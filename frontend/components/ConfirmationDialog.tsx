'use client';

import { Button, Card, Typography, Spacing } from './ui';

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

  const variantMap: Record<'danger' | 'warning' | 'info', 'primary' | 'secondary' | 'danger'> = {
    danger: 'danger',
    warning: 'secondary',
    info: 'primary',
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card variant="elevated" padding="lg" className="max-w-md w-full">
        <div className="text-center">
          <Typography variant="h3" color="primary" weight="bold">
            {title}
          </Typography>
          <Spacing size="sm" />
          <Typography variant="body" color="muted">
            {message}
          </Typography>
        </div>
        <Spacing size="lg" />
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variantMap[variant]}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}

