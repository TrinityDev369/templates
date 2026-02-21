"use client";

import { useState, type FormEvent } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
} from "lucide-react";
import { properties } from "@/lib/data";

interface FormState {
  name: string;
  email: string;
  phone: string;
  propertyInterest: string;
  message: string;
}

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  propertyInterest: "",
  message: "",
};

const officeInfo = [
  {
    icon: MapPin,
    label: "Address",
    value: "123 Main Street, Suite 200\nSpringfield, IL 62701",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "(555) 123-4567",
    href: "tel:+15551234567",
  },
  {
    icon: Mail,
    label: "Email",
    value: "hello@homestead.com",
    href: "mailto:hello@homestead.com",
  },
  {
    icon: Clock,
    label: "Office Hours",
    value: "Mon - Fri: 9:00 AM - 6:00 PM\nSat: 10:00 AM - 4:00 PM\nSun: Closed",
  },
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
    // In a real app this would POST to an API
    setSubmitted(true);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Have a question about a property, want to schedule a showing, or just
          need some guidance? Reach out and our team will get back to you within
          one business day.
        </p>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-3">
        {/* ── Contact Form ──────────────────────────────────── */}
        <div className="lg:col-span-2">
          {submitted ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-green-200 bg-green-50 px-6 py-20 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                Message Sent!
              </h2>
              <p className="mt-2 max-w-md text-gray-600">
                Thank you for reaching out, {form.name.split(" ")[0] || "there"}. A
                member of our team will be in touch shortly.
              </p>
              <button
                onClick={() => {
                  setForm(initialForm);
                  setSubmitted(false);
                }}
                className="mt-6 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              {/* Name + Email */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              {/* Phone + Property Interest */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
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
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="propertyInterest"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Property Interest
                  </label>
                  <select
                    id="propertyInterest"
                    name="propertyInterest"
                    value={form.propertyInterest}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="">Select a property (optional)</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} - {p.address}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700"
                >
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you..."
                  className="mt-1 block w-full resize-y rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  <Send className="h-4 w-4" />
                  Send Message
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Office Info Sidebar ───────────────────────────── */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Office Information
            </h2>
            <div className="mt-6 space-y-6">
              {officeInfo.map((item) => (
                <div key={item.label} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="mt-0.5 text-sm text-gray-600 transition hover:text-brand-600"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="mt-0.5 whitespace-pre-line text-sm text-gray-600">
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-100 p-6 text-center">
            <div>
              <MapPin className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                Map placeholder — integrate Google Maps or Mapbox
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
