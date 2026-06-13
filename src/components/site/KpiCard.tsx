import { type LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  icon?: LucideIcon;
  unit?: string;
}

export function KpiCard({ label, value, delta, trend = "up", icon: Icon, unit }: KpiCardProps) {
  const trendColor =
    trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";
  return (
    <div className="group relative overflow-hidden rounded-xl glass p-5 transition hover:border-primary/50">
      <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-2xl transition group-hover:bg-primary/20" />
      <div className="flex items-start justify-between">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        {Icon ? (
          <div className="grid size-8 place-items-center rounded-md bg-primary/10 ring-1 ring-primary/30">
            <Icon className="size-4 text-primary" />
          </div>
        ) : null}
      </div>
      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="font-mono text-3xl font-semibold tracking-tight">{value}</span>
        {unit ? <span className="text-xs text-muted-foreground">{unit}</span> : null}
      </div>
      {delta ? (
        <div className={`mt-2 font-mono text-[11px] ${trendColor}`}>
          {trend === "up" ? "▲" : trend === "down" ? "▼" : "■"} {delta}
        </div>
      ) : null}
    </div>
  );
}
