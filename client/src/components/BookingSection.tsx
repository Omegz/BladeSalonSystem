import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarCheck, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SERVICES } from "@shared/schema";
import type { TimeSlot, BookingFormData } from "@/lib/types";

interface BookingSectionProps {
  selectedService: string | null;
  onServiceClear: () => void;
}

export default function BookingSection({ selectedService, onServiceClear }: BookingSectionProps) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState<Omit<BookingFormData, 'service' | 'date' | 'time'>>({
    name: "",
    email: "",
    phone: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate date options (next 7 days)
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      value: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      isToday: i === 0,
    };
  });

  // Fetch available time slots for selected date
  const { data: timeSlots, isLoading: slotsLoading } = useQuery<TimeSlot[]>({
    queryKey: ['/api/appointments/availability', selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/appointments/availability/${selectedDate}`);
      if (!response.ok) throw new Error('Failed to fetch availability');
      return response.json();
    },
    enabled: !!selectedDate,
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await apiRequest("POST", "/api/appointments", appointmentData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your appointment has been booked successfully.",
      });
      
      // Reset form
      setSelectedTime("");
      setFormData({ name: "", email: "", phone: "" });
      onServiceClear();
      
      // Invalidate availability cache
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/availability'] });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBooking = () => {
    if (!selectedService || !selectedDate || !selectedTime || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a service, date, and time.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    const service = SERVICES[selectedService as keyof typeof SERVICES];
    const startTime = new Date(`${selectedDate}T${selectedTime}:00`);
    const endTime = new Date(startTime.getTime() + service.duration * 60000);

    const appointmentData = {
      service: selectedService,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      email: formData.email,
      phone: formData.phone,
      name: formData.name || undefined,
    };

    createAppointmentMutation.mutate(appointmentData);
  };

  const serviceDetails = selectedService ? SERVICES[selectedService as keyof typeof SERVICES] : null;

  return (
    <section id="booking" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-charcoal mb-4">Book Your Appointment</h2>
          <p className="text-xl text-gray-600">Select your preferred date, time, and service</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Selected Service Display */}
          {selectedService && serviceDetails && (
            <div className="mb-8 p-4 bg-gold bg-opacity-10 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-charcoal">{serviceDetails.name}</h4>
                  <p className="text-sm text-gray-600">
                    {serviceDetails.duration} minutes - ${serviceDetails.price}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={onServiceClear} className="text-gold hover:text-gold-dark">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Date Selection */}
          <div className="mb-8">
            <Label className="block text-lg font-semibold text-charcoal mb-4">Select Date</Label>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {dateOptions.map((date) => (
                <Button
                  key={date.value}
                  variant={selectedDate === date.value ? "default" : "outline"}
                  onClick={() => {
                    setSelectedDate(date.value);
                    setSelectedTime(""); // Reset time when date changes
                  }}
                  className={`p-3 h-auto flex flex-col ${
                    selectedDate === date.value
                      ? "border-2 border-gold bg-gold bg-opacity-10 text-gold"
                      : "border border-gray-200 hover:border-gold hover:bg-gold hover:bg-opacity-10"
                  }`}
                >
                  <div className="text-sm font-mono">
                    {date.isToday ? "TODAY" : date.label.split(" ")[0]}
                  </div>
                  <div className="text-lg font-semibold">{date.label.split(" ")[1]}</div>
                </Button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div className="mb-8">
            <Label className="block text-lg font-semibold text-charcoal mb-4">Available Times</Label>
            {slotsLoading ? (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {timeSlots?.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`p-3 font-mono ${
                      !slot.available
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : selectedTime === slot.time
                        ? "border-2 border-gold bg-gold bg-opacity-20"
                        : "border border-gray-200 hover:border-gold hover:bg-gold hover:bg-opacity-10"
                    }`}
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Customer Information Form */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-charcoal mb-4">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Name (Optional)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-2"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-2"
                  required
                />
              </div>
            </div>
          </div>

          {/* Booking Summary & Confirmation */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h4 className="font-semibold text-charcoal mb-2">Booking Summary</h4>
                {selectedService && selectedDate && selectedTime && serviceDetails ? (
                  <div>
                    <p className="text-gray-600">
                      {serviceDetails.name} on{" "}
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      at {selectedTime}
                    </p>
                    <p className="text-lg font-semibold text-gold mt-1">${serviceDetails.price}</p>
                  </div>
                ) : (
                  <p className="text-gray-600">Please select a service, date, and time</p>
                )}
              </div>
              <Button
                onClick={handleBooking}
                disabled={
                  !selectedService ||
                  !selectedDate ||
                  !selectedTime ||
                  !formData.email ||
                  !formData.phone ||
                  createAppointmentMutation.isPending
                }
                className="bg-gold hover:bg-gold-dark text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createAppointmentMutation.isPending ? "Booking..." : "Confirm Booking"}
                <CalendarCheck className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
