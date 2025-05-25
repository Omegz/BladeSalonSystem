import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq, and, gte, lte } from "drizzle-orm";
import {
  appointments,
  insertAppointmentSchema,
  SERVICES,
} from "../shared/schema.js";

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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === "GET") {
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
      return res.json(appointments);
    }

    if (req.method === "POST") {
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
      return res.status(201).json(appointment);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
