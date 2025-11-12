'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { reportApi, userApi } from '@/lib/api';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { getProfileUrl } from '@/lib/profileUtils';

interface Report {
  _id: string;
  reportedUserId: {
    _id: string;
    name: string;
    email?: string;
    photos?: Array<{ url: string }>;
    gahoiId?: number;
  };
  reportedBy: {
    _id: string;
    name: string;
    communityPosition?: string;
  };
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Check if user is admin
    const checkAdmin = async () => {
      try {
        const response = await userApi.getMe();
        if (response.status && response.data) {
          const user = response.data;
          setCurrentUser(user);
          if (!user.isAdmin) {
            alert('Access denied. Admin privileges required.');
            router.push('/');
            return;
          }
          loadReports();
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/login');
      }
    };

    checkAdmin();
  }, [router, statusFilter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await reportApi.getAllReports({
        status: statusFilter || undefined,
        page: 1,
        limit: 100,
      });
      if (response.status) {
        setReports(response.data || []);
      }
    } catch (error: any) {
      console.error('Error loading reports:', error);
      if (error.response?.status === 403) {
        alert('Access denied. Admin privileges required.');
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: string, status: string) => {
    try {
      setUpdateLoading(true);
      const response = await reportApi.updateReportStatus(reportId, {
        status,
        adminNotes: adminNotes || undefined,
      });
      if (response.status) {
        alert('Report status updated successfully');
        setSelectedReport(null);
        setAdminNotes('');
        loadReports();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update report status');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      'inappropriate-content': 'Inappropriate Content',
      'fake-profile': 'Fake Profile',
      'misleading-information': 'Misleading Information',
      'harassment': 'Harassment',
      'spam': 'Spam',
      'other': 'Other',
    };
    return labels[reason] || reason;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600">Loading admin board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Board - Reported Profiles</h1>
          <p className="mt-2 text-gray-600">Review and manage profile reports</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4 items-center">
          <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
            Filter by Status:
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <span className="text-sm text-gray-600">
            Total Reports: {reports.length}
          </span>
        </div>

        {/* Reports List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reported Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reported By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No reports found
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={getProfileUrl({ _id: report.reportedUserId._id, gahoiId: report.reportedUserId.gahoiId })}
                          className="flex items-center gap-3 text-pink-600 hover:text-pink-700"
                        >
                          {report.reportedUserId.photos?.[0] && (
                            <img
                              src={report.reportedUserId.photos[0].url}
                              alt={report.reportedUserId.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{report.reportedUserId.name}</div>
                            <div className="text-xs text-gray-500">{report.reportedUserId.email}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{report.reportedBy.name}</div>
                        <div className="text-xs text-gray-500">
                          {report.reportedBy.communityPosition || 'No position'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{getReasonLabel(report.reason)}</div>
                        {report.description && (
                          <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                            {report.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="text-pink-600 hover:text-pink-900 mr-3"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report Detail Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Report Details</h2>
                  <button
                    onClick={() => {
                      setSelectedReport(null);
                      setAdminNotes('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reported Profile</label>
                    <Link
                      href={getProfileUrl({ _id: selectedReport.reportedUserId._id, gahoiId: selectedReport.reportedUserId.gahoiId })}
                      className="mt-1 flex items-center gap-3 text-pink-600 hover:text-pink-700"
                    >
                      {selectedReport.reportedUserId.photos?.[0] && (
                        <img
                          src={selectedReport.reportedUserId.photos[0].url}
                          alt={selectedReport.reportedUserId.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{selectedReport.reportedUserId.name}</div>
                        <div className="text-sm text-gray-500">{selectedReport.reportedUserId.email}</div>
                      </div>
                    </Link>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reported By</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedReport.reportedBy.name} ({selectedReport.reportedBy.communityPosition || 'No position'})
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reason</label>
                    <p className="mt-1 text-sm text-gray-900">{getReasonLabel(selectedReport.reason)}</p>
                  </div>

                  {selectedReport.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedReport.description}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Status</label>
                    <span
                      className={`mt-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        selectedReport.status
                      )}`}
                    >
                      {selectedReport.status}
                    </span>
                  </div>

                  {selectedReport.adminNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedReport.adminNotes}</p>
                    </div>
                  )}

                  <div>
                    <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700">
                      Admin Notes (Optional)
                    </label>
                    <textarea
                      id="adminNotes"
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm p-2"
                      placeholder="Add notes about your review..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => handleUpdateStatus(selectedReport._id, 'resolved')}
                      disabled={updateLoading}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedReport._id, 'reviewed')}
                      disabled={updateLoading}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Mark Reviewed
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedReport._id, 'dismissed')}
                      disabled={updateLoading}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

