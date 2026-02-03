import prisma from "../prisma/client.js";

const COMPLETED_STATUSES = ["confirmed", "CONFIRMED", "completed", "COMPLETED", "paid", "PAID"];
const EARNINGS_STATUSES = ["confirmed", "CONFIRMED", "completed", "COMPLETED", "paid", "PAID", "pending", "PENDING"];
const TRANSACTION_LIMIT = 50;

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function getCurrentWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

/**
 * GET /api/barber/earnings
 * BarberId from JWT only via req.user (barberAuth). Do NOT pass barberId from frontend.
 */
export const getBarberEarnings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in again." });
    }
    if (String(req.user.role || "").toUpperCase() !== "BARBER") {
      return res.status(403).json({ success: false, message: "Access denied: Not a barber" });
    }
    const barberId = req.user.id;
    const numBarberId = barberId != null ? Number(barberId) : NaN;
    if (!numBarberId || Number.isNaN(numBarberId)) {
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in again." });
    }

    const whereCompleted = { barberId: numBarberId, status: { in: COMPLETED_STATUSES } };
    const { start: monthStart, end: monthEnd } = getMonthRange();
    const { start: weekStart, end: weekEnd } = getCurrentWeekRange();

    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const daysElapsed = Math.max(1, dayOfMonth);
    const remainingDays = Math.max(0, daysInMonth - dayOfMonth);

    const [
      totalEarnedAllTime,
      monthAggregate,
      weekAppointments,
      transactionAppointments,
      completedCount,
      withdrawnSum,
    ] = await Promise.all([
      prisma.appointment.aggregate({
        where: whereCompleted,
        _sum: { totalAmount: true },
      }),
      prisma.appointment.aggregate({
        where: {
          barberId: numBarberId,
          status: { in: COMPLETED_STATUSES },
          appointmentDate: { gte: monthStart, lte: monthEnd },
        },
        _sum: { totalAmount: true },
      }),
      prisma.appointment.findMany({
        where: {
          barberId: numBarberId,
          status: { in: COMPLETED_STATUSES },
          appointmentDate: { gte: weekStart, lte: weekEnd },
        },
        select: { appointmentDate: true, totalAmount: true },
      }),
      prisma.appointment.findMany({
        where: { barberId: numBarberId, status: { in: EARNINGS_STATUSES } },
        orderBy: [{ appointmentDate: "desc" }, { appointmentTime: "desc" }],
        take: TRANSACTION_LIMIT,
        select: {
          id: true,
          appointmentDate: true,
          appointmentTime: true,
          totalAmount: true,
          status: true,
          user: { select: { id: true, fullName: true, avatar: true } },
          services: {
            select: {
              service: { select: { name: true } },
              price: true,
              quantity: true },
          },
        },
      }),
      prisma.appointment.count({ where: whereCompleted }),
      prisma.barberPayment
        .aggregate({
          where: { barberId: numBarberId, status: "SUCCESS" },
          _sum: { amount: true },
        })
        .then((r) => (r._sum?.amount ?? 0) / 100),
    ]).catch((err) => {
      console.error("getBarberEarnings queries error:", err);
      throw err;
    });

    const totalEarnedAll = Number(totalEarnedAllTime._sum?.totalAmount ?? 0);
    const totalEarnedThisMonth = Number(monthAggregate._sum?.totalAmount ?? 0);
    const withdrawn = Number(withdrawnSum) || 0;
    const availableBalance = Math.max(0, totalEarnedAll - withdrawn);

    const avgPerDayThisMonth = daysElapsed > 0 ? totalEarnedThisMonth / daysElapsed : 0;
    const projectedEndOfMonth = totalEarnedThisMonth + avgPerDayThisMonth * remainingDays;
    const avgPerService = completedCount > 0 ? totalEarnedAll / completedCount : 0;

    const weekByDay = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const a of weekAppointments) {
      const d = new Date(a.appointmentDate);
      const dayIndex = d.getDay();
      weekByDay[dayIndex] = (weekByDay[dayIndex] || 0) + Number(a.totalAmount || 0);
    }
    const weeklyPerformance = [
      weekByDay[1],
      weekByDay[2],
      weekByDay[3],
      weekByDay[4],
      weekByDay[5],
      weekByDay[6],
      weekByDay[0],
    ];

    const transactions = transactionAppointments.map((a) => ({
      id: a.id,
      date: new Date(a.appointmentDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      customer: a.user?.fullName ?? "—",
      avatar: a.user?.avatar || null,
      service: (a.services || [])
        .map((s) => (s.service?.name ? `${s.service.name}` : ""))
        .filter(Boolean)
        .join(", ") || "—",
      amount: Number(a.totalAmount ?? 0),
      status: String(a.status || "").toUpperCase(),
    }));

    const monthName = now.toLocaleString("en-US", { month: "short" });

    return res.status(200).json({
      success: true,
      data: {
        availableBalance: Math.round(availableBalance * 100) / 100,
        totalEarnedThisMonth: Math.round(totalEarnedThisMonth * 100) / 100,
        monthName,
        projectedEndOfMonth: Math.round(projectedEndOfMonth * 100) / 100,
        avgPerService: Math.round(avgPerService * 100) / 100,
        weeklyPerformance,
        transactions,
        totalTransactions: transactions.length,
      },
    });
  } catch (error) {
    console.error("getBarberEarnings error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch earnings" });
  }
};
