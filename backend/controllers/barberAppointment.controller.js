import prisma from "../prisma/client.js";

export const getBarberAppointments = async (req, res) => {
  try {
    console.log("🔥 controller hit");
    console.log("req.barber =>", req.barber);

    if (!req.barber || !req.barber.id) {
      return res.status(401).json({
        success: false,
        message: "Barber not authenticated"
      });
    }

    const barberId = Number(req.barber.id);

    const appointments = await prisma.appointment.findMany({
      where: {
        barberId: barberId   // 🔥🔥🔥 THIS WAS MISSING
      },
      include: {
        user: {
          select: { fullName: true }
        },
        services: {
          include: {
            service: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: {
        appointmentDate: "asc"
      }
    });

    return res.status(200).json({
      success: true,
      appointments
    });

  } catch (error) {
    console.error("Barber appointments error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch barber appointments"
    });
  }
};
