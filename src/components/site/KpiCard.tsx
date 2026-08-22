import { type LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  sublabel?: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  icon?: LucideIcon;
  unit?: string;
  badge?: string;
  highlight?: boolean;
}

export function KpiCard({
  label,
  value,
  sublabel,
  delta,
  trend = "up",
  icon: Icon,
  unit,
  badge,
  highlight = false,
}: KpiCardProps) {
  const trendColor =
    trend === "up"
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : trend === "down"
        ? "text-rose-700 bg-rose-50 border-rose-200"
        : "text-slate-600 bg-slate-100 border-slate-200";

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border p-4.5 transition-all duration-200 hover:shadow-md ${
        highlight
          ? "border-primary/30 bg-primary/5 shadow-xs"
          : "border-border/80 bg-surface hover:border-primary/40 hover:bg-surface"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground line-clamp-1">
              {label}
            </span>
            {badge ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary border border-primary/20">
                {badge}
              </span>
            ) : null}
          </div>
        </div>
        {Icon ? (
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 border border-border/80 text-primary transition group-hover:scale-105">
            <Icon className="size-4" />
          </div>
        ) : null}
      </div>

      <div className="mt-2.5 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
        {unit ? <span className="text-xs font-semibold text-muted-foreground">{unit}</span> : null}
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
        {delta ? (
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-bold ${trendColor}`}
          >
            {trend === "up" ? "▲" : trend === "down" ? "▼" : "•"} {delta}
          </span>
        ) : (
          <span />
        )}
        {sublabel ? (
          <span className="text-[11px] font-medium text-muted-foreground truncate">{sublabel}</span>
        ) : null}
      </div>
    </div>
  );
}
