import prisma from '../prisma/client.js';

/**
 * GET /api/admin/permissions/stats
 * - Barber role: count from Barber table only.
 * - User role: count from User table only, excluding ADMIN users.
 */
export const getPermissionCounts = async (req, res) => {
  try {
    const [barberCount, userCountExcludingAdmin] = await Promise.all([
      prisma.barber.count(),
      prisma.user.count({
        where: {
          role: { notIn: ['admin', 'ADMIN'] },
        },
      }),
    ]);

    const permissions = [
      { name: 'Barber', assignedUsers: barberCount },
      { name: 'User', assignedUsers: userCountExcludingAdmin },
    ];

    return res.json({
      success: true,
      data: {
        users: userCountExcludingAdmin,
        barbers: barberCount,
        permissions,
      },
    });
  } catch (error) {
    console.error('Admin getPermissionCounts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch permission counts',
    });
  }
};

