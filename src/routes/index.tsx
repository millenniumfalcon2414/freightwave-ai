import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight, Play, Brain, Train, Truck, Leaf, Boxes, Radio, Cpu,
  Shield, Zap, BarChart3, TrendingUp, AlertTriangle, ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { IndiaNetwork } from "@/components/site/IndiaNetwork";
import { AICopilot } from "@/components/site/AICopilot";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <Hero />
      <TrustBar />
      <StatsBand />
      <Features />
      <OptimizationShowcase />
      <DigitalTwin />
      <HardwareSection />
      <Sustainability />
      <Testimonials />
      <Faq />
      <CtaBand />
      <SiteFooter />
      <AICopilot />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute -left-32 top-20 size-[420px] rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute -right-32 top-40 size-[420px] rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-[1400px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:py-24">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-primary">
            <span className="size-1.5 rounded-full bg-primary animate-pulse-soft" />
            Western & Eastern DFC · Live
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Optimize every shipment with{" "}
            <span className="text-gradient">AI-powered rail–road intelligence</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Reduce logistics cost, lower carbon emissions, and maximize freight efficiency across India's
            multimodal network — orchestrated in real time by RailFlow AI.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground glow-primary transition hover:brightness-110"
            >
              Launch Platform <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </Link>
            <button className="inline-flex items-center gap-2 rounded-md border border-border bg-surface/60 px-5 py-3 text-sm font-medium text-foreground/90 transition hover:border-primary/40">
              <Play className="size-4 text-primary" /> Request Demo
            </button>
          </div>

          <div className="mt-10 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-xl border border-border bg-border/60">
            {[
              { v: "34%", l: "Avg cost cut" },
              { v: "58%", l: "CO₂ reduced" },
              { v: "2.4×", l: "Faster routing" },
            ].map((s) => (
              <div key={s.l} className="bg-surface/70 p-4">
                <div className="font-mono text-2xl font-semibold text-primary">{s.v}</div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-[420px] sm:h-[520px] lg:h-[600px]">
          <IndiaNetwork />
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const names = ["CONCOR", "Indian Railways", "Adani Logistics", "DP World", "JSW Infra", "Maersk", "Mahindra Logistics", "Allcargo"];
  return (
    <section className="border-b border-border/60 bg-surface/30 py-6">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="mb-4 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Trusted by India's freight backbone
        </div>
        <div className="overflow-hidden">
          <div className="flex w-[200%] animate-ticker items-center gap-12 opacity-70">
            {[...names, ...names].map((n, i) => (
              <span key={i} className="whitespace-nowrap text-sm font-semibold tracking-tight text-foreground/70">
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBand() {
  const stats = [
    { v: "12,438", l: "Active corridors" },
    { v: "4.2", l: "Cr tonnes optimized", u: "Mn t" },
    { v: "₹287", l: "Cr saved", u: "Cr" },
    { v: "19,500", l: "Trucks consolidated" },
    { v: "82k", l: "Tons CO₂ avoided" },
    { v: "98.4%", l: "Schedule adherence" },
  ];
  return (
    <section id="network" className="border-b border-border/60 py-16">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((s) => (
            <div key={s.l} className="rounded-xl glass p-5">
              <div className="font-mono text-2xl font-semibold tracking-tight">{s.v}</div>
              <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: Brain, t: "AI Optimization Engine", d: "Recommends rail, road, or multimodal with confidence, cost, ETA, and emissions — explainable end-to-end." },
    { icon: Boxes, t: "Freight Consolidation", d: "Identify underutilized rakes and trucks. Combine loads to slash vehicle count and lift utilization above 90%." },
    { icon: TrendingUp, t: "Demand Forecasting", d: "Predict weekly tonnage by corridor and commodity using time-series and exogenous signals." },
    { icon: Leaf, t: "Carbon Intelligence", d: "Real-time ESG scorecard. Audited Scope 3 accounting for every ton-kilometre moved." },
    { icon: AlertTriangle, t: "Emergency Logistics", d: "Auto-prioritise medical, disaster relief, and critical infrastructure cargo with route reassignment." },
    { icon: Shield, t: "Anomaly & Risk", d: "Detect fuel theft, shock events, route deviation, and cargo breach across the fleet." },
  ];
  return (
    <section id="features" className="border-b border-border/60 py-20">
      <div className="mx-auto max-w-[1400px] px-6">
        <SectionLabel eyebrow="Platform" title="One operating system for the freight corridor" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <div key={i} className="group rounded-xl glass p-6 transition hover:border-primary/40">
              <div className="grid size-10 place-items-center rounded-md bg-primary/15 ring-1 ring-primary/30">
                <it.icon className="size-5 text-primary" />
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{it.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OptimizationShowcase() {
  return (
    <section className="border-b border-border/60 bg-surface/30 py-20">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col justify-center">
          <SectionLabel eyebrow="AI Recommendation Engine" title="Three modes. One optimal answer." align="left" />
          <p className="mt-4 max-w-md text-muted-foreground">
            Enter origin, destination, cargo, weight, and priority. RailFlow returns the optimal mode with full
            reasoning — cost, time, carbon, and operational risk all weighted.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Explainable confidence score for every recommendation",
              "Live availability of rakes, terminals, and corridor congestion",
              "₹ savings and ton-CO₂ avoided previewed before commit",
            ].map((x) => (
              <li key={x} className="flex items-start gap-3">
                <span className="mt-1.5 size-1.5 rounded-full bg-primary" />
                <span className="text-foreground/80">{x}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl glass p-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Optimization · Live</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent">Confidence 94%</span>
          </div>

          <div className="mt-4 grid gap-2">
            <Row label="Origin" value="Delhi / Dadri ICD" />
            <Row label="Destination" value="Mumbai / JNPT" />
            <Row label="Cargo" value="Containerized — 1,420 t" />
            <Row label="Priority" value="Standard" />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { m: "Road", cost: "₹14.8L", eta: "38 h", co2: "62 t" },
              { m: "Rail + Truck", cost: "₹12.0L", eta: "29 h", co2: "38 t", best: true },
              { m: "Rail", cost: "₹11.2L", eta: "34 h", co2: "22 t" },
            ].map((r) => (
              <div
                key={r.m}
                className={
                  "rounded-lg border p-3 " +
                  (r.best ? "border-primary/60 bg-primary/10" : "border-border bg-surface/60")
                }
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  {r.m.includes("Rail") ? <Train className="size-3.5 text-primary" /> : <Truck className="size-3.5 text-accent" />}
                  {r.m}
                </div>
                <div className="mt-3 font-mono text-lg">{r.cost}</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {r.eta} · {r.co2} CO₂
                </div>
                {r.best ? <div className="mt-2 inline-block rounded-full bg-primary px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary-foreground">Recommended</div> : null}
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-border bg-background/60 p-3 text-xs text-muted-foreground">
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent">Why</span>
            <p className="mt-1 leading-relaxed">
              Rail-leg DEL→NAG saves ₹2.8L and 38% CO₂. Last-mile NAG→MUM by truck keeps ETA inside the SLA window
              while avoiding JNPT inland congestion.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-2 text-sm">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function DigitalTwin() {
  return (
    <section className="border-b border-border/60 py-20">
      <div className="mx-auto max-w-[1400px] px-6">
        <SectionLabel eyebrow="Logistics Digital Twin" title="Watch the corridor breathe." />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 h-[420px]"><IndiaNetwork /></div>
          <div className="grid gap-4">
            {[
              { t: "Active Shipments", v: "1,248", s: "+12 last hr" },
              { t: "Terminals", v: "84", s: "12 ports · 72 hubs" },
              { t: "Avg Dwell Time", v: "4.2 h", s: "−18% vs benchmark" },
            ].map((x) => (
              <div key={x.t} className="rounded-xl glass p-5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{x.t}</div>
                <div className="mt-2 font-mono text-3xl font-semibold">{x.v}</div>
                <div className="mt-1 text-xs text-success">{x.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HardwareSection() {
  const sensors = [
    { i: Radio, t: "GPS Module", v: "0.5 m precision" },
    { i: Boxes, t: "Load Cell", v: "Live cargo weight" },
    { i: Zap, t: "Fuel Sensor", v: "Theft & burn rate" },
    { i: AlertTriangle, t: "MPU6050", v: "Shock detection" },
    { i: Cpu, t: "RFID Reader", v: "Asset handoff" },
    { i: Leaf, t: "Temp / Humidity", v: "Cold-chain integrity" },
  ];
  return (
    <section id="hardware" className="border-b border-border/60 bg-surface/30 py-20">
      <div className="mx-auto max-w-[1400px] px-6">
        <SectionLabel eyebrow="Hardware Integration" title="ESP32 edge nodes on every rake & truck" />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-2xl glass p-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Architecture</div>
            <div className="mt-6 flex flex-col items-stretch gap-2">
              {["ESP32 Edge Node", "Sensors (GPS · Load · Temp · IMU · RFID · Fuel)", "MQTT Broker", "Cloud Database", "RailFlow AI Platform"].map((s, i, a) => (
                <div key={s} className="flex flex-col items-center">
                  <div className="w-full rounded-md border border-border bg-background/60 px-4 py-3 text-center text-sm font-medium">
                    {s}
                  </div>
                  {i < a.length - 1 ? <ChevronDown className="my-1 size-4 text-primary" /> : null}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {sensors.map((s) => (
              <div key={s.t} className="rounded-xl glass p-4">
                <s.i className="size-5 text-primary" />
                <div className="mt-3 text-sm font-semibold">{s.t}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{s.v}</div>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-success animate-pulse-soft" />
                  <span className="font-mono text-[10px] uppercase text-success">online</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Sustainability() {
  return (
    <section className="border-b border-border/60 py-20">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionLabel eyebrow="Sustainability" title="Move more freight. Burn less carbon." align="left" />
          <p className="mt-4 max-w-md text-muted-foreground">
            Rail emits roughly one-third the CO₂ of road per ton-kilometre. RailFlow's modal-shift engine has avoided
            <span className="font-semibold text-foreground"> 82,000 tonnes of CO₂ </span>
            for our customers in the last 12 months.
          </p>
        </div>
        <div className="rounded-2xl glass p-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">CO₂ per ton-km</div>
          <div className="mt-6 space-y-5">
            {[
              { m: "Road only", v: 62, label: "62 g" },
              { m: "Multimodal", v: 38, label: "38 g" },
              { m: "Rail only", v: 22, label: "22 g" },
            ].map((b) => (
              <div key={b.m}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{b.m}</span>
                  <span className="font-mono text-muted-foreground">{b.label}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-border/60">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
                    style={{ width: `${(b.v / 70) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { q: "RailFlow turned our DFC operations into a single command center. We cut empty-running by 41% in one quarter.", a: "Director, National Freight Operator" },
    { q: "The AI recommendation engine isn't a black box — every decision has cost, ETA and CO₂ traceability.", a: "Head of Logistics, Auto OEM" },
    { q: "Emergency reroute during the Mundra congestion event saved us seven days of demurrage.", a: "VP Supply Chain, FMCG Major" },
  ];
  return (
    <section className="border-b border-border/60 bg-surface/30 py-20">
      <div className="mx-auto max-w-[1400px] px-6">
        <SectionLabel eyebrow="Customers" title="Operators trust the network." />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {items.map((t, i) => (
            <figure key={i} className="rounded-xl glass p-6">
              <blockquote className="text-[15px] leading-relaxed text-foreground/90">"{t.q}"</blockquote>
              <figcaption className="mt-5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">— {t.a}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const items = [
    { q: "Does RailFlow integrate with FOIS and existing TMS?", a: "Yes. Connectors for FOIS, SAP TM, Oracle OTM, and custom REST APIs ship out of the box." },
    { q: "How accurate is the AI optimization?", a: "On benchmark corridors we average 94% confidence with realized savings within ±6% of forecast." },
    { q: "Is hardware required?", a: "No. The platform runs on existing data feeds. ESP32 edge nodes unlock real-time cargo telemetry and theft detection." },
    { q: "How is data secured?", a: "End-to-end TLS, tenant isolation, role-based access, audit trails, and ISO 27001 controls." },
  ];
  return (
    <section className="border-b border-border/60 py-20">
      <div className="mx-auto max-w-3xl px-6">
        <SectionLabel eyebrow="FAQ" title="Frequently asked" />
        <div className="mt-8 divide-y divide-border/60 rounded-xl border border-border/60 bg-surface/40">
          {items.map((it, i) => <FaqItem key={i} q={it.q} a={it.a} />)}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen((v) => !v)} className="block w-full px-5 py-4 text-left">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium">{q}</span>
        <ChevronDown className={"size-4 text-muted-foreground transition " + (open ? "rotate-180 text-primary" : "")} />
      </div>
      {open ? <p className="mt-3 text-sm text-muted-foreground">{a}</p> : null}
    </button>
  );
}

function CtaBand() {
  return (
    <section className="border-b border-border/60 py-20">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="relative overflow-hidden rounded-2xl glass-strong p-10 sm:p-14">
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 size-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative grid items-center gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h3 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Ready to orchestrate India's freight corridor?
              </h3>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Spin up a sandbox tenant with simulated data, or talk to our team about a corridor pilot on the
                Western or Eastern DFC.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground glow-primary">
                Launch Platform <ArrowRight className="size-4" />
              </Link>
              <button className="inline-flex items-center gap-2 rounded-md border border-border bg-surface/60 px-5 py-3 text-sm font-medium hover:border-primary/40">
                Request Pilot
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionLabel({ eyebrow, title, align = "center" }: { eyebrow: string; title: string; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <div className={"font-mono text-[10px] uppercase tracking-widest text-primary " + (align === "center" ? "" : "")}>{eyebrow}</div>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
    </div>
  );
}
