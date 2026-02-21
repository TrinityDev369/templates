import {
  Briefcase,
  Building2,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { JobCard } from "@/components/job-card";
import { getFeaturedJobs, jobCategories } from "@/lib/data";
import Link from "next/link";

export default function HomePage() {
  const featuredJobs = getFeaturedJobs();

  const stats = [
    { label: "Active Jobs", value: "10,000+", icon: Briefcase },
    { label: "Companies", value: "500+", icon: Building2 },
    { label: "Candidates", value: "50,000+", icon: Users },
    { label: "Jobs Filled", value: "8,000+", icon: TrendingUp },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-brand-50/50 to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            Find Your Next{" "}
            <span className="text-brand-600">Dream Job</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Connect with top companies hiring right now. Your next career move
            starts here.
          </p>
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar />
          </div>
          <p className="text-sm text-gray-500">
            10,000+ jobs from 500+ companies worldwide
          </p>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Browse by Category
            </h2>
            <p className="text-gray-600">
              Explore opportunities across industries
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobCategories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/jobs?category=${category.id}`}
                className="group p-6 rounded-xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-100 transition-colors">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {category.count} open positions
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Opportunities */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Featured Opportunities
            </h2>
            <p className="text-gray-600">
              Hand-picked roles from leading companies
            </p>
          </div>
          <div className="space-y-4">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium transition-colors"
            >
              View all jobs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Trusted by Thousands
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-7 h-7 text-brand-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Employer CTA */}
      <section className="py-20 px-4 bg-brand-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Hiring? Post a Job in Minutes
          </h2>
          <p className="text-brand-100 text-lg mb-8 max-w-2xl mx-auto">
            Reach thousands of qualified candidates. Our platform makes it easy
            to find the perfect hire for your team.
          </p>
          <Link
            href="/post-job"
            className="inline-flex items-center gap-2 bg-white text-brand-600 px-8 py-3 rounded-lg font-semibold hover:bg-brand-50 transition-colors"
          >
            Post a Job
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
