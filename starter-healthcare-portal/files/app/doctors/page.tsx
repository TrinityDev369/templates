import { Stethoscope } from "lucide-react";
import { DoctorCard } from "@/components/doctor-card";
import { doctors } from "@/lib/data";

export default function DoctorsPage() {
  return (
    <div className="section-padding">
      <div className="container-page">
        {/* Page Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
            <Stethoscope className="h-7 w-7 text-brand-600" />
          </div>
          <h1 className="heading-primary">Our Doctors</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Our team of board-certified specialists is dedicated to providing
            the highest quality medical care. Find the right doctor for your
            needs.
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>

        {/* Info Banner */}
        <div className="mt-12 rounded-xl bg-gradient-to-r from-brand-50 to-cyan-50 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100">
              <Stethoscope className="h-6 w-6 text-brand-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Need help choosing a doctor?
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Our patient coordinators are available 24/7 to help you find the
                right specialist. Call us at{" "}
                <span className="font-semibold text-brand-700">
                  (555) 123-4567
                </span>{" "}
                or use our online booking system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
