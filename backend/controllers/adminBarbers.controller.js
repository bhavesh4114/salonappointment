import prisma from '../prisma/client.js';

/**
 * GET /api/admin/barbers
 * Admin Barber Management list.
 * - Data source: Barber table ONLY (NOT User).
 * - Includes relations: categories, services.
 * - Supports pagination (page, limit) and search (fullName, email, shopName).
 */
export const listBarbers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const search = (req.query.search || req.query.q || '').trim();

    const where = {};

    if (search) {
      const s = search;
      where.OR = [
        { fullName: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { shopName: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [barbers, total] = await Promise.all([
      prisma.barber.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          mobileNumber: true,
          shopName: true,
          shopAddress: true,
          isAvailable: true,
          createdAt: true,
          categories: {
            include: { category: true },
          },
          services: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.barber.count({ where }),
    ]);

    res.json({
      success: true,
      data: barbers,
      total,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Admin listBarbers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * GET /api/admin/barbers/stats
 * Top stat cards for Barber Management dashboard.
 * - Total Barbers: count of Barber records.
 * - Active Barbers: assume all are active unless status exists (so same as total).
 * - Suspended: 0 (no status field on Barber model).
 */
export const getBarberStats = async (req, res) => {
  try {
    const totalBarbers = await prisma.barber.count();

    res.json({
      success: true,
      stats: {
        totalBarbers,
        activeBarbers: totalBarbers,
        suspendedBarbers: 0,
      },
    });
  } catch (error) {
    console.error('Admin getBarberStats error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

