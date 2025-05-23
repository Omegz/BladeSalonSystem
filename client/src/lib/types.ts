export interface Service {
  name: string;
  duration: number;
  price: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface BookingFormData {
  name?: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
}
