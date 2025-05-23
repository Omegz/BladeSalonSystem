import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, SERVICES } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get appointments for a specific date
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

  // Create new appointment
  app.post("/api/appointments", async (req, res) => {
    try {
      // Validate request body
      const result = insertAppointmentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.issues 
        });
      }

      const appointmentData = result.data;
      
      // Validate service type
      if (!(appointmentData.service in SERVICES)) {
        return res.status(400).json({ message: "Invalid service type" });
      }

      // Validate business hours (09:00 - 19:00)
      const startHour = appointmentData.startTime.getHours();
      const endHour = appointmentData.endTime.getHours();
      const endMinutes = appointmentData.endTime.getMinutes();
      
      if (startHour < 9 || startHour >= 19 || endHour > 19 || (endHour === 19 && endMinutes > 0)) {
        return res.status(400).json({ 
          message: "Appointments must be between 09:00 and 19:00" 
        });
      }

      // Check if time slot is available
      const isAvailable = await storage.checkTimeSlotAvailable(
        appointmentData.startTime,
        appointmentData.endTime
      );

      if (!isAvailable) {
        return res.status(409).json({ 
          message: "Time slot is already booked" 
        });
      }

      // Create appointment
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  // Delete appointment
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

  // Get available time slots for a specific date
  app.get("/api/appointments/availability/:date", async (req, res) => {
    try {
      const date = new Date(req.params.date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const existingAppointments = await storage.getAppointmentsByDate(date);
      
      // Generate all possible 30-minute slots from 09:00 to 19:00
      const slots = [];
      for (let hour = 9; hour < 19; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotStart = new Date(date);
          slotStart.setHours(hour, minute, 0, 0);
          
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + 30);
          
          // Don't include slots that would end after 19:00
          if (slotEnd.getHours() > 19) {
            break;
          }

          const isBooked = existingAppointments.some(appointment => 
            (slotStart >= appointment.startTime && slotStart < appointment.endTime) ||
            (slotEnd > appointment.startTime && slotEnd <= appointment.endTime) ||
            (slotStart <= appointment.startTime && slotEnd >= appointment.endTime)
          );

          slots.push({
            time: slotStart.toTimeString().slice(0, 5), // HH:MM format
            available: !isBooked
          });
        }
      }

      res.json(slots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
