const toMin = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const toTime = (min) => {
  const h = String(Math.floor(min / 60)).padStart(2, '0');
  const m = String(min % 60).padStart(2, '0');
  return `${h}:${m}`;
};
const start = toMin(appointmentTime);
const end = start + duration;

// 🔒 SLOT AVAILABILITY CHECK
const conflict = await prisma.appointment.findFirst({
  where: {
    barberId,
    appointmentDate: new Date(appointmentDate),
    AND: [
      {
        appointmentTime: { lt: toTime(end) }
      },
      {
        appointmentTime: { gte: toTime(start - duration) }
      }
    ]
  }
});

if (conflict) {
  return res.status(409).json({
    success: false,
    message: "This slot is already booked"
  });
}
export const createAppointmentController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { barberId, appointmentDate, appointmentTime, serviceIds } = req.body;

    if (!barberId || !appointmentDate || !appointmentTime || !serviceIds?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const barberIdInt = Number(barberId);
    if (isNaN(barberIdInt)) {
      return res.status(400).json({ message: "Invalid barberId" });
    }

    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds }, isActive: true }
    });

    if (!services.length) {
      return res.status(400).json({ message: "Invalid services" });
    }

    const duration = services.reduce((s, x) => s + x.duration, 0);
    const amount = services.reduce((s, x) => s + x.price, 0);

    const start = toMin(appointmentTime);
    const end = start + duration;

    const conflict = await prisma.appointment.findFirst({
      where: {
        barberId: barberIdInt,
        appointmentDate: new Date(appointmentDate),
        AND: [
          { appointmentTime: { lt: toTime(end) } },
          { appointmentTime: { gt: toTime(start - duration) } }
        ]
      }
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "This slot is already booked"
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        barberId: barberIdInt,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        duration,
        totalAmount: amount,
        services: {
          create: services.map(s => ({
            serviceId: s.id,
            price: s.price
          }))
        }
      },
      include: {
        user: { select: { id: true, fullName: true, email: true, mobileNumber: true } },
        barber: { select: { id: true, fullName: true, shopName: true, shopAddress: true } },
        services: { include: { service: true } }
      }
    });

    res.status(201).json({ success: true, appointment });

  } catch (error) {
    console.error("Create appointment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
