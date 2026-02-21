import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Bed,
  Bath,
  Ruler,
  Calendar,
  Home,
  Tag,
  Check,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import { properties } from "@/lib/data";
import { formatPrice, formatArea } from "@/lib/utils";

interface Props {
  params: { id: string };
}

export function generateStaticParams() {
  return properties.map((property) => ({
    id: property.id,
  }));
}

export function generateMetadata({ params }: Props) {
  const property = properties.find((p) => p.id === params.id);
  if (!property) return { title: "Property Not Found" };
  return {
    title: `${property.title} | Homestead`,
    description: property.description,
  };
}

export default function PropertyDetailPage({ params }: Props) {
  const property = properties.find((p) => p.id === params.id);
  if (!property) notFound();

  const statusLabel: Record<string, string> = {
    "for-sale": "For Sale",
    "for-rent": "For Rent",
    sold: "Sold",
  };

  const typeLabel: Record<string, string> = {
    house: "House",
    apartment: "Apartment",
    condo: "Condo",
    townhouse: "Townhouse",
  };

  const details = [
    { icon: Bed, label: "Bedrooms", value: property.bedrooms },
    { icon: Bath, label: "Bathrooms", value: property.bathrooms },
    { icon: Ruler, label: "Square Feet", value: formatArea(property.sqft) },
    { icon: Calendar, label: "Year Built", value: property.yearBuilt },
    { icon: Home, label: "Type", value: typeLabel[property.type] },
    { icon: Tag, label: "Status", value: statusLabel[property.status] },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link href="/" className="transition hover:text-brand-600">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/properties" className="transition hover:text-brand-600">
          Properties
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-gray-900">{property.title}</span>
      </nav>

      {/* Image Gallery */}
      <div className="mt-6 grid gap-4 lg:grid-cols-4 lg:grid-rows-2">
        {/* Main Image */}
        <div className="relative overflow-hidden rounded-xl bg-gray-200 lg:col-span-3 lg:row-span-2">
          {property.images[0] ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="h-full w-full object-cover"
              style={{ minHeight: "400px" }}
            />
          ) : (
            <div className="flex h-full min-h-[400px] items-center justify-center text-gray-400">
              <Home className="h-16 w-16" />
            </div>
          )}
          <span className="absolute left-4 top-4 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
            {statusLabel[property.status]}
          </span>
        </div>

        {/* Thumbnail Grid */}
        {[1, 2].map((i) => (
          <div
            key={i}
            className="hidden overflow-hidden rounded-xl bg-gray-200 lg:block"
          >
            {property.images[i] ? (
              <img
                src={property.images[i]}
                alt={`${property.title} - view ${i + 1}`}
                className="h-full w-full object-cover"
                style={{ minHeight: "192px" }}
              />
            ) : (
              <div className="flex h-full min-h-[192px] items-center justify-center text-gray-300">
                <Home className="h-10 w-10" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Title + Price */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {property.title}
            </h1>
            <p className="mt-1 text-lg text-gray-500">
              {property.address}, {property.city}, {property.state}{" "}
              {property.zip}
            </p>
            <p className="mt-4 text-4xl font-bold text-brand-600">
              {formatPrice(property.price)}
              {property.status === "for-rent" && (
                <span className="text-lg font-normal text-gray-400">/mo</span>
              )}
            </p>
          </div>

          {/* Property Details Grid */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Property Details
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {details.map((detail) => (
                <div
                  key={detail.label}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <detail.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{detail.label}</p>
                    <p className="font-semibold text-gray-900">
                      {detail.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Description
            </h2>
            <p className="mt-4 leading-relaxed text-gray-600">
              {property.description}
            </p>
          </div>

          {/* Features */}
          {property.features.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Features &amp; Amenities
              </h2>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {property.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-brand-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agent Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Listing Agent
            </h3>
            <div className="mt-4 flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gray-200">
                {property.agent.image ? (
                  <img
                    src={property.agent.image}
                    alt={property.agent.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-400">
                    {property.agent.name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {property.agent.name}
                </p>
                <p className="text-sm text-gray-500">{property.agent.title}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <a
                href={`tel:${property.agent.phone}`}
                className="flex items-center gap-3 text-sm text-gray-600 transition hover:text-brand-600"
              >
                <Phone className="h-4 w-4 shrink-0" />
                {property.agent.phone}
              </a>
              <a
                href={`mailto:${property.agent.email}`}
                className="flex items-center gap-3 text-sm text-gray-600 transition hover:text-brand-600"
              >
                <Mail className="h-4 w-4 shrink-0" />
                {property.agent.email}
              </a>
            </div>

            <Link
              href="/contact"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              <Clock className="h-4 w-4" />
              Schedule a Tour
            </Link>
          </div>

          {/* Quick Summary */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Quick Summary
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Price</dt>
                <dd className="font-medium text-gray-900">
                  {formatPrice(property.price)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Type</dt>
                <dd className="font-medium text-gray-900">
                  {typeLabel[property.type]}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Beds / Baths</dt>
                <dd className="font-medium text-gray-900">
                  {property.bedrooms} bd / {property.bathrooms} ba
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Size</dt>
                <dd className="font-medium text-gray-900">
                  {formatArea(property.sqft)} sqft
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Year Built</dt>
                <dd className="font-medium text-gray-900">
                  {property.yearBuilt}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
