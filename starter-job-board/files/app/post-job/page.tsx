"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, PlusCircle } from "lucide-react";

export default function PostJobPage() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Job Posted Successfully
        </h1>
        <p className="text-gray-600 mb-8">
          Your job listing is now live. Candidates will start applying soon.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            View All Jobs
          </Link>
          <button
            onClick={() => setSubmitted(false)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Post Another Job
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a Job</h1>
      <p className="text-gray-600 mb-8">
        Fill in the details below to create a new job listing.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="space-y-6"
      >
        {/* Job Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            placeholder="e.g. Senior Frontend Engineer"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* Company Name */}
        <div>
          <label
            htmlFor="company"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            id="company"
            type="text"
            required
            placeholder="Your company name"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Location <span className="text-red-500">*</span>
          </label>
          <input
            id="location"
            type="text"
            required
            placeholder="e.g. San Francisco, CA or Remote"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* Type & Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Job Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
            >
              <option value="">Select type</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="level"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Experience Level <span className="text-red-500">*</span>
            </label>
            <select
              id="level"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
            >
              <option value="">Select level</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid-level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>
          </div>
        </div>

        {/* Salary Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="salaryMin"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Salary Min ($) <span className="text-red-500">*</span>
            </label>
            <input
              id="salaryMin"
              type="number"
              required
              placeholder="e.g. 80000"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="salaryMax"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Salary Max ($) <span className="text-red-500">*</span>
            </label>
            <input
              id="salaryMax"
              type="number"
              required
              placeholder="e.g. 120000"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            required
            rows={6}
            placeholder="Describe the role, responsibilities, and what the ideal candidate looks like..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Requirements */}
        <div>
          <label
            htmlFor="requirements"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Requirements <span className="text-red-500">*</span>
          </label>
          <textarea
            id="requirements"
            required
            rows={4}
            placeholder="List each requirement on a new line..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            One requirement per line
          </p>
        </div>

        {/* Tags */}
        <div>
          <label
            htmlFor="tags"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Tags
          </label>
          <input
            id="tags"
            type="text"
            placeholder="e.g. React, TypeScript, Remote (comma-separated)"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">
            Separate tags with commas
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-brand-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors"
        >
          Post Job
        </button>
      </form>
    </div>
  );
}
