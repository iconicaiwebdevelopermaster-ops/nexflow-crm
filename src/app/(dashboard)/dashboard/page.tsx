import { Users, Mail, CheckCircle2, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const totalLeadsCount = 0;
  const contactedCount = 0;
  const convertedCount = 0;

  const stats = [
    {
      title: "Total Prospects",
      value: totalLeadsCount.toString(),
      icon: Users,
      change: `${totalLeadsCount} active in pipeline`,
      color: "text-blue-400",
    },
    {
      title: "Emails Sent",
      value: contactedCount.toString(),
      icon: Mail,
      change: "Outreach in progress",
      color: "text-amber-400",
    },
    {
      title: "Converted Deals",
      value: convertedCount.toString(),
      icon: CheckCircle2,
      change: "Successful leads",
      color: "text-emerald-400",
    },
    {
      title: "Conversion Rate",
      value: "0%",
      icon: TrendingUp,
      change: "Pipeline efficiency",
      color: "text-purple-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back!</h1>
        <p className="text-sm text-zinc-400">
          Here is what is happening with your outreach pipeline today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">{stat.title}</span>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <p className="mt-1 text-xs text-zinc-500">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
