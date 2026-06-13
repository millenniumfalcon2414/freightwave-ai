import { createFileRoute } from "@tanstack/react-router";
import {
  Activity, Boxes, Brain, Gauge, Leaf, ShieldAlert, TrendingUp, Train, Truck,
  AlertTriangle, Zap, Radio,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { KpiCard } from "@/components/site/KpiCard";
import { AICopilot } from "@/components/site/AICopilot";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Executive Command Center · RailFlow AI" },
      { name: "description", content: "Live operational dashboard for India's rail-road freight network." },
    ],
  }),
  component: Dashboard,
});

const freightTrend = [
  { d: "Mon", rail: 4200, road: 6100, multi: 3200 },
  { d: "Tue", rail: 4500, road: 5800, multi: 3500 },
  { d: "Wed", rail: 4900, road: 5400, multi: 3800 },
  { d: "Thu", rail: 5200, road: 5100, multi: 4100 },
  { d: "Fri", rail: 5600, road: 4900, multi: 4400 },
  { d: "Sat", rail: 5300, road: 4600, multi: 4600 },
  { d: "Sun", rail: 5800, road: 4400, multi: 4900 },
];

const corridorPerf = [
  { c: "DEL-MUM", util: 94 },
  { c: "DEL-KOL", util: 87 },
  { c: "MUM-CHE", util: 81 },
  { c: "KOL-VSK", util: 76 },
  { c: "AHM-MND", util: 92 },
  { c: "LDH-DEL", util: 89 },
];

const costTrend = [
  { m: "W1", cost: 142, saved: 18 },
  { m: "W2", cost: 138, saved: 22 },
  { m: "W3", cost: 134, saved: 28 },
  { m: "W4", cost: 128, saved: 34 },
];

const alerts = [
  { t: "14:22", sev: "high", msg: "Mundra Port: congestion forecast T+120m. Rerouting 18 rakes.", node: "MND" },
  { t: "13:45", sev: "low", msg: "Varanasi Hub: load balancing complete. Utilization +14%.", node: "VAR" },
  { t: "13:02", sev: "med", msg: "Rewari segment: scheduled corridor maintenance window opens 22:00.", node: "REW" },
  { t: "12:31", sev: "critical", msg: "Shock event detected on RAKE-8842-X near Surat. Vibration 4.2g.", node: "RAKE" },
  { t: "11:58", sev: "med", msg: "Fuel anomaly: −9.4% deviation on Truck fleet F-227.", node: "F-227" },
];

const COLORS = {
  primary: "oklch(0.78 0.16 215)",
  accent: "oklch(0.78 0.17 165)",
  warn: "oklch(0.80 0.16 75)",
  muted: "oklch(0.55 0.03 240)",
};

