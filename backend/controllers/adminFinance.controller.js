import prisma from '../prisma/client.js';
import { calculateFinanceSplit } from '../utils/financeCalculator.js';

const COMPLETED_STATUSES = ['completed', 'COMPLETED', 'paid', 'PAID', 'confirmed', 'CONFIRMED'];

const getDateRange = (range, startDateRaw, endDateRaw) => {
  // startDate / endDate override range if provided
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
    return Object.keys(dateCond).length > 0 ? dateCond : null;
  }

  const r = String(range || '').toLowerCase();
  const now = new Date();
  if (r === 'last7' || r === 'last-7-days') {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { gte: start, lte: end };
  }
  if (r === 'last90' || r === 'last-90-days') {
    const start = new Date(now);
    start.setDate(now.getDate() - 89);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { gte: start, lte: end };
  }
  if (r === 'last30' || r === 'last-30-days') {
    const start = new Date(now);
    start.setDate(now.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { gte: start, lte: end };
  }
  return null; // no filter – all time
};

/**
 * GET /api/admin/finance/summary
 * Aggregates finance numbers from completed bookings using calculateFinanceSplit.
 * Query params (optional):
 *   - range: last30 | last7 | last90
 *   - startDate, endDate: ISO date strings
 */
export const getFinanceSummary = async (req, res) => {
  try {
    const { range, startDate, endDate } = req.query;

    const where = {
      status: { in: COMPLETED_STATUSES },
      paymentStatus: { in: ['paid', 'PAID', 'completed', 'COMPLETED'] },
    };

    const dateCond = getDateRange(range, startDate, endDate);
    if (dateCond) {
      where.appointmentDate = dateCond;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      select: {
        id: true,
        totalAmount: true,
        appointmentDate: true,
      },
      orderBy: { appointmentDate: 'asc' },
    });

    let totalRevenue = 0;
    let totalPlatformFee = 0;
    let totalBarberEarning = 0;
    let totalGst = 0;

    const trendByMonth = new Map(); // 'JAN 2026' -> revenue sum

    for (const a of appointments) {
      const amount = Number(a.totalAmount || 0);
      totalRevenue += amount;

      const split = calculateFinanceSplit(amount);
      totalPlatformFee += split.platformFee;
      totalBarberEarning += split.barberEarning;
      totalGst += split.gstAmount;

      const d = new Date(a.appointmentDate);
      const key = `${d.toLocaleString('en-US', { month: 'short' }).toUpperCase()} ${d.getFullYear()}`;
      trendByMonth.set(key, (trendByMonth.get(key) || 0) + amount);
    }

    const revenueTrend = Array.from(trendByMonth.entries()).map(([label, revenue]) => ({
      label,
      revenue,
    }));

    res.json({
      success: true,
      summary: {
        totalRevenue: Math.round(totalRevenue),
        platformEarnings: Math.round(totalPlatformFee),
        barberPayouts: Math.round(totalBarberEarning),
        gstCollected: Math.round(totalGst),
      },
      revenueTrend,
    });
  } catch (error) {
    console.error('Admin getFinanceSummary error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

