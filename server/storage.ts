import { appointments, type Appointment, type InsertAppointment } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByDate(date: Date): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  deleteAppointment(id: number): Promise<boolean>;
  checkTimeSlotAvailable(startTime: Date, endTime: Date): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments);
  }

  async getAppointmentsByDate(date: Date): Promise<Appointment[]> {
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

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id));
    return appointment || undefined;
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    console.log('Creating appointment:', insertAppointment);
    const [appointment] = await db
      .insert(appointments)
      .values(insertAppointment)
      .returning();
    console.log('Created appointment:', appointment);
    return appointment;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    const result = await db
      .delete(appointments)
      .where(eq(appointments.id, id));
    return (result.rowCount || 0) > 0;
  }

  async checkTimeSlotAvailable(startTime: Date, endTime: Date): Promise<boolean> {
    const conflictingAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          // Check for overlapping appointments
          lte(appointments.startTime, endTime),
          gte(appointments.endTime, startTime)
        )
      );
    
    return conflictingAppointments.length === 0;
  }
}

export const storage = new DatabaseStorage();
