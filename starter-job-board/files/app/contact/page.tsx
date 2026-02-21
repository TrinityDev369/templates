"use client";

import { useState } from "react";
import {
  Mail,
  MessageSquare,
  CheckCircle2,
  HelpCircle,
  Clock,
  MapPin,
} from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Message Sent
        </h1>
        <p className="text-gray-600 mb-8">
          Thank you for reaching out. Our team will get back to you within
          24 hours.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="inline-flex items-center justify-center px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Contact Us</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Have a question or need help? We are here for you. Fill out the form
          below and our team will get back to you as soon as possible.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Contact Form */}
        <div className="flex-1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-6 bg-white border border-gray-200 rounded-xl p-8"
          >
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                required
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="john@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                id="subject"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
              >
                <option value="">Select a subject</option>
                <option value="general">General Inquiry</option>
                <option value="bug">Bug Report</option>
                <option value="billing">Billing</option>
                <option value="partnership">Partnership</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                required
                rows={6}
                placeholder="How can we help you?"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-brand-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Support Info Sidebar */}
        <aside className="lg:w-80 flex-shrink-0">
          <div className="space-y-6">
            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Email Us</h3>
              </div>
              <p className="text-sm text-gray-600">
                For general inquiries, reach us at
              </p>
              <a
                href="mailto:support@jobflow.com"
                className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                support@jobflow.com
              </a>
            </div>

            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Live Chat</h3>
              </div>
              <p className="text-sm text-gray-600">
                Chat with our support team for quick help during business hours.
              </p>
            </div>

            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-gray-900">FAQ</h3>
              </div>
              <p className="text-sm text-gray-600">
                Find answers to common questions in our help center.
              </p>
            </div>

            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Response Time</h3>
              </div>
              <p className="text-sm text-gray-600">
                We typically respond within 24 hours on business days.
              </p>
            </div>

            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Office</h3>
              </div>
              <p className="text-sm text-gray-600">
                123 Innovation Drive
                <br />
                San Francisco, CA 94105
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
