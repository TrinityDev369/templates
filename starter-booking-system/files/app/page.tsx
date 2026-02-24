import { Calendar, Clock, CheckCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Book Your{" "}
          <span className="text-primary">Appointment</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Schedule appointments quickly and easily. Pick a date, choose a time
          slot, and confirm your booking in seconds.
        </p>
        <div className="mt-8 flex gap-4">
          <a
            href="/book"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Book Now
          </a>
          <a
            href="/admin"
            className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Admin Dashboard
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/50 px-4 py-20">
        <div className="container mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Calendar View</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse available dates on an intuitive monthly calendar.
              Unavailable dates are clearly marked.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Time Slots</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose from available time slots that fit your schedule.
              Real-time availability updates.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Instant Confirmation</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Get immediate booking confirmation with all the details
              you need for your appointment.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} BookingHub. All rights reserved.</p>
      </footer>
    </div>
  );
}
