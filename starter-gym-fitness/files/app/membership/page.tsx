import Link from "next/link";
import { Check, ArrowRight, Flame } from "lucide-react";
import { membershipPlans } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Membership | Iron Peak Fitness",
  description:
    "Choose the membership plan that fits your goals and budget. All plans include access to premium equipment, locker rooms, and a supportive community.",
};

const faqs = [
  {
    question: "Is there a free trial?",
    answer:
      "Yes! Every new member gets a full 7-day free trial with access to all facilities, classes, and amenities. No credit card required to start.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. All our memberships are month-to-month with no long-term contracts. You can cancel anytime from your member dashboard or by visiting the front desk.",
  },
  {
    question: "Can I freeze my membership?",
    answer:
      "Yes. You can freeze your membership for up to 3 months per year at no additional cost. This is perfect for vacations, injuries, or busy periods.",
  },
  {
    question: "What is included in the free trial?",
    answer:
      "Your 7-day trial includes full gym access, all group classes, locker rooms, and one complimentary personal training session to help you get started.",
  },
  {
    question: "Do you offer family or corporate plans?",
    answer:
      "We offer discounted rates for families (2+ members) and corporate partnerships. Contact us for a custom quote tailored to your group size.",
  },
  {
    question: "What are the gym hours?",
    answer:
      "We are open Monday through Friday from 5:00 AM to 11:00 PM, Saturday from 6:00 AM to 10:00 PM, and Sunday from 7:00 AM to 9:00 PM.",
  },
];

export default function MembershipPage() {
  return (
    <section className="py-20 px-4 bg-gray-950">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16">
          <span className="text-brand-500 font-semibold tracking-wider uppercase text-sm">
            Invest in Yourself
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mt-2">
            Membership Plans
          </h1>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Choose the plan that matches your ambition. Every membership includes
            access to our state-of-the-art facilities, expert support, and a
            community that keeps you accountable.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {membershipPlans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl border p-8 flex flex-col",
                plan.popular
                  ? "border-brand-500 bg-gray-900 shadow-lg shadow-brand-500/10"
                  : "border-gray-800 bg-gray-900"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
                    <Flame className="h-3.5 w-3.5" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-lg font-bold uppercase tracking-wider text-gray-300">
                  {plan.name}
                </h3>
                <div className="mt-4">
                  <span className="text-5xl font-black text-white">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-gray-500 ml-1">/{plan.interval}</span>
                </div>
              </div>

              <ul className="mt-8 space-y-4 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className={cn(
                        "h-5 w-5 shrink-0 mt-0.5",
                        plan.popular ? "text-brand-500" : "text-gray-600"
                      )}
                    />
                    <span className="text-sm text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className={cn(
                  "mt-8 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-4 text-sm font-bold uppercase tracking-wide transition-colors",
                  plan.popular
                    ? "bg-brand-500 hover:bg-brand-600 text-white"
                    : "bg-gray-800 hover:bg-gray-700 text-white"
                )}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <span className="text-brand-500 font-semibold tracking-wider uppercase text-sm">
              Got Questions?
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-gray-800 bg-gray-900"
              >
                <summary className="flex cursor-pointer items-center justify-between p-6 text-white font-semibold hover:text-brand-500 transition-colors [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="ml-4 shrink-0 text-gray-500 group-open:rotate-45 transition-transform text-xl">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
