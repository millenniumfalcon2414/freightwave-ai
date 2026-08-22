import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, Layers, MapPin, TrendingUp, Bot, Plus, Search, Train } from "lucide-react";

export function SiteNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl shadow-xs">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm">
            <Activity className="size-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-foreground">
                RailFlow<span className="text-primary">.AI</span>
              </span>
              <span className="rounded-md bg-accent/15 px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase tracking-wider text-accent">
                Logistics OS
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Bharat Multimodal Freight Platform
            </span>
          </div>
        </Link>

        {/* Navigation Tabs (Humanized like Amazon/Flipkart Seller Hub) */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-muted-foreground">
          <Link
            to="/cargo-portal"
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition ${
              currentPath === "/cargo-portal"
                ? "bg-blue-600 text-white shadow-xs font-bold"
                : "bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 font-bold border border-blue-500/20"
            }`}
          >
            <Train className="size-3.5" />
            <span>Cargo Owner Tracking Portal</span>
          </Link>
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition ${
              currentPath === "/dashboard"
                ? "bg-surface-2 text-foreground shadow-xs font-bold text-primary"
                : "hover:bg-surface hover:text-foreground"
            }`}
          >
            <Layers className="size-3.5" />
            Consignments & Operations
          </Link>
          <Link
            to="/"
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition ${
              currentPath === "/"
                ? "bg-surface-2 text-foreground shadow-xs"
                : "hover:bg-surface hover:text-foreground"
            }`}
          >
            Platform Overview
          </Link>
          <a
            href="/#network"
            className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 hover:bg-surface hover:text-foreground transition"
          >
            <MapPin className="size-3.5" />
            Corridor Network
          </a>
          <a
            href="/#features"
            className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 hover:bg-surface hover:text-foreground transition"
          >
            <TrendingUp className="size-3.5" />
            Cost & Green ROI
          </a>
        </nav>

        {/* Right action cluster */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/cargo-portal"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition"
          >
            <Search className="size-3.5 text-blue-600" />
            <span>Track Consignment</span>
          </Link>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-md transition hover:brightness-110 active:scale-98"
          >
            <Plus className="size-3.5 stroke-[2.5]" />
            <span>Command Hub</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
