import prisma from "../prisma/client.js";

export const getMyBookings = async (req, res) => {
  try {
    // 🔐 Logged-in user id (authMiddleware thi aave che)
    const userId = req.user.id;

    // 📦 User ni badhi bookings fetch karo
    const bookings = await prisma.appointment.findMany({
      where: {
        userId: userId
      },
      include: {
        barber: {
          select: {
            id: true,
            fullName: true
          }
        },
     services: {
  select: {
    id: true,
    price: true,
    serviceImage: true,   // 👈 THIS IS THE KEY LINE
    service: {
      select: {
        id: true,
        name: true,
        price: true
      }
    }
  }
}


      },
      orderBy: {
        appointmentDate: "desc"
      }
    });

    // ✅ Success response
    return res.status(200).json({
      success: true,
      bookings
    });

  } catch (error) {
    console.error("getMyBookings error:", error);

    // ❌ Error response
    return res.status(500).json({
      success: false,
      message: "Failed to fetch my bookings"
    });
  }
};
