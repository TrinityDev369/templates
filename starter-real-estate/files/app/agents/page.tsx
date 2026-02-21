import { AgentCard } from "@/components/agent-card";
import { agents } from "@/lib/data";

export const metadata = {
  title: "Meet Our Agents | Homestead",
  description:
    "Get to know our experienced real estate professionals. Our agents bring local expertise and personalized service to every transaction.",
};

export default function AgentsPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Meet Our Agents
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-500">
          Our team of dedicated professionals combines deep local knowledge with
          years of industry experience. Whether you are a first-time buyer or a
          seasoned investor, our agents will guide you through every step of the
          process with expertise and care.
        </p>
      </div>

      {/* Agent Grid */}
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </section>
  );
}
