import Link from "next/link";
import {
  Heart,
  Users,
  Star,
  Clock,
  ArrowRight,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";
import { DoctorCard } from "@/components/doctor-card";
import { DepartmentCard } from "@/components/department-card";
import { AppointmentCard } from "@/components/appointment-card";
import { doctors, departments, getAppointmentsByStatus } from "@/lib/data";

const stats = [
  { label: "Doctors", value: "50+", icon: Users },
  { label: "Patients", value: "10K+", icon: Heart },
  { label: "Satisfaction", value: "98%", icon: Star },
  { label: "Support", value: "24/7", icon: Clock },
];

export default function HomePage() {
  const upcomingAppointments = getAppointmentsByStatus("upcoming").slice(0, 2);
  const featuredDoctors = doctors.slice(0, 3);
  const featuredDepartments = departments.slice(0, 6);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-cyan-800">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container-page relative py-24 sm:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4" />
              Trusted by thousands of patients
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Your Health,{" "}
              <span className="text-brand-200">Our Priority</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-brand-100">
              Experience modern healthcare at your fingertips. Book appointments
              with top-rated specialists, access your health records securely,
              and take control of your well-being with MediCare Plus.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/appointments/book"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-brand-700 shadow-lg transition-all hover:bg-brand-50 hover:shadow-xl"
              >
                <CalendarCheck className="h-5 w-5" />
                Book Appointment
              </Link>
              <Link
                href="/records"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/60 hover:bg-white/10"
              >
                View Records
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Departments Section */}
      <section className="section-padding">
        <div className="container-page">
          <div className="text-center">
            <h2 className="heading-primary">Our Departments</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Comprehensive care across all medical specialties, staffed by
              experienced professionals dedicated to your well-being.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredDepartments.map((department) => (
              <DepartmentCard key={department.id} department={department} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-page">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="heading-primary">Featured Doctors</h2>
              <p className="mt-4 max-w-2xl text-lg text-gray-600">
                Meet some of our highly rated specialists, committed to
                providing exceptional patient care.
              </p>
            </div>
            <Link
              href="/doctors"
              className="hidden items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 sm:flex"
            >
              View all doctors
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/doctors"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600"
            >
              View all doctors
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-brand-700 py-16">
        <div className="container-page">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                    <Icon className="h-6 w-6 text-brand-200" />
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-brand-200">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Appointments Preview */}
      {upcomingAppointments.length > 0 && (
        <section className="section-padding">
          <div className="container-page">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="heading-primary">Upcoming Appointments</h2>
                <p className="mt-4 text-lg text-gray-600">
                  Your next scheduled visits at a glance.
                </p>
              </div>
              <Link
                href="/appointments"
                className="hidden items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 sm:flex"
              >
                View all appointments
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-page">
          <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-cyan-600 px-8 py-16 text-center shadow-xl sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to take charge of your health?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
              Join thousands of patients who trust MediCare Plus for their
              healthcare needs. Schedule your first appointment today.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/appointments/book"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-brand-700 shadow-lg transition-all hover:bg-brand-50"
              >
                <CalendarCheck className="h-5 w-5" />
                Book Appointment
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/60 hover:bg-white/10"
              >
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
