import prisma from '../prisma/client.js';

/**
 * Normalize booking status from UI label to stored value.
 */
const mapStatusFilter = (status) => {
  if (!status) return null;
  const s = status.toLowerCase();
  if (s === 'pending') return 'pending';
  if (s === 'approved') return 'confirmed';
  if (s === 'completed') return 'completed';
  if (s === 'cancelled') return 'cancelled';
  return null;
};

/**
 * GET /api/admin/bookings
 * List bookings for admin Bookings Management page.
 * Supports search, status, date range, barber filter and pagination.
 */
export const listBookings = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));

    const search = (req.query.search || '').trim();
    const status = (req.query.status || '').trim();
    const barberName = (req.query.barber || '').trim();
    const startDateRaw = (req.query.startDate || '').trim();
    const endDateRaw = (req.query.endDate || '').trim();

    const andConditions = [];

    if (search) {
      const s = search;
      const orSearch = [
        { user: { fullName: { contains: s, mode: 'insensitive' } } },
        { barber: { fullName: { contains: s, mode: 'insensitive' } } },
      ];
      const numId = parseInt(s.replace(/[^0-9]/g, ''), 10);
      if (!Number.isNaN(numId) && numId > 0) {
        orSearch.push({ id: numId });
      }
      andConditions.push({ OR: orSearch });
    }

    if (barberName) {
      andConditions.push({
        barber: {
          fullName: { contains: barberName, mode: 'insensitive' },
        },
      });
    }

    const normalizedStatus = mapStatusFilter(status);
    if (normalizedStatus) {
      andConditions.push({ status: normalizedStatus });
    }

    if (startDateRaw || endDateRaw) {
      const dateCond = {};
      if (startDateRaw) {
        const start = new Date(startDateRaw);
        if (!Number.isNaN(start.getTime())) {
          dateCond.gte = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
        }
      }
      if (endDateRaw) {
        const end = new Date(endDateRaw);
        if (!Number.isNaN(end.getTime())) {
          dateCond.lte = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999);
        }
      }
      if (Object.keys(dateCond).length > 0) {
        andConditions.push({ appointmentDate: dateCond });
      }
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          user: { select: { fullName: true } },
          barber: { select: { fullName: true } },
          services: {
            include: {
              service: { select: { name: true } },
            },
          },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ]);

    res.json({
      success: true,
      data: appointments,
      total,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Admin listBookings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * GET /api/admin/bookings/stats
 * Summary stats for Bookings Management page.
 */
export const getBookingStats = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    const sevenDaysStart = new Date(
      sevenDaysAgo.getFullYear(),
      sevenDaysAgo.getMonth(),
      sevenDaysAgo.getDate(),
      0,
      0,
      0,
      0,
    );

    const [totalToday, pendingApprovals, revenueAgg] = await Promise.all([
      prisma.appointment.count({
        where: { appointmentDate: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.appointment.count({
        where: { status: 'pending' },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { paymentStatus: { in: ['completed', 'COMPLETED'] } },
      }),
    ]);

    const trendLast7Days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
      const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
      // eslint-disable-next-line no-await-in-loop
      const count = await prisma.appointment.count({
        where: {
          appointmentDate: {
            gte: start,
            lte: end,
          },
        },
      });
      trendLast7Days.push(count);
    }

    res.json({
      success: true,
      stats: {
        totalToday,
        pendingApprovals,
        totalRevenue: revenueAgg._sum.amount || 0,
        trendLast7Days,
      },
    });
  } catch (error) {
    console.error('Admin getBookingStats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

