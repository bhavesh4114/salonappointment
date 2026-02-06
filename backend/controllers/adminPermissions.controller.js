import prisma from '../prisma/client.js';

export const getPermissionCounts = async (req, res) => {
  try {
    const [userCount, barberCount] = await Promise.all([
      prisma.user.count(),
      prisma.barber.count(),
    ]);

    // Build permission-level stats with assignedUsers as required by the UI
    const permissions = [
      {
        name: 'Barber',
        assignedUsers: barberCount,
      },
      {
        name: 'User',
        assignedUsers: userCount,
      },
    ];

    return res.json({
      success: true,
      data: {
        users: userCount,
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

