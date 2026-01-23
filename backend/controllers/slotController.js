import prisma from "../prisma/client.js";

const WORK_START = 9 * 60;   // 09:00
const WORK_END   = 21 * 60;  // 21:00
const SLOT_SIZE  = 15;

const toMin = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const toTime = (min) => {
  const h = String(Math.floor(min / 60)).padStart(2, '0');
  const m = String(min % 60).padStart(2, '0');
  return `${h}:${m}`;
};

export const getAvailableSlotsController = async (req, res) => {
  try {
    const barberId = Number(req.params.barberId);

    const { date, serviceIds } = req.query;

    if (!date || !serviceIds) {
      return res.status(400).json({
        message: "date and serviceIds are required"
      });
    }

    const ids = serviceIds.split(',').map(Number);

    // 1️⃣ total duration
    const services = await prisma.service.findMany({
      where: { id: { in: ids }, isActive: true },
      select: { duration: true }
    });

    const totalDuration = services.reduce((s, x) => s + x.duration, 0);

    // 2️⃣ booked appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        barberId,
        appointmentDate: new Date(date)
      },
      select: {
        appointmentTime: true,
        duration: true
      }
    });

    const booked = appointments.map(a => ({
      start: toMin(a.appointmentTime),
      end: toMin(a.appointmentTime) + a.duration
    }));

    // 3️⃣ generate free slots
    const slots = [];

    for (let t = WORK_START; t + totalDuration <= WORK_END; t += SLOT_SIZE) {
      const conflict = booked.some(
        b => t < b.end && t + totalDuration > b.start
      );

      if (!conflict) {
        slots.push(toTime(t));
      }
    }

    res.json({
      success: true,
      date,
      totalDuration,
      slots
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
