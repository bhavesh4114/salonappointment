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
export const updateBarberAvailability = async (req, res) => {
  try {
    const { available } = req.body
    const barberId = req.user.id   // authMiddleware mathi

    if (typeof available !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Invalid availability value',
      })
    }

    const updateData = {
      isAvailable: available,
    }

    if (available === true) {
      updateData.dutyStartedAt = new Date()
      updateData.dutyEndedAt = null
    } else {
      updateData.dutyEndedAt = new Date()
    }

    const barber = await prisma.barber.update({
      where: { id: barberId },
      data: updateData,
    })

    return res.json({
      success: true,
      available: barber.isAvailable,
      dutyStartedAt: barber.dutyStartedAt,
      dutyEndedAt: barber.dutyEndedAt,
    })
  } catch (error) {
    console.error('Update barber availability error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}
