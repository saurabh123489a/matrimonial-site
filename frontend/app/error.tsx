'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h1>
          <p className="text-gray-600 mb-6">{error.message || 'An unexpected error occurred'}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={reset}
              className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
            >
              Try again
            </button>
            <a
              href="/"
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

