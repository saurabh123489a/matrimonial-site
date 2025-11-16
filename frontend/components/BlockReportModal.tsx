'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface BlockReportModalProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  onBlock?: (userId: string) => void;
  onReport?: (userId: string, reason: string) => void;
}

export default function BlockReportModal({
  userId,
  userName,
  isOpen,
  onClose,
  onBlock,
  onReport,
}: BlockReportModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'block' | 'report'>('block');
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleBlock = async () => {
    if (onBlock) {
      setLoading(true);
      try {
        await onBlock(userId);
        onClose();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReport = async () => {
    if (onReport && reportReason) {
      setLoading(true);
      try {
        await onReport(userId, `${reportReason}: ${reportDetails}`);
        onClose();
        setReportReason('');
        setReportDetails('');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {activeTab === 'block' ? 'Block User' : 'Report User'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('block')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'block'
                  ? 'border-b-2 border-pink-600 text-pink-600'
                  : 'text-gray-500'
              }`}
            >
              Block
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'report'
                  ? 'border-b-2 border-pink-600 text-pink-600'
                  : 'text-gray-500'
              }`}
            >
              Report
            </button>
          </div>

          {/* Block Tab */}
          {activeTab === 'block' && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Blocking <strong>{userName}</strong> will prevent them from:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                <li>Viewing your profile</li>
                <li>Sending you messages</li>
                <li>Sending you interest requests</li>
                <li>Seeing your online status</li>
              </ul>
              <button
                onClick={handleBlock}
                disabled={loading}
                className="w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Blocking...' : 'Block User'}
              </button>
            </div>
          )}

          {/* Report Tab */}
          {activeTab === 'report' && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Report <strong>{userName}</strong> for:
              </p>
              <div className="space-y-2">
                {['Inappropriate content', 'Fake profile', 'Harassment', 'Spam', 'Other'].map((reason) => (
                  <label key={reason} className="flex items-center">
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={reportReason === reason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300"
                  placeholder="Provide more details..."
                />
              </div>
              <button
                onClick={handleReport}
                disabled={loading || !reportReason}
                className="w-full px-4 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Reporting...' : 'Report User'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

