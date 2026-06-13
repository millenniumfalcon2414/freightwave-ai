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
import { SimControlPanel } from "@/components/site/SimControlPanel";
import { useSim } from "@/lib/simulation/useSim";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Executive Command Center · RailFlow AI" },
      { name: "description", content: "Live operational dashboard for India's rail-road freight network." },
    ],
  }),
  component: Dashboard,
});

const COLORS = {
  primary: "oklch(0.78 0.16 215)",
  accent: "oklch(0.78 0.17 165)",
  warn: "oklch(0.80 0.16 75)",
  muted: "oklch(0.55 0.03 240)",
};

function fmtNum(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return n.toLocaleString("en-IN");
  return n.toString();
}
function fmtEta(min: number) {
  const h = Math.floor(min / 60);
  const m = Math.floor(min % 60);
  return `${h}h ${String(m).padStart(2, "0")}m`;
}
function trendOf(v: number): "up" | "down" | "flat" {
  return v > 0.1 ? "up" : v < -0.1 ? "down" : "flat";
}

function Dashboard() {
  const kpis = useSim((s) => s.kpis);
  const freightTrend = useSim((s) => s.freightTrend);
  const corridorPerf = useSim((s) => s.corridorPerf);
  const costTrend = useSim((s) => s.costTrend);
  const alerts = useSim((s) => s.alerts);
  const shipments = useSim((s) => s.shipments);
  const hardware = useSim((s) => s.hardware);
  const params = useSim((s) => s.params);

  return (
    <div className="min-h-screen">
      <SiteNav />
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        <DashHeader running={params.running} tickMs={params.tickMs} emergency={params.emergencyMode} />

        {/* KPI grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          <KpiCard label="Total freight orders" value={fmtNum(kpis.totalOrders)} delta="live" icon={Boxes} />
          <KpiCard label="Active shipments" value={kpis.activeShipments.toLocaleString("en-IN")} delta={`fleet ${params.fleetSize}`} icon={Activity} />
          <KpiCard label="Rail utilization" value={`${kpis.railUtil.toFixed(1)}%`} delta={`${kpis.railDelta > 0 ? "+" : ""}${kpis.railDelta} pts`} trend={trendOf(kpis.railDelta)} icon={Train} />
          <KpiCard label="Road utilization" value={`${kpis.roadUtil.toFixed(1)}%`} delta={`${kpis.roadDelta > 0 ? "+" : ""}${kpis.roadDelta} pts`} trend={trendOf(kpis.roadDelta)} icon={Truck} />
          <KpiCard label="AI optimization score" value={String(kpis.aiScore)} unit="/100" delta={`policy ${params.aiAggressiveness}%`} icon={Brain} />
          <KpiCard label="Cost savings" value={`₹${kpis.costSavingsCr.toFixed(1)}Cr`} delta={`fuel ₹${params.fuelPriceIndex}`} icon={TrendingUp} />
          <KpiCard label="Carbon reduction" value={kpis.carbonKt.toFixed(1)} unit="kt CO₂" delta={`focus ${params.carbonFocus}%`} icon={Leaf} />
          <KpiCard label="Consolidated loads" value={fmtNum(kpis.consolidated)} delta="rolling" icon={Boxes} />
          <KpiCard label="Emergency shipments" value={String(kpis.emergency)} delta={params.emergencyMode ? "MODE ACTIVE" : "on SLA"} trend={params.emergencyMode ? "down" : "up"} icon={ShieldAlert} />
          <KpiCard label="Fleet efficiency" value={`${kpis.fleetEff.toFixed(1)}%`} delta={`weather ${params.weatherSeverity}%`} icon={Gauge} />
        </div>

        {/* Charts row */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Panel className="lg:col-span-2" title="Freight volume by mode" subtitle="Live · tonnes (×1000)">
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
                <Area type="monotone" dataKey="rail" stroke={COLORS.primary} fill="url(#gRail)" strokeWidth={2} isAnimationActive={false} />
                <Area type="monotone" dataKey="road" stroke={COLORS.accent} fill="url(#gRoad)" strokeWidth={2} isAnimationActive={false} />
                <Area type="monotone" dataKey="multi" stroke={COLORS.warn} fill="url(#gMulti)" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Critical alerts" subtitle={`${alerts.length} live · severity ranked`}>
            <div className="-mx-2 max-h-[280px] space-y-1.5 overflow-y-auto pr-1">
              {alerts.map((a) => <AlertRow key={a.id} {...a} />)}
              {alerts.length === 0 ? <EmptyHint msg="No alerts. Inject one from Sim Controls." /> : null}
            </div>
          </Panel>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Panel title="Corridor utilization" subtitle="Live · % capacity">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={corridorPerf} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.35 0.04 250 / 0.3)" vertical={false} />
                <XAxis dataKey="c" stroke={COLORS.muted} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={COLORS.muted} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="util" radius={[6, 6, 0, 0]} isAnimationActive={false}>
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
                <Line type="monotone" dataKey="cost" stroke={COLORS.accent} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
                <Line type="monotone" dataKey="saved" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Sustainability" subtitle="CO₂ avoided this month">
            <div className="flex h-[240px] flex-col justify-between">
              <div>
                <div className="font-mono text-4xl font-semibold">
                  {kpis.carbonKt.toFixed(1)}<span className="text-lg text-muted-foreground"> kt</span>
                </div>
                <div className="mt-1 text-xs text-success">▲ carbon focus {params.carbonFocus}%</div>
              </div>
              <div className="space-y-3">
                {[
                  { l: "Rail share", v: Math.round(kpis.railUtil) },
                  { l: "Multimodal share", v: Math.round((kpis.railUtil + kpis.roadUtil) / 4 + 5) },
                  { l: "Consolidation gain", v: Math.round(params.aiAggressiveness * 0.3) },
                ].map((x) => (
                  <div key={x.l}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">{x.l}</span>
                      <span className="font-mono">{x.v}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-border/60">
                      <div className="h-full rounded-full bg-gradient-to-r from-accent to-primary transition-all duration-500" style={{ width: `${x.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>

        {/* Shipments table + hardware mini */}
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Panel className="lg:col-span-2" title="Active shipments" subtitle="Live · ETA decreasing per tick">
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
                  {shipments.map((r) => (
                    <tr key={r.id} className="font-mono text-xs">
                      <td className="py-3 pr-3 text-foreground">{r.id}</td>
                      <td className="py-3 pr-3 text-muted-foreground">{r.corridor}</td>
                      <td className="py-3 pr-3 text-muted-foreground">{r.cargo}</td>
                      <td className="py-3 pr-3 tabular-nums">{fmtEta(r.etaMin)}</td>
                      <td className="py-3 pr-3">
                        <StatusPill s={r.status} />
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border/60">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${r.confidence}%` }} />
                          </div>
                          <span>{r.confidence}%</span>
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
                { i: Radio, l: "GPS uplink", v: `${hardware.gpsNodes.toLocaleString("en-IN")} nodes` },
                { i: Zap, l: "Fuel sensors", v: `${hardware.fuelHealthy.toFixed(1)}% healthy` },
                { i: AlertTriangle, l: "Shock events 24h", v: String(hardware.shockEvents24h) },
                { i: Activity, l: "MQTT throughput", v: `${(hardware.mqttRate / 1000).toFixed(1)}k msg/s` },
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
                  Tune every parameter in the Sim Controls panel — top-right.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <SiteFooter />
      <SimControlPanel />
      <AICopilot />
    </div>
  );
}

function DashHeader({ running, tickMs, emergency }: { running: boolean; tickMs: number; emergency: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-primary">Command Center</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Network Operations</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {running ? "Live" : "Paused"} · India freight network · tick {tickMs}ms
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
        {emergency ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-destructive">
            <span className="size-1.5 rounded-full bg-destructive animate-pulse" /> Emergency mode
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-success">
            <span className={"size-1.5 rounded-full bg-success " + (running ? "animate-pulse" : "")} />
            {running ? "All systems nominal" : "Engine paused"}
          </span>
        )}
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

function EmptyHint({ msg }: { msg: string }) {
  return <div className="px-3 py-8 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{msg}</div>;
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
          <span className="ml-auto font-mono text-foreground">{typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}</span>
        </div>
      ))}
    </div>
  );
}
