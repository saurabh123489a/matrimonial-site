'use client';

import Link from 'next/link';
import { Card, Button, Typography, Spacing } from './ui';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export default function EmptyState({ 
  icon = '📭', 
  title, 
  description, 
  action,
  className = '' 
}: EmptyStateProps) {
  const ActionButton = action ? (
    action.href ? (
      <Link href={action.href}>
        <Button variant="primary" size="md">
          {action.label}
        </Button>
      </Link>
    ) : action.onClick ? (
      <Button variant="primary" size="md" onClick={action.onClick}>
        {action.label}
      </Button>
    ) : null
  ) : null;

  return (
    <Card variant="default" padding="lg" className={`text-center ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <Typography variant="h3" color="primary" weight="semibold">
        {title}
      </Typography>
      <Spacing size="sm" />
      <Typography variant="body" color="muted">
        {description}
      </Typography>
      {action && (
        <>
          <Spacing size="md" />
          {ActionButton}
        </>
      )}
    </Card>
  );
}

