'use client';

import { useEffect } from 'react';

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Profile page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Failed to load profile</h1>
          <p className="text-gray-600 mb-4">{error.message || 'An error occurred while loading your profile'}</p>
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 text-left">
            <p className="text-sm text-red-800">
              <strong>Possible causes:</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
              <li>Session expired - Please login again</li>
              <li>Database connection issue</li>
              <li>Profile not found</li>
              <li>Network connectivity problem</li>
            </ul>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={reset}
              className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
            >
              Try again
            </button>
            <a
              href="/login"
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Go to login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

