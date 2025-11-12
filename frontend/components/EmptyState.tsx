'use client';

import Link from 'next/link';

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
      <Link
        href={action.href}
        className="inline-flex items-center px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
      >
        {action.label}
      </Link>
    ) : action.onClick ? (
      <button
        onClick={action.onClick}
        className="inline-flex items-center px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
      >
        {action.label}
      </button>
    ) : null
  ) : null;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-green-400 mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-green-300 mb-6 max-w-md mx-auto">{description}</p>
      {ActionButton}
    </div>
  );
}

