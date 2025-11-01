'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userApi, adminApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import { useTranslation } from '@/hooks/useTranslation';
import { useNotifications } from '@/contexts/NotificationContext';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  pendingReports: number;
  resolvedReports: number;
  adminUsers: number;
  totalReports: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { showError } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'messages' | 'notifications' | 'create-admin'>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const checkAdmin = async () => {
      try {
        const response = await userApi.getMe();
        if (response.status && response.data) {
               const user = response.data;
                 setCurrentUser(user);
                 if (!user.isAdmin) {
                   showError('Access denied. Admin privileges required.');
                   router.push('/');
                   return;
                 }
          loadStats();
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  const loadStats = async () => {
    try {
      const response = await adminApi.getDashboardStats();
      if (response.status && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set placeholder stats on error
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        pendingReports: 0,
        resolvedReports: 0,
        adminUsers: 0,
        totalReports: 0,
      });
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.portal')}</h1>
          <p className="mt-2 text-gray-600">{t('admin.overview')}</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'dashboard', label: t('admin.dashboard'), icon: '📊' },
                { id: 'users', label: t('admin.manageUsers'), icon: '👥' },
                { id: 'messages', label: t('admin.allMessages'), icon: '💬' },
                { id: 'notifications', label: t('admin.notifications'), icon: '🔔' },
                { id: 'create-admin', label: t('admin.createAdmin'), icon: '➕' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-pink-600 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'dashboard' && (
              <DashboardTab stats={stats} />
            )}
            {activeTab === 'users' && (
              <UsersTab />
            )}
            {activeTab === 'messages' && (
              <MessagesTab />
            )}
            {activeTab === 'notifications' && (
              <NotificationsTab />
            )}
            {activeTab === 'create-admin' && (
              <CreateAdminTab />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardTab({ stats }: { stats: DashboardStats | null }) {
  const { t } = useTranslation();
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.dashboardTab.title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-3xl font-bold">{stats?.totalUsers || '0'}</div>
          <div className="text-blue-100 mt-2">{t('admin.dashboardTab.totalUsers')}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-3xl font-bold">{stats?.activeUsers || '0'}</div>
          <div className="text-green-100 mt-2">{t('admin.dashboardTab.activeUsers')}</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-3xl font-bold">{stats?.pendingReports || '0'}</div>
          <div className="text-yellow-100 mt-2">{t('admin.dashboardTab.pendingReports')}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="text-3xl font-bold">{stats?.adminUsers || '0'}</div>
          <div className="text-purple-100 mt-2">{t('admin.dashboardTab.adminUsers')}</div>
        </div>
      </div>
      <div className="mt-6">
        <Link
          href="/admin/reports"
          className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
        >
          {t('admin.dashboardTab.viewAllReports')} →
        </Link>
      </div>
    </div>
  );
}

function UsersTab() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [genderFilter, setGenderFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    loadUsers();
  }, [page, statusFilter, genderFilter, search]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const filters: any = {
        page,
        limit: 20,
      };
      
      if (search) filters.search = search;
      if (statusFilter === 'active') filters.isActive = true;
      if (statusFilter === 'inactive') filters.isActive = false;
      if (genderFilter) filters.gender = genderFilter;

      const response = await adminApi.getAllUsers(filters);
      if (response.status) {
        setUsers(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await adminApi.updateUser(selectedUser._id, editData);
      if (response.status) {
        showSuccess(t('admin.usersTab.updated'));
        setShowEditModal(false);
        setSelectedUser(null);
        setEditData({});
        loadUsers();
      }
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(t('admin.usersTab.confirmDelete', { name: userName }))) {
      return;
    }

    try {
      const response = await adminApi.deleteUser(userId);
      if (response.status) {
        showSuccess(t('admin.usersTab.deleted'));
        loadUsers();
      }
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleToggleActive = async (user: any) => {
    try {
      const response = await adminApi.updateUser(user._id, { isActive: !user.isActive });
      if (response.status) {
        showSuccess(t('admin.usersTab.statusUpdated'));
        loadUsers();
      }
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setEditData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      isAdmin: user.isAdmin,
      gender: user.gender,
      age: user.age,
    });
    setShowEditModal(true);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('admin.usersTab.title')}</h2>
      <p className="text-gray-600 mb-6">{t('admin.usersTab.description')}</p>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.usersTab.search')}</label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t('admin.usersTab.searchPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.usersTab.status')}</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
            >
              <option value="all">{t('admin.usersTab.allUsers')}</option>
              <option value="active">{t('admin.usersTab.active')}</option>
              <option value="inactive">{t('admin.usersTab.inactive')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.usersTab.gender')}</label>
            <select
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
            >
              <option value="">{t('admin.usersTab.allGenders')}</option>
              <option value="male">{t('auth.male')}</option>
              <option value="female">{t('auth.female')}</option>
              <option value="other">{t('auth.other')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
          <p className="mt-2 text-gray-600">{t('admin.usersTab.loading')}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-600">{t('admin.usersTab.noUsers')}</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.usersTab.user')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.usersTab.contact')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.usersTab.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.usersTab.role')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.usersTab.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.photos && user.photos.length > 0 ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.photos.find((p: any) => p.isPrimary)?.url || user.photos[0]?.url || '/default-avatar.png'}
                                alt={user.name}
                                loading="lazy"
                                decoding="async"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">
                              {user.gender} {user.age ? `• ${user.age} years` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{user.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? t('admin.usersTab.active') : t('admin.usersTab.inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.isAdmin ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            {t('admin.createAdmin')}
                          </span>
                        ) : (
                          t('admin.usersTab.user')
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-pink-600 hover:text-pink-900"
                        >
                          {t('admin.usersTab.edit')}
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`${
                            user.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {user.isActive ? t('admin.usersTab.deactivate') : t('admin.usersTab.activate')}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          {t('admin.usersTab.delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t('admin.usersTab.editUser')}: {selectedUser.name}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.name')}</label>
                  <input
                    type="text"
                    value={editData.name || ''}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.email')}</label>
                  <input
                    type="email"
                    value={editData.email || ''}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.phone')}</label>
                  <input
                    type="tel"
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.usersTab.status')}</label>
                    <select
                      value={editData.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setEditData({ ...editData, isActive: e.target.value === 'active' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
                    >
                      <option value="active">{t('admin.usersTab.active')}</option>
                      <option value="inactive">{t('admin.usersTab.inactive')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.usersTab.role')}</label>
                    <select
                      value={editData.isAdmin ? 'admin' : 'user'}
                      onChange={(e) => setEditData({ ...editData, isAdmin: e.target.value === 'admin' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
                    >
                      <option value="user">{t('admin.usersTab.user')}</option>
                      <option value="admin">{t('admin.createAdmin')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                    setEditData({});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleUpdateUser}
                  className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
                >
                  {t('admin.usersTab.saveChanges')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MessagesTab() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [senderFilter, setSenderFilter] = useState('');
  const [receiverFilter, setReceiverFilter] = useState('');
  const [isReadFilter, setIsReadFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  useEffect(() => {
    loadMessages();
  }, [page, search, senderFilter, receiverFilter, isReadFilter]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const filters: any = {
        page,
        limit: 50,
      };
      
      if (search) filters.search = search;
      if (senderFilter) filters.senderId = senderFilter;
      if (receiverFilter) filters.receiverId = receiverFilter;
      if (isReadFilter !== '') filters.isRead = isReadFilter === 'read';

      const response = await adminApi.getAllMessages(filters);
      if (response.status) {
        setMessages(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
        setTotal(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPrimaryPhoto = (photos: any[]) => {
    if (!photos || photos.length === 0) return '/default-avatar.png';
    const primary = photos.find((p: any) => p.isPrimary);
    return primary?.url || photos[0]?.url || '/default-avatar.png';
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('admin.messagesTab.title')}</h2>
      <p className="text-gray-600 mb-6">{t('admin.messagesTab.description')}</p>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.messagesTab.searchContent')}</label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t('admin.messagesTab.searchPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.messagesTab.senderId')}</label>
            <input
              type="text"
              value={senderFilter}
              onChange={(e) => {
                setSenderFilter(e.target.value);
                setPage(1);
              }}
              placeholder={t('admin.messagesTab.senderIdPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.messagesTab.receiverId')}</label>
            <input
              type="text"
              value={receiverFilter}
              onChange={(e) => {
                setReceiverFilter(e.target.value);
                setPage(1);
              }}
              placeholder={t('admin.messagesTab.receiverIdPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.messagesTab.readStatus')}</label>
            <select
              value={isReadFilter}
              onChange={(e) => {
                setIsReadFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
            >
              <option value="">{t('admin.messagesTab.all')}</option>
              <option value="read">{t('admin.messagesTab.read')}</option>
              <option value="unread">{t('admin.messagesTab.unread')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
          <p className="mt-2 text-gray-600">{t('admin.messagesTab.loading')}</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-600">{t('admin.messagesTab.noMessages')}</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            {t('admin.messagesTab.totalMessages')}: {total}
          </div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.messagesTab.from')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.messagesTab.to')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.messagesTab.message')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.messagesTab.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.messagesTab.date')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('admin.messagesTab.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {messages.map((message) => {
                    const sender = typeof message.senderId === 'object' ? message.senderId : { _id: message.senderId, name: 'Unknown', photos: [] };
                    const receiver = typeof message.receiverId === 'object' ? message.receiverId : { _id: message.receiverId, name: 'Unknown', photos: [] };
                    
                    return (
                      <tr key={message._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={getPrimaryPhoto((sender as any).photos || [])}
                              alt={(sender as any).name}
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/default-avatar.png';
                              }}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{(sender as any).name || 'Unknown'}</div>
                              <div className="text-sm text-gray-500">ID: {(sender as any)._id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={getPrimaryPhoto((receiver as any).photos || [])}
                              alt={(receiver as any).name}
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/default-avatar.png';
                              }}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{(receiver as any).name || 'Unknown'}</div>
                              <div className="text-sm text-gray-500">ID: {(receiver as any)._id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-md truncate" title={message.content}>
                            {message.content}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            message.isRead
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {message.isRead ? t('admin.messagesTab.read') : t('admin.messagesTab.unread')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(message.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedMessage(message)}
                            className="text-pink-600 hover:text-pink-900"
                          >
                            {t('admin.messagesTab.view')}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedMessage(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{t('admin.messagesTab.messageDetails')}</h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2">{t('admin.messagesTab.from')}</h4>
                    <div className="flex items-center">
                      <img
                        className="h-12 w-12 rounded-full object-cover mr-3"
                        src={getPrimaryPhoto((typeof selectedMessage.senderId === 'object' ? selectedMessage.senderId : {} as any).photos || [])}
                        alt={(typeof selectedMessage.senderId === 'object' ? selectedMessage.senderId : {} as any).name}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-avatar.png';
                        }}
                      />
                      <div>
                        <div className="font-medium">{(typeof selectedMessage.senderId === 'object' ? selectedMessage.senderId : {} as any).name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">ID: {(typeof selectedMessage.senderId === 'object' ? selectedMessage.senderId : {} as any)._id}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2">{t('admin.messagesTab.to')}</h4>
                    <div className="flex items-center">
                      <img
                        className="h-12 w-12 rounded-full object-cover mr-3"
                        src={getPrimaryPhoto((typeof selectedMessage.receiverId === 'object' ? selectedMessage.receiverId : {} as any).photos || [])}
                        alt={(typeof selectedMessage.receiverId === 'object' ? selectedMessage.receiverId : {} as any).name}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-avatar.png';
                        }}
                      />
                      <div>
                        <div className="font-medium">{(typeof selectedMessage.receiverId === 'object' ? selectedMessage.receiverId : {} as any).name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">ID: {(typeof selectedMessage.receiverId === 'object' ? selectedMessage.receiverId : {} as any)._id}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">{t('admin.messagesTab.messageContent')}</h4>
                  <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap break-words" dir="auto">
                    {selectedMessage.content}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">{t('admin.messagesTab.status')}</h4>
                    <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                      selectedMessage.isRead
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedMessage.isRead ? `✓ ${t('admin.messagesTab.read')}` : `○ ${t('admin.messagesTab.unread')}`}
                    </span>
                    {selectedMessage.readAt && (
                      <div className="mt-2 text-sm text-gray-500">
                        {t('admin.messagesTab.readAt')}: {formatDate(selectedMessage.readAt)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">{t('admin.messagesTab.timestamps')}</h4>
                    <div className="text-sm text-gray-600">
                      <div>{t('admin.messagesTab.sent')}: {formatDate(selectedMessage.createdAt)}</div>
                      {selectedMessage.updatedAt && selectedMessage.updatedAt !== selectedMessage.createdAt && (
                        <div>{t('admin.messagesTab.updated')}: {formatDate(selectedMessage.updatedAt)}</div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedMessage.conversationId && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">{t('admin.messagesTab.conversationId')}</h4>
                    <div className="bg-gray-50 p-2 rounded text-sm font-mono text-gray-600">
                      {selectedMessage.conversationId}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationsTab() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const [notificationType, setNotificationType] = useState<'global' | 'personal'>('global');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendNotification = async () => {
    if (!title || !message) {
      showError(t('admin.notificationsTab.titleAndMessageRequired'));
      return;
    }

    if (notificationType === 'personal' && !userId) {
      showError(t('admin.notificationsTab.userIdRequired'));
      return;
    }

    setLoading(true);
    try {
      if (notificationType === 'global') {
        const response = await adminApi.sendGlobalNotification({ title, message });
        if (response.status) {
          showSuccess(t('admin.notificationsTab.globalSent'));
          setTitle('');
          setMessage('');
        }
      } else {
        const response = await adminApi.sendPersonalNotification({ userId, title, message });
        if (response.status) {
          showSuccess(t('admin.notificationsTab.personalSent'));
          setTitle('');
          setMessage('');
          setUserId('');
        }
      }
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Send Notifications</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Notification Type</label>
        <div className="flex gap-4">
          <button
            onClick={() => setNotificationType('global')}
            className={`px-4 py-2 rounded-md ${
              notificationType === 'global'
                ? 'bg-pink-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Global (All Users)
          </button>
          <button
            onClick={() => setNotificationType('personal')}
            className={`px-4 py-2 rounded-md ${
              notificationType === 'personal'
                ? 'bg-pink-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Personal (Specific User)
          </button>
        </div>
      </div>

      <div className="space-y-4 max-w-2xl">
        {notificationType === 'personal' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Notification message"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
          />
        </div>

        <button
          onClick={handleSendNotification}
          disabled={loading}
          className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50"
        >
          {loading ? 'Sending...' : `Send ${notificationType === 'global' ? 'Global' : 'Personal'} Notification`}
        </button>
      </div>
    </div>
  );
}

function CreateAdminTab() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    gender: 'male' as 'male' | 'female' | 'other',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!formData.name || !formData.password || !formData.gender) {
        const errorMsg = 'Name, password, and gender are required';
        setError(errorMsg);
        showError(errorMsg);
        setLoading(false);
        return;
      }

      if (!formData.email && !formData.phone) {
        const errorMsg = 'Either email or phone is required';
        setError(errorMsg);
        showError(errorMsg);
        setLoading(false);
        return;
      }

      const response = await adminApi.createAdminUser({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        password: formData.password,
        gender: formData.gender,
      });

      if (response.status) {
        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', password: '', gender: 'male' });
        showSuccess(t('admin.createAdminTab.created') + `: ${response.data.name}`);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to create admin user';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Admin User</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          💡 <strong>Quick Method:</strong> Run <code className="bg-blue-100 px-2 py-1 rounded">./createAdmin.sh</code> from the project root
        </p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-green-800">✅ Admin user created successfully!</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Admin name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="admin@ekgahoi.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone (Optional)</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="10 digit phone number"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
          />
          <p className="text-xs text-gray-500 mt-1">Either email or phone is required</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Strong password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
          <select
            required
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Admin User'}
        </button>
      </form>

      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Alternative Methods:</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div>
            <strong>1. Shell Script:</strong>
            <code className="block bg-white p-2 rounded mt-1">./createAdmin.sh "Admin Name" email@example.com 9876543210 password123 male</code>
          </div>
          <div>
            <strong>2. Node Script:</strong>
            <code className="block bg-white p-2 rounded mt-1">node backend/scripts/createAdmin.js "Admin Name" email@example.com 9876543210 password123 male</code>
          </div>
          <div>
            <strong>3. API Endpoint:</strong>
            <code className="block bg-white p-2 rounded mt-1">POST /api/admin/users/create-admin</code>
          </div>
        </div>
      </div>
    </div>
  );
}

