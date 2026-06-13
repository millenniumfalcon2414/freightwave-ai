import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-md bg-primary/15 ring-1 ring-primary/40">
            <Activity className="size-4 text-primary" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-semibold tracking-tight">RailFlow<span className="text-primary">.AI</span></span>
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Bharat Logistics OS</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <Link to="/" activeOptions={{ exact: true }} className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Platform</Link>
          <a href="/#features" className="hover:text-foreground">Features</a>
          <a href="/#network" className="hover:text-foreground">Network</a>
          <a href="/#hardware" className="hover:text-foreground">Hardware</a>
          <Link to="/dashboard" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Dashboard</Link>
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:inline-flex">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
            </span>
            Live
          </span>
          <Link
            to="/dashboard"
            className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:brightness-110 glow-primary"
          >
            Launch Platform
          </Link>
        </div>
      </div>
    </header>
  );
}
