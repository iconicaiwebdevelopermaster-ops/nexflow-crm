import Link from "next/link";
import { Zap, Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    desc: "Perfect for solo founders starting outreach.",
    features: [
      "200 leads/month scraping",
      "1 email account",
      "500 emails/month",
      "Basic CRM pipeline",
      "CSV import/export",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Pro",
    price: "$79",
    period: "/month",
    desc: "For agencies managing multiple clients.",
    features: [
      "2,000 leads/month scraping",
      "5 email accounts",
      "5,000 emails/month",
      "Kanban pipeline + AI icebreakers",
      "Priority support",
      "Team collaboration (3 seats)",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/month",
    desc: "Unlimited power for scaling agencies.",
    features: [
      "Unlimited lead scraping",
      "Unlimited email accounts",
      "Unlimited emails",
      "AI autonomous agents",
      "Custom integrations",
      "Dedicated account manager",
      "Unlimited team seats",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0A0D14] pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors">
            <Zap size={14} className="text-blue-400" />
            <span className="text-sm">NexFlow</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Simple, Transparent{" "}
            <span className="text-blue-400">Pricing</span>
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            No hidden fees. No per-lead charges. Cancel anytime.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`
                relative rounded-2xl p-8 flex flex-col
                ${plan.popular
                  ? "bg-gradient-to-b from-blue-600/10 to-[#0E1220] border-2 border-blue-500/30 shadow-xl shadow-blue-500/10"
                  : "bg-[#0E1220]/60 border border-white/5"
                }
              `}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-xs text-gray-500 mb-6">{plan.desc}</p>

              <div className="mb-8">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                <span className="text-gray-500 text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-400">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`
                  flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all
                  ${plan.popular
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  }
                `}
              >
                {plan.cta}
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
