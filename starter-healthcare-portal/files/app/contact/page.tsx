"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  AlertTriangle,
  Send,
  CheckCircle2,
} from "lucide-react";
import { departments } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="section-padding">
      <div className="container-page">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="heading-primary">Contact Us</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Have a question or need assistance? Reach out to our team and
            we&apos;ll get back to you as soon as possible.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              {isSubmitted ? (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="mt-6 text-2xl font-bold text-gray-900">
                    Message Sent!
                  </h2>
                  <p className="mt-3 text-gray-600">
                    Thank you for reaching out. Our team will review your
                    message and get back to you within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        department: "",
                        message: "",
                      });
                    }}
                    className="btn-primary mt-6"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Send Us a Message
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Fill out the form below and we&apos;ll respond promptly.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    {/* Name & Email Row */}
                    <div className="grid gap-5 sm:grid-cols-2">
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
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="mt-1.5 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          className="mt-1.5 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                    </div>

                    {/* Phone & Department Row */}
                    <div className="grid gap-5 sm:grid-cols-2">
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
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="(555) 000-0000"
                          className="mt-1.5 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="department"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Department
                        </label>
                        <select
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          className={cn(
                            "mt-1.5 block w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20",
                            formData.department
                              ? "text-gray-900"
                              : "text-gray-400"
                          )}
                        >
                          <option value="">Select a department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.name}>
                              {dept.name}
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
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="How can we help you?"
                        className="mt-1.5 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>

                    {/* Submit */}
                    <button type="submit" className="btn-primary">
                      <Send className="h-4 w-4" />
                      Send Message
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* Contact Info */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                Get in Touch
              </h3>
              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                    <MapPin className="h-4 w-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Address</p>
                    <p className="mt-0.5 text-sm text-gray-600">
                      123 Medical Center Drive
                      <br />
                      Suite 200, Health City, HC 10001
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                    <Phone className="h-4 w-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="mt-0.5 text-sm text-gray-600">
                      (555) 123-4567
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                    <Mail className="h-4 w-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="mt-0.5 text-sm text-gray-600">
                      info@medicareplus.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Number */}
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Emergency Line
                  </p>
                  <p className="mt-0.5 text-lg font-bold text-red-700">
                    (555) 911-0000
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-red-600">
                Available 24/7 for medical emergencies. If you are experiencing
                a life-threatening situation, please call 911 immediately.
              </p>
            </div>

            {/* Office Hours */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Office Hours
                </h3>
              </div>
              <div className="mt-4 space-y-2.5">
                {[
                  { days: "Monday - Friday", hours: "8:00 AM - 8:00 PM" },
                  { days: "Saturday", hours: "9:00 AM - 5:00 PM" },
                  { days: "Sunday", hours: "10:00 AM - 2:00 PM" },
                ].map((schedule) => (
                  <div
                    key={schedule.days}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-600">{schedule.days}</span>
                    <span className="font-medium text-gray-900">
                      {schedule.hours}
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Emergency</span>
                    <span className="font-semibold text-red-600">
                      24/7
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
