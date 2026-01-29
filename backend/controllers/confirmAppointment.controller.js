import prisma from "../prisma/client.js";

export const confirmAppointment = async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    if (appointment.status === "confirmed") {
      return res.json({
        success: true,
        message: "Appointment already confirmed"
      });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "confirmed",
        paymentStatus: "completed"
      }
    });

    res.json({
      success: true,
      message: "Appointment confirmed successfully",
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error("Confirm appointment error:", error);
    res.status(500).json({ success: false });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        barber: true,
        services: {
          include: {
            service: true
          }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error("Get appointment error:", error);
    res.status(500).json({ success: false });
  }
};

