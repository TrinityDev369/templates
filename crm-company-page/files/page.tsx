"use client";

import { useState } from "react";
import {
  Building2, Globe, MapPin, Users, Phone, Mail,
  Calendar, DollarSign, Plus,
} from "lucide-react";

/* ---- Data types -------------------------------------------------- */

interface Company {
  id: string; name: string; industry: string; website: string;
  location: string; employeeCount: number; description: string; logoUrl?: string;
}
interface Contact { id: string; name: string; title: string; email: string; phone: string; }
type DealStage = "discovery" | "proposal" | "negotiation" | "closed-won" | "closed-lost";
interface Deal { id: string; name: string; stage: DealStage; value: number; closeDate: string; owner: string; }
type ActivityKind = "call" | "email" | "meeting" | "note";
interface Activity { id: string; kind: ActivityKind; description: string; timestamp: string; author: string; }

/* ---- Stub data — TODO: replace with your CRM data source --------- */

function getCompany(_id: string): Company {
  return {
    id: "comp-1", name: "Acme Corporation", industry: "Technology",
    website: "https://acme.example.com", location: "San Francisco, CA",
    employeeCount: 250,
    description: "Enterprise SaaS platform for supply-chain visibility. Long-standing partner with three active contracts.",
  };
}
function getContacts(_companyId: string): Contact[] {
  return [
    { id: "c1", name: "Jane Cooper", title: "CEO", email: "jane@acme.example.com", phone: "+1 555-0101" },
    { id: "c2", name: "Robert Fox", title: "VP Engineering", email: "robert@acme.example.com", phone: "+1 555-0102" },
    { id: "c3", name: "Emily Chen", title: "Head of Product", email: "emily@acme.example.com", phone: "+1 555-0103" },
    { id: "c4", name: "Michael Brown", title: "CFO", email: "michael@acme.example.com", phone: "+1 555-0104" },
  ];
}
function getDeals(_companyId: string): Deal[] {
  return [
    { id: "d1", name: "Platform Rebuild", stage: "negotiation", value: 120_000, closeDate: "2026-03-15", owner: "Sarah K." },
    { id: "d2", name: "Annual Support", stage: "closed-won", value: 48_000, closeDate: "2026-01-10", owner: "Tom R." },
    { id: "d3", name: "Data Migration", stage: "proposal", value: 35_000, closeDate: "2026-04-01", owner: "Sarah K." },
    { id: "d4", name: "Mobile App MVP", stage: "discovery", value: 85_000, closeDate: "2026-06-30", owner: "Li W." },
    { id: "d5", name: "Legacy Sunset", stage: "closed-lost", value: 22_000, closeDate: "2025-12-01", owner: "Tom R." },
  ];
}
function getActivities(_companyId: string): Activity[] {
  return [
    { id: "a1", kind: "meeting", description: "Kickoff call for Platform Rebuild scope review", timestamp: "2026-02-20T14:00:00Z", author: "Sarah K." },
    { id: "a2", kind: "email", description: "Sent revised SOW to Jane Cooper", timestamp: "2026-02-18T09:30:00Z", author: "Sarah K." },
    { id: "a3", kind: "call", description: "Discussed timeline concerns with Robert Fox", timestamp: "2026-02-15T16:00:00Z", author: "Tom R." },
    { id: "a4", kind: "note", description: "CFO approved budget increase for Q2 engagements", timestamp: "2026-02-12T11:00:00Z", author: "Li W." },
    { id: "a5", kind: "email", description: "Follow-up on data migration requirements", timestamp: "2026-02-10T08:15:00Z", author: "Sarah K." },
  ];
}

/* ---- Helpers ----------------------------------------------------- */

const STAGE_COLORS: Record<DealStage, string> = {
  discovery: "bg-blue-100 text-blue-800",
  proposal: "bg-amber-100 text-amber-800",
  negotiation: "bg-purple-100 text-purple-800",
  "closed-won": "bg-green-100 text-green-800",
  "closed-lost": "bg-red-100 text-red-800",
};

