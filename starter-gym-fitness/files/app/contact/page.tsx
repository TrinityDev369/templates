"use client";

import { useState, type FormEvent } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Dumbbell,
} from "lucide-react";

interface FormState {
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
}

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  interest: "",
  message: "",
};

const gymInfo = [
  {
    icon: MapPin,
    label: "Location",
    value: "742 Iron Peak Boulevard\nDenver, CO 80202",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "(555) 987-6543",
    href: "tel:+15559876543",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@ironpeakfitness.com",
    href: "mailto:info@ironpeakfitness.com",
  },
  {
    icon: Clock,
    label: "Hours",
    value:
      "Mon - Fri: 5:00 AM - 11:00 PM\nSat: 6:00 AM - 10:00 PM\nSun: 7:00 AM - 9:00 PM",
  },
];

const interestOptions = [
  "Free Trial",
  "Membership Info",
  "Personal Training",
  "Group Classes",
  "Corporate Wellness",
  "Other",
];

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="py-20 px-4 bg-gray-950">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16">
          <span className="text-brand-500 font-semibold tracking-wider uppercase text-sm">
            Get in Touch
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mt-2">
            Contact Us
          </h1>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Have a question about our classes, memberships, or personal training?
            Drop us a line and our team will get back to you within 24 hours.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-3">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-brand-500/30 bg-brand-500/5 px-6 py-20 text-center">
                <CheckCircle2 className="h-12 w-12 text-brand-500" />
                <h2 className="mt-4 text-2xl font-bold text-white uppercase">
                  Message Sent!
                </h2>
                <p className="mt-2 max-w-md text-gray-400">
                  Thanks for reaching out{form.name ? `, ${form.name.split(" ")[0]}` : ""}!
                  A member of the Iron Peak team will be in touch shortly.
                </p>
                <button
                  onClick={() => {
                    setForm(initialForm);
                    setSubmitted(false);
                  }}
                  className="mt-6 rounded-lg bg-brand-500 hover:bg-brand-600 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-2xl border border-gray-800 bg-gray-900 p-6 sm:p-8"
              >
                {/* Name + Email */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-300 uppercase tracking-wider"
                    >
                      Full Name <span className="text-brand-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="mt-2 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-300 uppercase tracking-wider"
                    >
                      Email <span className="text-brand-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="mt-2 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                {/* Phone + Interest */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-gray-300 uppercase tracking-wider"
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="(555) 000-0000"
                      className="mt-2 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="interest"
                      className="block text-sm font-semibold text-gray-300 uppercase tracking-wider"
                    >
                      Interested In
                    </label>
                    <select
                      id="interest"
                      name="interest"
                      value={form.interest}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                      <option value="">Select an option</option>
                      {interestOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-300 uppercase tracking-wider"
                  >
                    Message <span className="text-brand-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about your fitness goals or ask us anything..."
                    className="mt-2 block w-full resize-y rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-600 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                  >
                    <Send className="h-4 w-4" />
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Gym Info Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                Gym Information
              </h2>
              <div className="mt-6 space-y-6">
                {gymInfo.map((item) => (
                  <div key={item.label} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="mt-0.5 text-sm text-gray-300 transition hover:text-brand-500"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="mt-0.5 whitespace-pre-line text-sm text-gray-300">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-gray-700 bg-gray-900/50 p-6 text-center">
              <div>
                <MapPin className="mx-auto h-8 w-8 text-gray-600" />
                <p className="mt-2 text-sm text-gray-500">
                  Map placeholder -- integrate Google Maps or Mapbox
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
