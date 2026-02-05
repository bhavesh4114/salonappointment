import prisma from '../prisma/client.js';

/**
 * Base filter: ONLY users with role = "user". Admins are never included.
 */
const userRoleFilter = { role: 'user' };

/**
 * GET /api/admin/users
 * List users for admin User Management page.
 * - Fetches ONLY role = "user" (admins excluded).
 * - Supports pagination (page, limit) and search (q: name, email, id).
 * - Optional status filter: active | inactive.
 */
export const listUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const search = (req.query.search || req.query.q || '').trim();
    const statusFilter = (req.query.status || '').toLowerCase(); // active | inactive

    const where = { ...userRoleFilter };

    if (search) {
      const searchConditions = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
      const num = parseInt(search, 10);
      if (!Number.isNaN(num) && num > 0) {
        searchConditions.push({ id: num });
      }
      where.OR = searchConditions;
    }

    if (statusFilter === 'active') {
      where.isActive = true;
    } else if (statusFilter === 'inactive') {
      where.isActive = false;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          mobileNumber: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Admin listUsers error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * GET /api/admin/users/stats
 * Counts for User Management page: total users and active users.
 * - All counts are ONLY for role = "user" (admins excluded).
 */
export const getStats = async (req, res) => {
  try {
    const [totalUsers, activeUsers] = await Promise.all([
      prisma.user.count({ where: userRoleFilter }),
      prisma.user.count({ where: { ...userRoleFilter, isActive: true } }),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
      },
    });
  } catch (error) {
    console.error('Admin getStats error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
