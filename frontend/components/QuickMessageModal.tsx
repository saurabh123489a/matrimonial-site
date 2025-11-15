'use client';

import { useState } from 'react';
import { messageApi } from '@/lib/api';
import { useNotifications } from '@/contexts/NotificationContext';
import { useRouter } from 'next/navigation';

interface QuickMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userPhoto?: string;
}

export default function QuickMessageModal({
  isOpen,
  onClose,
  userId,
  userName,
  userPhoto,
}: QuickMessageModalProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { showSuccess, showError } = useNotifications();
  const router = useRouter();

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!message.trim()) {
      showError('Please enter a message');
      return;
    }

    if (message.length > 5000) {
      showError('Message is too long (max 5000 characters)');
      return;
    }

    setSending(true);
    try {
      const response = await messageApi.send(userId, message.trim());
      if (response.status) {
        showSuccess('Message sent successfully!');
        setMessage('');
        onClose();
        // Optionally navigate to chat page
        router.push(`/messages/${userId}`);
      } else {
        showError(response.message || 'Failed to send message');
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-xl max-w-md w-full animate-scale-in">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            {userPhoto && (
              <img
                src={userPhoto}
                alt={userName}
                className="w-12 h-12 rounded-full object-cover border-2 border-pink-200"
              />
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-pink-300">
                Send Message to {userName}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              disabled={sending}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Message Input */}
          <div className="mb-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
              rows={6}
              maxLength={5000}
              disabled={sending}
              autoFocus
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Press Cmd/Ctrl + Enter to send
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {message.length}/5000
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={sending}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <span>💬</span>
                  Send Message
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

