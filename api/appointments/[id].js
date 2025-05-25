import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq } from "drizzle-orm";
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
  res.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { id } = req.query;
    const appointmentId = parseInt(id);

    if (isNaN(appointmentId)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }

    const result = await db
      .delete(appointments)
      .where(eq(appointments.id, appointmentId));

    const deleted = (result.rowCount || 0) > 0;

    if (!deleted) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    return res.json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Delete API Error:", error);
    return res.status(500).json({ message: "Failed to cancel appointment" });
  }
}
