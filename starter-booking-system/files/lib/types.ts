export interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface Booking {
  id: string;
  slot_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string | null;
  status: "confirmed" | "cancelled" | "completed";
  created_at: string;
}

export interface BookingWithSlot extends Booking {
  date: string;
  start_time: string;
  end_time: string;
}

export interface BookingFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string;
}

export interface SlotsResponse {
  slots: TimeSlot[];
}

export interface BookingResponse {
  booking: BookingWithSlot;
}

export interface BookingsListResponse {
  bookings: BookingWithSlot[];
}

export interface ApiError {
  error: string;
}