function Dashboard() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        <DashHeader />

        {/* KPI grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          <KpiCard label="Total freight orders" value="12,438" delta="+4.2% wow" icon={Boxes} />
          <KpiCard label="Active shipments" value="1,248" delta="+18 last hr" icon={Activity} />
          <KpiCard label="Rail utilization" value="92.4%" delta="+3.1 pts" icon={Train} />
          <KpiCard label="Road utilization" value="78.6%" delta="-1.4 pts" trend="down" icon={Truck} />
          <KpiCard label="AI optimization score" value="94" unit="/100" delta="Top decile" icon={Brain} />
          <KpiCard label="Cost savings" value="₹287Cr" delta="+22% qoq" icon={TrendingUp} />
          <KpiCard label="Carbon reduction" value="82.4k" unit="t CO₂" delta="+12% mom" icon={Leaf} />
          <KpiCard label="Consolidated loads" value="19,540" delta="+8.7% mom" icon={Boxes} />
          <KpiCard label="Emergency shipments" value="34" delta="all on SLA" icon={ShieldAlert} />
          <KpiCard label="Fleet efficiency" value="88.1%" delta="+2.4 pts" icon={Gauge} />
        </div>

        {/* Charts row */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Panel className="lg:col-span-2" title="Freight volume by mode" subtitle="Last 7 days · tonnes (×1000)">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={freightTrend} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRail" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.55} />
                    <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRoad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.accent} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gMulti" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.warn} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={COLORS.warn} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.35 0.04 250 / 0.3)" vertical={false} />
                <XAxis dataKey="d" stroke={COLORS.muted} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={COLORS.muted} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: "oklch(0.7 0.03 240)" }} />
                <Area type="monotone" dataKey="rail" stroke={COLORS.primary} fill="url(#gRail)" strokeWidth={2} />
                <Area type="monotone" dataKey="road" stroke={COLORS.accent} fill="url(#gRoad)" strokeWidth={2} />
                <Area type="monotone" dataKey="multi" stroke={COLORS.warn} fill="url(#gMulti)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Critical alerts" subtitle="Realtime · ranked by severity">
            <div className="-mx-2 max-h-[280px] space-y-1.5 overflow-y-auto pr-1">
              {alerts.map((a, i) => <AlertRow key={i} {...a} />)}
            </div>
          </Panel>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Panel title="Corridor utilization" subtitle="Top routes · % capacity">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={corridorPerf} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.35 0.04 250 / 0.3)" vertical={false} />
                <XAxis dataKey="c" stroke={COLORS.muted} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={COLORS.muted} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="util" radius={[6, 6, 0, 0]}>
                  {corridorPerf.map((c, i) => (
                    <Cell key={i} fill={c.util > 90 ? COLORS.primary : c.util > 80 ? COLORS.accent : COLORS.warn} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Cost trend" subtitle="₹ Cr (cost) vs savings %">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={costTrend} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.35 0.04 250 / 0.3)" vertical={false} />
                <XAxis dataKey="m" stroke={COLORS.muted} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={COLORS.muted} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTip />} />
                <Line type="monotone" dataKey="cost" stroke={COLORS.accent} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="saved" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Sustainability" subtitle="CO₂ avoided this month">
            <div className="flex h-[240px] flex-col justify-between">
              <div>
                <div className="font-mono text-4xl font-semibold">82.4<span className="text-lg text-muted-foreground"> kt</span></div>
                <div className="mt-1 text-xs text-success">▲ 12.4% vs last month</div>
              </div>
              <div className="space-y-3">
                {[
                  { l: "Rail share", v: 64 },
                  { l: "Multimodal share", v: 28 },
                  { l: "Consolidation gain", v: 18 },
                ].map((x) => (
                  <div key={x.l}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">{x.l}</span>
                      <span className="font-mono">{x.v}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-border/60">
                      <div className="h-full rounded-full bg-gradient-to-r from-accent to-primary" style={{ width: `${x.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>

        {/* Shipments table + hardware mini */}
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Panel className="lg:col-span-2" title="Active shipments" subtitle="Live · top movements">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="py-2 pr-3">Rake ID</th>
                    <th className="py-2 pr-3">Corridor</th>
                    <th className="py-2 pr-3">Cargo</th>
                    <th className="py-2 pr-3">ETA</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {[
                    { id: "RAKE-8842-X", c: "Mumbai → Dadri", g: "Containers", e: "29h 14m", s: "on_schedule", k: 97 },
                    { id: "RAKE-9120-L", c: "Ludhiana → Mundra", g: "Auto parts", e: "41h 02m", s: "delay_20m", k: 88 },
                    { id: "RAKE-7311-N", c: "Nagpur → Chennai", g: "Steel coil", e: "33h 50m", s: "on_schedule", k: 95 },
                    { id: "RAKE-2208-V", c: "Kolkata → Vizag", g: "Coal", e: "12h 08m", s: "rerouted", k: 82 },
                    { id: "RAKE-5044-B", c: "Bengaluru → Mumbai", g: "FMCG", e: "26h 31m", s: "on_schedule", k: 93 },
                  ].map((r) => (
                    <tr key={r.id} className="font-mono text-xs">
                      <td className="py-3 pr-3 text-foreground">{r.id}</td>
                      <td className="py-3 pr-3 text-muted-foreground">{r.c}</td>
                      <td className="py-3 pr-3 text-muted-foreground">{r.g}</td>
                      <td className="py-3 pr-3">{r.e}</td>
                      <td className="py-3 pr-3">
                        <StatusPill s={r.s} />
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border/60">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${r.k}%` }} />
                          </div>
                          <span>{r.k}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Hardware telemetry" subtitle="ESP32 edge nodes · live">
            <div className="space-y-3">
              {[
                { i: Radio, l: "GPS uplink", v: "1,248 nodes" },
                { i: Zap, l: "Fuel sensors", v: "92.4% healthy" },
                { i: AlertTriangle, l: "Shock events 24h", v: "3" },
                { i: Activity, l: "MQTT throughput", v: "14.2k msg/s" },
              ].map((x) => (
                <div key={x.l} className="flex items-center justify-between rounded-md border border-border bg-surface/50 px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="grid size-8 place-items-center rounded-md bg-primary/10 ring-1 ring-primary/30">
                      <x.i className="size-4 text-primary" />
                    </div>
                    <div className="text-sm">{x.l}</div>
                  </div>
                  <div className="font-mono text-xs text-foreground">{x.v}</div>
                </div>
              ))}
              <div className="mt-2 rounded-md border border-accent/30 bg-accent/10 p-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent">Synthetic data</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Auto-switches to live IoT feed when ESP32 fleet is paired.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <SiteFooter />
      <AICopilot />
    </div>
  );
}

function DashHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-primary">Command Center</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Network Operations</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Live · India freight network · synthetic data feed</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
        <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-success">
          <span className="size-1.5 rounded-full bg-success animate-pulse-soft" /> All systems nominal
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-muted-foreground">
          UTC+05:30 · IST
        </span>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={"rounded-xl glass p-5 " + className}>
      <header className="mb-4 flex items-end justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          {subtitle ? <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{subtitle}</p> : null}
        </div>
      </header>
      {children}
    </section>
  );
}

function StatusPill({ s }: { s: string }) {
  const map: Record<string, { c: string; t: string }> = {
    on_schedule: { c: "border-success/40 bg-success/10 text-success", t: "ON SCHEDULE" },
    delay_20m: { c: "border-warning/40 bg-warning/10 text-warning", t: "DELAY 20M" },
    rerouted: { c: "border-primary/40 bg-primary/10 text-primary", t: "REROUTED" },
  };
  const v = map[s] ?? map.on_schedule;
  return <span className={"rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest " + v.c}>{v.t}</span>;
}

function AlertRow({ t, sev, msg, node }: { t: string; sev: string; msg: string; node: string }) {
  const color =
    sev === "critical" ? "border-destructive bg-destructive/10 text-destructive" :
    sev === "high" ? "border-warning bg-warning/10 text-warning" :
    sev === "med" ? "border-primary bg-primary/10 text-primary" :
    "border-border bg-surface/40 text-muted-foreground";
  return (
    <div className={"flex items-start gap-3 rounded-md border-l-2 px-3 py-2.5 " + color}>
      <div className="font-mono text-[10px] uppercase tracking-widest opacity-80">{t}</div>
      <div className="min-w-0 flex-1">
        <div className="text-xs leading-relaxed text-foreground/90">{msg}</div>
        <div className="mt-1 font-mono text-[9px] uppercase tracking-widest opacity-70">node · {node} · {sev}</div>
      </div>
    </div>
  );
}

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-background/95 px-3 py-2 text-xs shadow-xl backdrop-blur-sm">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="size-2 rounded-sm" style={{ background: p.color }} />
          <span className="font-mono text-muted-foreground">{p.dataKey}</span>
          <span className="ml-auto font-mono text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}
