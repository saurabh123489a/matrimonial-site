import { userRepository } from '../repositories/userRepository.js';
import { reportRepository } from '../repositories/reportRepository.js';

/**
 * Admin Service - Business logic for admin operations
 */
export const adminService = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      pendingReports,
      resolvedReports,
      adminUsers,
    ] = await Promise.all([
      userRepository.count({}),
      userRepository.count({ isActive: true }),
      userRepository.count({ isActive: false }),
      reportRepository.count({ status: 'pending' }),
      reportRepository.count({ status: 'resolved' }),
      userRepository.count({ isAdmin: true }),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      pendingReports,
      resolvedReports,
      adminUsers,
      totalReports: pendingReports + resolvedReports,
    };
  },
};

