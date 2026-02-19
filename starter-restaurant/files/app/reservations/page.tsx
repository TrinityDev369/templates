import { ReservationForm } from "@/components/reservation-form";
import { contactInfo } from "@/lib/data";
import { MapPin, Phone, Clock } from "lucide-react";

export const metadata = {
  title: "Reservations | Savoria",
};

export default function ReservationsPage() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center">
          <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Reservations
          </span>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl font-bold">
            Book Your Table
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Reserve your spot for an unforgettable dining experience. Fill out the form
            below and we will get back to you with a confirmation.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mt-12">
          {/* Left Column: Reservation Form */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border bg-card p-6 md:p-8">
              <ReservationForm />
            </div>
          </div>

          {/* Right Column: Contact Info */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border bg-card p-6 md:p-8 space-y-8">
              <h2 className="font-serif text-xl font-bold">Visit Us</h2>

              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{contactInfo.address}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{contactInfo.phone}</p>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium mb-2">Opening Hours</p>
                  <ul className="space-y-1">
                    {contactInfo.hours.map((item) => (
                      <li key={item.days} className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{item.days}:</span>{" "}
                        {item.time}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Note */}
              <p className="text-xs text-muted-foreground border-t pt-6">
                For parties of 8 or more, please call us directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
