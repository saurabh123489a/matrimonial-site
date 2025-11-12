'use client';

import { ComponentType, Suspense, lazy } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LazyComponentProps {
  fallback?: React.ReactNode;
}

/**
 * Higher-order component to lazy load components
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);

  return function LazyWrapper(props: any) {
    return (
      <Suspense fallback={fallback || <LoadingSpinner size="md" text="Loading..." />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Lazy load a component with a custom fallback
 */
export default function LazyComponent({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <Suspense fallback={fallback || <LoadingSpinner size="md" text="Loading..." />}>
      {children}
    </Suspense>
  );
}

