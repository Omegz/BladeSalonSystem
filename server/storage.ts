import { appointments, type Appointment, type InsertAppointment } from "@shared/schema";

export interface IStorage {
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByDate(date: Date): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  deleteAppointment(id: number): Promise<boolean>;
  checkTimeSlotAvailable(startTime: Date, endTime: Date): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private appointments: Map<number, Appointment>;
  private currentId: number;

  constructor() {
    this.appointments = new Map();
    this.currentId = 1;
  }

  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointmentsByDate(date: Date): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Array.from(this.appointments.values()).filter(
      (appointment) =>
        appointment.startTime >= startOfDay && appointment.startTime <= endOfDay
    );
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentId++;
    const appointment: Appointment = { 
      ...insertAppointment, 
      id,
      startTime: new Date(insertAppointment.startTime),
      endTime: new Date(insertAppointment.endTime)
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }

  async checkTimeSlotAvailable(startTime: Date, endTime: Date): Promise<boolean> {
    const appointments = Array.from(this.appointments.values());
    
    return !appointments.some((appointment) => {
      // Check for any overlap
      return (
        (startTime >= appointment.startTime && startTime < appointment.endTime) ||
        (endTime > appointment.startTime && endTime <= appointment.endTime) ||
        (startTime <= appointment.startTime && endTime >= appointment.endTime)
      );
    });
  }
}

export const storage = new MemStorage();
