'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { healthApi, userApi, DatabaseStatus } from '@/lib/api';
import { auth } from '@/lib/auth';

export default function DatabaseStatusPage() {
  const router = useRouter();
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!auth.isAuthenticated()) {
        router.push('/login');
        return;
      }
      try {
        const response = await userApi.getMe();
        if (response.status && response.data) {
          setIsAdmin(response.data.isAdmin || false);
          if (response.data.isAdmin) {
            loadDbStatus();
          } else {
            router.push('/');
          }
        }
      } catch (err) {
        router.push('/login');
      }
    };
    checkAdmin();
  }, [router]);

  useEffect(() => {
    if (!autoRefresh || !isAdmin) return;
    
    const interval = setInterval(() => {
      loadDbStatus();
    }, 5000); 

    return () => clearInterval(interval);
  }, [autoRefresh, isAdmin]);

  const loadDbStatus = async () => {
    try {
      const response = await healthApi.checkDatabase();
      if (response.status) {
        setDbStatus(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load DB status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600">Loading database status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className={`p-6 ${dbStatus?.status ? 'bg-green-50 border-l-4 border-green-600' : 'bg-red-50 border-l-4 border-red-600'}`}>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Database Status</h1>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Auto-refresh
              </label>
              <button
                onClick={loadDbStatus}
                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
              >
                Refresh
              </button>
            </div>
          </div>

          {dbStatus && (
            <div className="space-y-4">
              {/* Status Card */}
              <div className={`p-4 rounded-lg border-2 ${
                dbStatus.status
                  ? 'bg-green-100 border-green-500'
                  : 'bg-red-100 border-red-500'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`text-4xl ${dbStatus.status ? 'text-green-600' : 'text-red-600'}`}>
                    {dbStatus.status ? '✅' : '❌'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{dbStatus.message}</h2>
                    <p className="text-sm text-gray-700">State: {dbStatus.connectionState}</p>
                  </div>
                </div>
              </div>

              {/* Connection Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Database</p>
                  <p className="text-lg font-semibold text-gray-900">{dbStatus.database || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Host</p>
                  <p className="text-lg font-semibold text-gray-900">{dbStatus.host}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Port</p>
                  <p className="text-lg font-semibold text-gray-900">{dbStatus.port}</p>
                </div>
              </div>

              {/* Collections */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">Collections ({dbStatus.collections})</h3>
                <div className="flex flex-wrap gap-2">
                  {dbStatus.collectionNames?.map((name, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white border border-blue-300 rounded-md text-sm font-medium text-blue-700"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Connection Info</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">State Code:</span> {dbStatus.stateCode}</p>
                  <p><span className="font-medium">MongoDB URI:</span> {dbStatus.mongoUri}</p>
                  <p><span className="font-medium">Last Checked:</span> {new Date(dbStatus.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

