"use client";

import { useState } from "react";
import { CalendarDays, Clock, Users, Phone, Send, CheckCircle } from "lucide-react";

const initialFormState = {
  name: "",
  email: "",
  phone: "",
  date: "",
  time: "",
  guests: "2",
  message: "",
};

const timeSlots = [
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
  "9:00 PM",
];

const inputClasses =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export function ReservationForm() {
  const [formData, setFormData] = useState(initialFormState);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setFormData(initialFormState);
  }

  if (submitted) {
    return (
      <div className="text-center py-12 space-y-4">
        <CheckCircle className="h-16 w-16 text-primary mx-auto" />
        <h3 className="font-serif text-2xl font-bold">Thank You!</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your reservation request has been submitted. We will confirm your
          booking shortly via email.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-2.5 font-medium transition-colors"
        >
          Make Another Reservation
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Row 1: Name & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1.5">
            <Users size={14} className="inline text-muted-foreground mr-1.5" />
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            <Send size={14} className="inline text-muted-foreground mr-1.5" />
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
      </div>

      {/* Row 2: Phone & Guests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
            <Phone size={14} className="inline text-muted-foreground mr-1.5" />
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            placeholder="(555) 123-4567"
            value={formData.phone}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="guests" className="block text-sm font-medium mb-1.5">
            <Users size={14} className="inline text-muted-foreground mr-1.5" />
            Number of Guests
          </label>
          <select
            id="guests"
            name="guests"
            value={formData.guests}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="1">1 Guest</option>
            <option value="2">2 Guests</option>
            <option value="3">3 Guests</option>
            <option value="4">4 Guests</option>
            <option value="5">5 Guests</option>
            <option value="6">6 Guests</option>
            <option value="7">7 Guests</option>
            <option value="8+">8+ Guests</option>
          </select>
        </div>
      </div>

      {/* Row 3: Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium mb-1.5">
            <CalendarDays size={14} className="inline text-muted-foreground mr-1.5" />
            Preferred Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium mb-1.5">
            <Clock size={14} className="inline text-muted-foreground mr-1.5" />
            Preferred Time
          </label>
          <select
            id="time"
            name="time"
            required
            value={formData.time}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="" disabled>
              Select a time
            </option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 4: Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1.5">
          Special Requests (Optional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          placeholder="Any dietary restrictions, allergies, or special occasions..."
          value={formData.message}
          onChange={handleChange}
          className={inputClasses}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-3 font-medium inline-flex items-center justify-center gap-2 transition-colors"
      >
        <Send size={18} />
        Request Reservation
      </button>
    </form>
  );
}