function StageBadge({ stage }: { stage: DealStage }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STAGE_COLORS[stage]}`}>
      {stage.replace("-", " ")}
    </span>
  );
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const ACTIVITY_ICONS: Record<ActivityKind, typeof Phone> = {
  call: Phone, email: Mail, meeting: Calendar, note: Building2,
};

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

/* ---- Tabs -------------------------------------------------------- */

type Tab = "contacts" | "deals" | "activity";
const TABS: { key: Tab; label: string }[] = [
  { key: "contacts", label: "Contacts" },
  { key: "deals", label: "Deals" },
  { key: "activity", label: "Activity" },
];

/* ---- Section: Contacts ------------------------------------------- */

function ContactsSection({ contacts }: { contacts: Contact[] }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Contacts ({contacts.length})</h2>
        <button className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus className="h-4 w-4" /> Add Contact
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.map((c) => (
          <div key={c.id} className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                {initials(c.name)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{c.name}</p>
                <p className="text-sm text-gray-500">{c.title}</p>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-gray-400" /> {c.email}</p>
              <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-gray-400" /> {c.phone}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Section: Deals ---------------------------------------------- */

function DealsSection({ deals }: { deals: Deal[] }) {
  const total = deals.reduce((s, d) => s + d.value, 0);
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Deals ({deals.length})
          <span className="ml-2 text-sm font-normal text-gray-500">Total: {fmtCurrency(total)}</span>
        </h2>
      </div>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-lg border border-gray-200 sm:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Deal</th>
              <th className="px-4 py-3 font-medium text-gray-600">Stage</th>
              <th className="px-4 py-3 font-medium text-gray-600 text-right">Value</th>
              <th className="px-4 py-3 font-medium text-gray-600">Close Date</th>
              <th className="px-4 py-3 font-medium text-gray-600">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {deals.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                <td className="px-4 py-3"><StageBadge stage={d.stage} /></td>
                <td className="px-4 py-3 text-right tabular-nums">{fmtCurrency(d.value)}</td>
                <td className="px-4 py-3 text-gray-600">{fmtDate(d.closeDate)}</td>
                <td className="px-4 py-3 text-gray-600">{d.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile cards */}
      <div className="space-y-3 sm:hidden">
        {deals.map((d) => (
          <div key={d.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-900">{d.name}</p>
              <StageBadge stage={d.stage} />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
              <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> {fmtCurrency(d.value)}</span>
              <span>{fmtDate(d.closeDate)}</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">Owner: {d.owner}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- Section: Activity ------------------------------------------- */

function ActivitySection({ activities }: { activities: Activity[] }) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Activity ({activities.length})</h2>
      <div className="relative">
        <div className="absolute left-5 top-2 bottom-2 w-px bg-gray-200" />
        {activities.map((a) => {
          const Icon = ACTIVITY_ICONS[a.kind];
          return (
            <div key={a.id} className="relative flex gap-4 pb-6 last:pb-0">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gray-100 shadow-sm">
                <Icon className="h-4 w-4 text-gray-600" />
              </div>
              <div className="pt-1">
                <p className="text-sm text-gray-900">{a.description}</p>
                <p className="mt-0.5 text-xs text-gray-500">{fmtTime(a.timestamp)} &middot; {a.author}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Page -------------------------------------------------------- */

export default function CompanyPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<Tab>("contacts");

  const company = getCompany(params.id);
  const contacts = getContacts(company.id);
  const deals = getDeals(company.id);
  const activities = getActivities(company.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Company Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={`${company.name} logo`} className="h-16 w-16 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-700">
              {initials(company.name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
              <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4 text-gray-400" /> {company.industry}</span>
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                <Globe className="h-4 w-4" /> {company.website.replace(/^https?:\/\//, "")}
              </a>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" /> {company.location}</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-gray-400" /> {company.employeeCount} employees</span>
            </div>
            {company.description && (
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{company.description}</p>
            )}
          </div>
          <button className="shrink-0 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Edit
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-6" aria-label="Company sections">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "contacts" && <ContactsSection contacts={contacts} />}
        {activeTab === "deals" && <DealsSection deals={deals} />}
        {activeTab === "activity" && <ActivitySection activities={activities} />}
      </div>
    </div>
  );
}
