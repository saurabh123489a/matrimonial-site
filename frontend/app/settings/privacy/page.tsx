'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';
import { useNotifications } from '@/contexts/NotificationContext';
import Link from 'next/link';

export default function PrivacySettingsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    profileVisibility: 'public', 
    showOnlineStatus: true,
    showLastSeen: true,
    allowProfileViews: true,
    allowMessages: true,
    allowInterests: true,
    showPhoneNumber: false,
    showEmail: false,
  });

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await userApi.getMe();
      if (response.status && response.data) {
        
        const userData = response.data as any; 
        setSettings({
          profileVisibility: userData.profileVisibility || 'public',
          showOnlineStatus: userData.showOnlineStatus !== false,
          showLastSeen: userData.showLastSeen !== false,
          allowProfileViews: userData.allowProfileViews !== false,
          allowMessages: userData.allowMessages !== false,
          allowInterests: userData.allowInterests !== false,
          showPhoneNumber: userData.showPhoneNumber || false,
          showEmail: userData.showEmail || false,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await userApi.updateMe(settings as any);
      if (response.status) {
        showSuccess('Privacy settings updated successfully');
      }
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Settings Navigation */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <Link
            href="/settings/privacy"
            className="px-4 py-2 font-medium border-b-2 border-pink-600 text-pink-600"
          >
            Privacy
          </Link>
          <Link
            href="/settings/language"
            className="px-4 py-2 font-medium text-gray-600"
          >
            Language
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-light text-gray-900">Privacy Settings</h1>

        <div className="space-y-6">
          {/* Profile Visibility */}
          <div className="bg-white">
            <h2 className="text-lg font-semibold text-gray-900">Profile Visibility</h2>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={settings.profileVisibility === 'public'}
                  onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Public</div>
                  <div className="text-sm text-gray-500">Visible to everyone</div>
                </div>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visibility"
                  value="members-only"
                  checked={settings.profileVisibility === 'members-only'}
                  onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Members Only</div>
                  <div className="text-sm text-gray-500">Visible to registered members only</div>
                </div>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={settings.profileVisibility === 'private'}
                  onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">Private</div>
                  <div className="text-sm text-gray-500">Only visible to you</div>
                </div>
              </label>
            </div>
          </div>

          {/* Activity Status */}
          <div className="bg-white">
            <h2 className="text-lg font-semibold text-gray-900">Activity Status</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Show Online Status</div>
                  <div className="text-sm text-gray-500">Display when you're online</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showOnlineStatus}
                  onChange={(e) => setSettings({ ...settings, showOnlineStatus: e.target.checked })}
                  className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Show Last Seen</div>
                  <div className="text-sm text-gray-500">Display when you were last active</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showLastSeen}
                  onChange={(e) => setSettings({ ...settings, showLastSeen: e.target.checked })}
                  className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                />
              </label>
            </div>
          </div>

          {/* Contact Preferences */}
          <div className="bg-white">
            <h2 className="text-lg font-semibold text-gray-900">Contact Preferences</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Allow Profile Views</div>
                  <div className="text-sm text-gray-500">Let others see when you view their profile</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowProfileViews}
                  onChange={(e) => setSettings({ ...settings, allowProfileViews: e.target.checked })}
                  className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Allow Messages</div>
                  <div className="text-sm text-gray-500">Allow others to send you messages</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowMessages}
                  onChange={(e) => setSettings({ ...settings, allowMessages: e.target.checked })}
                  className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Allow Interests</div>
                  <div className="text-sm text-gray-500">Allow others to send you interest requests</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowInterests}
                  onChange={(e) => setSettings({ ...settings, allowInterests: e.target.checked })}
                  className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                />
              </label>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white">
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Show Phone Number</div>
                  <div className="text-sm text-gray-500">Display your phone number on profile</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showPhoneNumber}
                  onChange={(e) => setSettings({ ...settings, showPhoneNumber: e.target.checked })}
                  className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Show Email</div>
                  <div className="text-sm text-gray-500">Display your email on profile</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showEmail}
                  onChange={(e) => setSettings({ ...settings, showEmail: e.target.checked })}
                  className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                />
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-black"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

