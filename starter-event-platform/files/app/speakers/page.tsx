import { Mic2 } from "lucide-react";
import { SpeakerCard } from "@/components/speaker-card";
import { speakers } from "@/lib/data";

export default function SpeakersPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Mic2 className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Our Speakers
            </h1>
            <p className="mt-4 text-lg text-brand-200">
              Industry leaders and visionaries sharing their expertise
            </p>
          </div>
        </div>
      </section>

      {/* Speakers Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">
                {speakers.length}
              </span>{" "}
              speakers
            </p>
          </div>

          {speakers.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {speakers.map((speaker) => (
                <SpeakerCard key={speaker.id} speaker={speaker} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 py-20 text-center">
              <Mic2 className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No speakers announced yet
              </h3>
              <p className="mt-2 text-gray-500">
                Check back soon for speaker announcements
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
