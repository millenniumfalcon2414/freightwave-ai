import { useState } from "react";
import {
  Settings2,
  Play,
  Pause,
  RotateCcw,
  Zap,
  AlertTriangle,
  ChevronRight,
  X,
  FlaskConical,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useSim, simStore } from "@/lib/simulation/useSim";
import type { Params, Severity } from "@/lib/simulation/engine";

export function SimControlPanel() {
  const [open, setOpen] = useState(false);
  const params = useSim((s) => s.params);
  const tickCount = useSim((s) => s.tickCount);

  const set = <K extends keyof Params>(k: K, v: Params[K]) => simStore.setParam(k, v);

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed right-4 top-20 z-40 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/80 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-primary shadow-lg backdrop-blur transition hover:border-primary hover:bg-primary/10"
        aria-label="Open simulation controls"
      >
        <Settings2 className="size-3.5" />
        Sim Controls
        <span
          className={
            "size-1.5 rounded-full " +
            (params.running ? "bg-success animate-pulse" : "bg-muted-foreground")
          }
        />
      </button>

      {/* Drawer */}
      <aside
        className={
          "fixed right-0 top-0 z-50 flex h-full w-[360px] max-w-[92vw] flex-col border-l border-border bg-background/95 backdrop-blur-xl transition-transform duration-300 " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-primary">
              Live Simulation
            </div>
            <h2 className="mt-0.5 text-base font-semibold">Network Control</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="grid size-8 place-items-center rounded-md hover:bg-surface"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Engine */}
          <Section title="Engine" subtitle={`tick #${tickCount}`}>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={params.running ? "secondary" : "default"}
                className="flex-1"
                onClick={() => set("running", !params.running)}
              >
                {params.running ? (
                  <>
                    <Pause className="mr-1.5 size-3.5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-1.5 size-3.5" /> Run
                  </>
                )}
              </Button>
              <Button size="sm" variant="outline" onClick={() => simStore.step()}>
                Step
              </Button>
              <Button size="sm" variant="outline" onClick={() => simStore.reseed()} title="Reseed">
                <RotateCcw className="size-3.5" />
              </Button>
            </div>
            <SliderRow
              label="Tick speed"
              value={params.tickMs}
              suffix="ms"
              min={250}
              max={5000}
              step={250}
              onChange={(v) => set("tickMs", v)}
              invertColor
            />
          </Section>

          <Section title="Network demand">
            <SliderRow
              label="Demand multiplier"
              value={params.demandMultiplier}
              min={0.5}
              max={2}
              step={0.05}
              format={(v) => `${v.toFixed(2)}×`}
              onChange={(v) => set("demandMultiplier", v)}
            />
            <SliderRow
              label="Fleet size"
              value={params.fleetSize}
              min={200}
              max={3000}
              step={50}
              onChange={(v) => set("fleetSize", v)}
            />
            <SliderRow
              label="Fuel price index"
              value={params.fuelPriceIndex}
              min={80}
              max={160}
              step={1}
              format={(v) => `₹${v.toFixed(0)}`}
              onChange={(v) => set("fuelPriceIndex", v)}
            />
          </Section>

          <Section title="AI policy">
            <SliderRow
              label="Rail share target"
              value={params.railShareTarget}
              suffix="%"
              min={30}
              max={85}
              step={1}
              onChange={(v) => set("railShareTarget", v)}
            />
            <SliderRow
              label="AI aggressiveness"
              value={params.aiAggressiveness}
              suffix="%"
              min={0}
              max={100}
              step={1}
              onChange={(v) => set("aiAggressiveness", v)}
            />
            <SliderRow
              label="Carbon focus"
              value={params.carbonFocus}
              suffix="%"
              min={0}
              max={100}
              step={1}
              onChange={(v) => set("carbonFocus", v)}
            />
          </Section>

          <Section title="External stressors">
            <SliderRow
              label="Weather severity"
              value={params.weatherSeverity}
              suffix="%"
              min={0}
              max={100}
              step={1}
              onChange={(v) => set("weatherSeverity", v)}
            />
            <SliderRow
              label="Disruption level"
              value={params.disruptionLevel}
              suffix="%"
              min={0}
              max={100}
              step={1}
              onChange={(v) => set("disruptionLevel", v)}
            />
            <ToggleRow
              label="Emergency mode"
              checked={params.emergencyMode}
              onChange={(v) => set("emergencyMode", v)}
            />
          </Section>

          <Section title="Inject events">
            <div className="grid grid-cols-2 gap-2">
              {(["critical", "high", "med", "low"] as Severity[]).map((sev) => (
                <Button
                  key={sev}
                  size="sm"
                  variant="outline"
                  className="font-mono text-[10px] uppercase tracking-widest"
                  onClick={() => simStore.injectAlert(sev)}
                >
                  {sev === "critical" || sev === "high" ? (
                    <AlertTriangle className="mr-1 size-3" />
                  ) : (
                    <Zap className="mr-1 size-3" />
                  )}
                  {sev}
                </Button>
              ))}
            </div>
          </Section>

          <Section title="Scenarios">
            <div className="grid grid-cols-2 gap-2">
              <PresetButton
                label="Monsoon"
                onClick={() =>
                  applyPreset({ weatherSeverity: 78, disruptionLevel: 60, demandMultiplier: 0.85 })
                }
              />
              <PresetButton
                label="DFC peak"
                onClick={() =>
                  applyPreset({
                    demandMultiplier: 1.7,
                    railShareTarget: 78,
                    aiAggressiveness: 90,
                    weatherSeverity: 10,
                  })
                }
              />
              <PresetButton
                label="Fuel shock"
                onClick={() =>
                  applyPreset({ fuelPriceIndex: 152, railShareTarget: 75, carbonFocus: 85 })
                }
              />
              <PresetButton
                label="Crisis"
                onClick={() =>
                  applyPreset({
                    disruptionLevel: 92,
                    weatherSeverity: 70,
                    emergencyMode: true,
                    aiAggressiveness: 95,
                  })
                }
              />
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="mt-2 w-full text-xs"
              onClick={() => simStore.resetParams()}
            >
              <FlaskConical className="mr-1.5 size-3.5" /> Reset to baseline
            </Button>
          </Section>
        </div>

        <footer className="border-t border-border px-5 py-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            Synthetic feed · client tick · resets on refresh
          </p>
        </footer>
      </aside>

      {/* Backdrop */}
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function applyPreset(p: Partial<Params>) {
  for (const k of Object.keys(p) as (keyof Params)[]) {
    simStore.setParam(k, p[k] as never);
  }
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="mb-2.5 flex items-end justify-between">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {title}
        </h3>
        {subtitle ? (
          <span className="font-mono text-[10px] text-muted-foreground/70">{subtitle}</span>
        ) : null}
      </header>
      <div className="space-y-3 rounded-lg border border-border bg-surface/40 p-3">{children}</div>
    </section>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  suffix,
  format,
  onChange,
  invertColor,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  format?: (v: number) => string;
  onChange: (v: number) => void;
  invertColor?: boolean;
}) {
  const display = format ? format(value) : `${value}${suffix ?? ""}`;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs text-foreground/80">{label}</span>
        <span className={"font-mono text-xs " + (invertColor ? "text-accent" : "text-primary")}>
          {display}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-foreground/80">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function PresetButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-xs transition hover:border-primary/50 hover:bg-primary/5"
    >
      <span>{label}</span>
      <ChevronRight className="size-3 text-muted-foreground transition group-hover:text-primary" />
    </button>
  );
}
