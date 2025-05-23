import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  service: text("service").notNull(), // 'haircut', 'shave', 'combo'
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  name: text("name"), // optional
});

export const insertAppointmentSchema = createInsertSchema(appointments, {
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  service: z.enum(["haircut", "shave", "combo"]),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
}).omit({ id: true });

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// Service definitions
export const SERVICES = {
  haircut: { name: "Signature Cut", duration: 30, price: 45 },
  shave: { name: "Classic Shave", duration: 30, price: 35 },
  combo: { name: "The Full Experience", duration: 60, price: 65 },
} as const;

export type ServiceType = keyof typeof SERVICES;
