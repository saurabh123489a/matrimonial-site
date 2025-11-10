import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#8B0000] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-[#374151] mb-4">Page Not Found</h2>
        <p className="text-[#374151] mb-8">The page you are looking for does not exist.</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-[#8B0000] text-white rounded-md hover:bg-[#6B0000] transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

