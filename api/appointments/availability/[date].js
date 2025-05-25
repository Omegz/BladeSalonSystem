import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { and, gte, lte } from "drizzle-orm";
import { appointments } from "../../_schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema: { appointments } });

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { date } = req.query;

    if (!date || typeof date !== "string") {
      return res.status(400).json({ message: "Date parameter is required" });
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Get existing appointments for the date
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          gte(appointments.startTime, startOfDay),
          lte(appointments.startTime, endOfDay)
        )
      );

    // Generate all possible 30-minute slots from 09:00 to 19:00
    const slots = [];
    for (let hour = 9; hour < 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotStart = new Date(targetDate);
        slotStart.setHours(hour, minute, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + 30);

        // Don't include slots that would end after 19:00
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
          time: slotStart.toTimeString().slice(0, 5), // HH:MM format
          available: !isBooked,
        });
      }
    }

    return res.json(slots);
  } catch (error) {
    console.error("Availability API Error:", error);
    return res.status(500).json({ message: "Failed to fetch availability" });
  }
}
