import prisma from "../prisma/client.js";

const COMPLETED_STATUSES = ["confirmed", "CONFIRMED", "completed", "COMPLETED", "paid", "PAID"];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

/**
 * GET /api/barber/clients
 * BarberId from JWT only via req.user (set by barberAuth). Do NOT read from req.params or req.query.
 */
export const getBarberClients = async (req, res) => {
  try {
    if (!req.user) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[getBarberClients] req.user missing");
      }
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in again." });
    }
    if (String(req.user.role || "").toUpperCase() !== "BARBER") {
      return res.status(403).json({ success: false, message: "Access denied: Not a barber" });
    }
    const barberId = req.user.id;
    const numBarberId = barberId != null ? Number(barberId) : NaN;
    if (!numBarberId || Number.isNaN(numBarberId)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[getBarberClients] barberId missing from req.user:", req.user);
      }
      return res.status(401).json({ success: false, message: "Unauthorized. Please log in again." });
    }
    if (process.env.NODE_ENV !== "production") {
      console.log("[getBarberClients] req.user (barberId):", req.user.id);
    }
    const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
    const search = (req.query.search || "").trim();
    const skip = (page - 1) * limit;

    const where = {
      barberId: numBarberId,
      status: { in: COMPLETED_STATUSES },
    };

    const appointments = await prisma.appointment.findMany({
      where,
      select: {
        userId: true,
        appointmentDate: true,
        totalAmount: true,
        user: {
          select: {
            id: true,
            fullName: true,
            mobileNumber: true,
            avatar: true,
          },
        },
      },
      orderBy: { appointmentDate: "desc" },
    });

    if (appointments.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          clients: [],
          totalClients: 0,
          page,
          limit,
        },
      });
    }

    const searchLower = search.toLowerCase();
    const byUser = new Map();

    for (const a of appointments) {
      const uid = a.userId;
      const user = a.user;
      if (!user) continue;

      const fullName = user.fullName || "";
      const mobileNumber = user.mobileNumber || "";
      if (search && searchLower) {
        const matchName = fullName.toLowerCase().includes(searchLower);
        const matchPhone = mobileNumber.includes(search) || mobileNumber.replace(/\D/g, "").includes(search.replace(/\D/g, ""));
        if (!matchName && !matchPhone) continue;
      }

      if (!byUser.has(uid)) {
        byUser.set(uid, {
          userId: uid,
          fullName,
          mobileNumber,
          avatar: user.avatar || "",
          lastVisit: a.appointmentDate,
          totalVisits: 0,
          totalSpent: 0,
        });
      }
      const row = byUser.get(uid);
      row.totalVisits += 1;
      row.totalSpent += Number(a.totalAmount || 0);
      if (a.appointmentDate > row.lastVisit) {
        row.lastVisit = a.appointmentDate;
      }
    }

    const clientsArray = Array.from(byUser.values())
      .sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit));

    const totalClients = clientsArray.length;
    const clients = clientsArray.slice(skip, skip + limit).map((c) => ({
      userId: c.userId,
      fullName: c.fullName,
      mobileNumber: c.mobileNumber,
      avatar: c.avatar,
      lastVisit: c.lastVisit,
      totalVisits: c.totalVisits,
      totalSpent: c.totalSpent,
    }));

    return res.status(200).json({
      success: true,
      data: {
        clients,
        totalClients,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("getBarberClients error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch clients" });
  }
};
