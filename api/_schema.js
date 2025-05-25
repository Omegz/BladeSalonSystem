import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Services configuration
export const SERVICES = {
  haircut: {
    name: "Signature Cut",
    duration: 30,
    price: 45,
    description: "Precision haircut tailored to your face shape",
  },
  shave: {
    name: "Classic Shave",
    duration: 30,
    price: 35,
    description: "Traditional straight razor shave with hot towel",
  },
  combo: {
    name: "The Full Experience",
    duration: 60,
    price: 65,
    description: "Complete grooming: cut, shave, styling",
  },
};

// Database table definition
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  service: varchar("service", { length: 50 }).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  customerName: varchar("customer_name", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Validation schemas
export const insertAppointmentSchema = createInsertSchema(appointments, {
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  service: z.enum(["haircut", "shave", "combo"]),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
}).omit({
  id: true,
  createdAt: true,
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;
