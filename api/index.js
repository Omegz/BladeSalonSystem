import express from "express";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import { eq, and, gte, lte } from "drizzle-orm";
import {
  appointments,
  insertAppointmentSchema,
  SERVICES,
} from "../shared/schema.js";

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema: { appointments } });

// Database storage class
class DatabaseStorage {
  async getAppointments() {
    return await db.select().from(appointments);
  }

  async getAppointmentsByDate(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(appointments)
      .where(
        and(
          gte(appointments.startTime, startOfDay),
          lte(appointments.startTime, endOfDay)
        )
      );
  }

  async getAppointment(id) {
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id));
    return appointment || undefined;
  }

  async createAppointment(insertAppointment) {
    console.log("Creating appointment:", insertAppointment);
    const [appointment] = await db
      .insert(appointments)
      .values(insertAppointment)
      .returning();
    console.log("Created appointment:", appointment);
    return appointment;
  }

  async deleteAppointment(id) {
    const result = await db.delete(appointments).where(eq(appointments.id, id));
    return (result.rowCount || 0) > 0;
  }

  async checkTimeSlotAvailable(startTime, endTime) {
    const conflictingAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          lte(appointments.startTime, endTime),
          gte(appointments.endTime, startTime)
        )
      );
    return conflictingAppointments.length === 0;
  }
}

const storage = new DatabaseStorage();

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
app.get("/api/appointments", async (req, res) => {
  try {
    const { date } = req.query;
    if (date && typeof date === "string") {
      const targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      const appointments = await storage.getAppointmentsByDate(targetDate);
      return res.json(appointments);
    }
    const appointments = await storage.getAppointments();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});

app.post("/api/appointments", async (req, res) => {
  try {
    const result = insertAppointmentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const appointmentData = result.data;
    if (!(appointmentData.service in SERVICES)) {
      return res.status(400).json({ message: "Invalid service type" });
    }

    const startHour = appointmentData.startTime.getHours();
    const endHour = appointmentData.endTime.getHours();
    const endMinutes = appointmentData.endTime.getMinutes();

    if (
      startHour < 9 ||
      startHour >= 19 ||
      endHour > 19 ||
      (endHour === 19 && endMinutes > 0)
    ) {
      return res.status(400).json({
        message: "Appointments must be between 09:00 and 19:00",
      });
    }

    const isAvailable = await storage.checkTimeSlotAvailable(
      appointmentData.startTime,
      appointmentData.endTime
    );

    if (!isAvailable) {
      return res.status(409).json({
        message: "Time slot is already booked",
      });
    }

    const appointment = await storage.createAppointment(appointmentData);
    res.status(201).json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Failed to create appointment" });
  }
});

app.delete("/api/appointments/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }

    const deleted = await storage.deleteAppointment(id);
    if (!deleted) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel appointment" });
  }
});

app.get("/api/appointments/availability/:date", async (req, res) => {
  try {
    const date = new Date(req.params.date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const existingAppointments = await storage.getAppointmentsByDate(date);
    const slots = [];

    for (let hour = 9; hour < 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + 30);

        if (slotEnd.getHours() > 19) {
          break;
        }

        const isBooked = existingAppointments.some(
          (appointment) =>
            (slotStart >= appointment.startTime &&
              slotStart < appointment.endTime) ||
            (slotEnd > appointment.startTime &&
              slotEnd <= appointment.endTime) ||
            (slotStart <= appointment.startTime &&
              slotEnd >= appointment.endTime)
        );

        slots.push({
          time: slotStart.toTimeString().slice(0, 5),
          available: !isBooked,
        });
      }
    }

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch availability" });
  }
});

// Export for Vercel
export default app;
