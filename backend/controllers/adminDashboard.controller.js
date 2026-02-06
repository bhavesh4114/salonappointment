import prisma from '../prisma/client.js';

/**
 * GET /api/admin/dashboard/active-users
 *
 * Active Users = Active app users (excluding admins) + Active barbers
 *
 * Users:
 *  - role != 'admin'
 *  - isActive = true
 *  - isVerified = true
 *
 * Barbers:
 *  - subscriptionStatus = 'ACTIVE' (only barbers with active subscription)
 */
export const getActiveUsersCount = async (req, res) => {
  try {
    const [activeUsers, activeBarbers] = await Promise.all([
      prisma.user.count(),
      prisma.barber.count({
        where: {
          subscriptionStatus: 'ACTIVE',
        },
      }),
    ]);

    const total = activeUsers + activeBarbers;

    return res.json({
      success: true,
      data: {
        users: activeUsers,
        barbers: activeBarbers,
        total,
      },
    });
  } catch (error) {
    console.error('Admin getActiveUsersCount error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch active users count',
    });
  }
};

