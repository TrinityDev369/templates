"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { getJobById } from "@/lib/data";

export default function ApplyPage({ params }: { params: { id: string } }) {
  const job = getJobById(params.id);
  const [submitted, setSubmitted] = useState(false);

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Job Not Found
        </h1>
        <Link href="/jobs" className="text-brand-600 hover:text-brand-700">
          Browse all jobs
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Application Submitted
        </h1>
        <p className="text-gray-600 mb-8">
          Thank you for applying to <strong>{job.title}</strong> at{" "}
          <strong>{job.company.name}</strong>. We will review your application
          and get back to you soon.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/jobs/${job.id}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Job
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            Browse More Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link
        href={`/jobs/${job.id}`}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to job listing
      </Link>

      {/* Job Header */}
      <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-xl mb-8">
        <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-6 h-6 text-brand-600" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">{job.title}</h2>
          <p className="text-sm text-gray-500">{job.company.name}</p>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Apply for this position
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="space-y-6"
      >
        {/* Full Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Full Name <span className="text-red-500">*</span>
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

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            required
            placeholder="+1 (555) 123-4567"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* Resume Upload */}
        <div>
          <label
            htmlFor="resume"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Resume <span className="text-red-500">*</span>
          </label>
          <div className="relative border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-brand-300 transition-colors">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">
              Drop your resume here or{" "}
              <span className="text-brand-600 font-medium">browse</span>
            </p>
            <p className="text-xs text-gray-400">PDF, DOC, DOCX (max 5MB)</p>
            <input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Cover Letter */}
        <div>
          <label
            htmlFor="cover"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Cover Letter <span className="text-red-500">*</span>
          </label>
          <textarea
            id="cover"
            required
            rows={6}
            placeholder="Tell us why you're a great fit for this role..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label
            htmlFor="linkedin"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            LinkedIn Profile{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="linkedin"
            type="url"
            placeholder="https://linkedin.com/in/johndoe"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-brand-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors"
        >
          Submit Application
        </button>
      </form>
    </div>
  );
}
