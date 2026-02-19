import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { contactInfo } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact | Savoria",
};

const contactBlocks = [
  {
    icon: MapPin,
    label: "Our Location",
    value: contactInfo.address,
  },
  {
    icon: Phone,
    label: "Phone",
    value: contactInfo.phone,
  },
  {
    icon: Mail,
    label: "Email",
    value: contactInfo.email,
  },
];

export default function ContactPage() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <div className="text-center">
          <span className="uppercase text-primary tracking-wider text-sm font-medium">
            Get in Touch
          </span>
          <h1 className="font-serif text-3xl md:text-4xl mt-2">Contact Us</h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Have a question, want to make a reservation, or just want to say
            hello? We&apos;d love to hear from you. Reach out through any of
            the channels below.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
          {/* Left — Contact details */}
          <div className="rounded-xl border bg-card p-8 space-y-8">
            {contactBlocks.map((block) => (
              <div key={block.label} className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <block.icon className="text-primary h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {block.label}
                  </p>
                  <p className="mt-1">{block.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right — Opening hours */}
          <div className="rounded-xl border bg-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="font-serif text-xl font-semibold">
                Opening Hours
              </h2>
            </div>
            <div>
              {contactInfo.hours.map((entry) => (
                <div
                  key={entry.days}
                  className="flex justify-between py-3 border-b last:border-0"
                >
                  <span className="font-medium">{entry.days}</span>
                  <span
                    className={
                      entry.time === "Closed"
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }
                  >
                    {entry.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="mt-12 rounded-xl border bg-muted h-64 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Map integration goes here</p>
          </div>
        </div>
      </div>
    </section>
  );
}
