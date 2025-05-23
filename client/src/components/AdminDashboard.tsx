import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RefreshCw, XCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Appointment } from "@shared/schema";
import { SERVICES } from "@shared/schema";

export default function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch appointments for selected date
  const { data: appointments = [], isLoading, refetch } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments', selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/appointments?date=${selectedDate}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return response.json();
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/appointments/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/availability'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel appointment",
        variant: "destructive",
      });
    },
  });

  // Generate time slots for the day (09:00 - 19:00)
  const timeSlots = [];
  for (let hour = 9; hour < 19; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(time);
    }
  }

  const getAppointmentForSlot = (time: string) => {
    return appointments.find(appointment => {
      const appointmentTime = new Date(appointment.startTime).toTimeString().slice(0, 5);
      return appointmentTime === time;
    });
  };

  const getServiceColor = (service: string) => {
    switch (service) {
      case 'haircut': return 'border-l-gold';
      case 'shave': return 'border-l-purple-500';
      case 'combo': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getServiceBadgeColor = (service: string) => {
    switch (service) {
      case 'haircut': return 'bg-blue-100 text-blue-800';
      case 'shave': return 'bg-purple-100 text-purple-800';
      case 'combo': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateStats = () => {
    const todayBookings = appointments.length;
    const revenue = appointments.reduce((total, apt) => {
      const service = SERVICES[apt.service as keyof typeof SERVICES];
      return total + (service?.price || 0);
    }, 0);
    const availableSlots = timeSlots.length - appointments.length;

    return { todayBookings, revenue, availableSlots };
  };

  const stats = calculateStats();

  return (
    <section id="admin" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-4xl font-bold text-charcoal mb-2">Admin Dashboard</h2>
              <p className="text-gray-600">Manage today's appointments and schedule</p>
            </div>
            <div className="flex items-center space-x-4">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="font-mono"
              />
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                className="bg-charcoal hover:bg-gray-800 text-white"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Daily Schedule Timeline */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-charcoal mb-2">Schedule</h3>
            <p className="text-gray-600 font-mono">
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {timeSlots.map((time) => {
                const appointment = getAppointmentForSlot(time);
                return (
                  <div key={time} className="grid grid-cols-12 gap-4 items-center py-3 border-b border-gray-200">
                    <div className="col-span-2">
                      <span className="font-mono text-gray-600">{time}</span>
                    </div>
                    <div className="col-span-10">
                      {appointment ? (
                        <div className={`bg-white border-l-4 ${getServiceColor(appointment.service)} rounded-lg p-4 shadow-sm`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-charcoal">
                                {SERVICES[appointment.service as keyof typeof SERVICES]?.name || appointment.service}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {appointment.email} | {appointment.phone}
                              </p>
                              {appointment.name && (
                                <p className="text-sm text-gray-600">Name: {appointment.name}</p>
                              )}
                              <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${getServiceBadgeColor(appointment.service)}`}>
                                {SERVICES[appointment.service as keyof typeof SERVICES]?.duration || 30} min
                              </span>
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel this appointment? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteAppointmentMutation.mutate(appointment.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Cancel Appointment
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 opacity-50">
                          <span className="text-gray-400 text-sm">Available</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Schedule Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-charcoal">{stats.todayBookings}</div>
              <div className="text-sm text-gray-500">Today's Bookings</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gold">${stats.revenue}</div>
              <div className="text-sm text-gray-500">Today's Revenue</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.availableSlots}</div>
              <div className="text-sm text-gray-500">Available Slots</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{timeSlots.length}</div>
              <div className="text-sm text-gray-500">Total Slots</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
