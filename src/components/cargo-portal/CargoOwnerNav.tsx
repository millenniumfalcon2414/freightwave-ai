import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Train,
  Package,
  Search,
  FileText,
  Bell,
  HelpCircle,
  User,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Building2,
  Phone,
  Sparkles,
} from "lucide-react";
import { UserProfile } from "@/types/cargo-portal";

interface CargoOwnerNavProps {
  activeTab: "dashboard" | "shipments" | "documents" | "condition" | "alerts";
  setActiveTab: (tab: "dashboard" | "shipments" | "documents" | "condition" | "alerts") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSubmit: (e?: React.FormEvent) => void;
  unreadAlertsCount: number;
  userProfile: UserProfile;
  onOpenHelp: () => void;
  onOpenProfile: () => void;
}

export function CargoOwnerNav({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  unreadAlertsCount,
  userProfile,
  onOpenHelp,
  onOpenProfile,
}: CargoOwnerNavProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(e);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-xl shadow-xs">
      {/* Top Banner: Customer Portal Mode Indicator */}
      <div className="border-b border-border/60 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-4 py-1.5 text-xs text-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">
              Customer & Cargo Owner Portal — Indian Railways Freight Operations & Road Logistics
            </span>
            <span className="hidden sm:inline-block rounded-md bg-blue-500/20 px-2 py-0.5 font-mono text-[10px] text-blue-300 border border-blue-400/30">
              Live FOIS & NavIC Sync
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <span className="hidden md:inline-flex items-center gap-1">
              <Building2 className="size-3 text-blue-300" />
              <span>{userProfile.company}</span>
            </span>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1 text-xs font-bold text-cyan-300 hover:text-white transition underline underline-offset-2"
              title="Switch to Logistics OS Admin Command Center"
            >
              <span>Switch to Operations Hub</span>
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand Logo & Platform Name */}
        <div className="flex items-center gap-6 shrink-0">
          <button
            onClick={() => setActiveTab("dashboard")}
            className="flex items-center gap-3 text-left group transition focus:outline-hidden"
          >
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-md group-hover:scale-105 transition-transform">
              <Train className="size-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-foreground">
                  RailFlow<span className="text-blue-600">.Track</span>
                </span>
                <span className="rounded-full bg-blue-500/10 px-2 py-0.2 font-mono text-[9px] font-bold uppercase tracking-wider text-blue-600 border border-blue-500/20">
                  Cargo Portal
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground block -mt-0.5">
                Railway & Roadway Goods Tracking
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 transition ${
                activeTab === "dashboard"
                  ? "bg-blue-600 text-white shadow-sm font-bold"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <Activity className="size-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab("shipments")}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 transition ${
                activeTab === "shipments"
                  ? "bg-blue-600 text-white shadow-sm font-bold"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <Package className="size-3.5" />
              <span>My Shipments ({userProfile.activeShipmentsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab("documents")}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 transition ${
                activeTab === "documents"
                  ? "bg-blue-600 text-white shadow-sm font-bold"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <FileText className="size-3.5" />
              <span>Documents</span>
            </button>

            <button
              onClick={() => setActiveTab("condition")}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 transition ${
                activeTab === "condition"
                  ? "bg-blue-600 text-white shadow-sm font-bold"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <ShieldCheck className="size-3.5" />
              <span>Cargo Condition</span>
            </button>

            <button
              onClick={() => setActiveTab("alerts")}
              className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 transition ${
                activeTab === "alerts"
                  ? "bg-blue-600 text-white shadow-sm font-bold"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              <Bell className="size-3.5" />
              <span>Notifications</span>
              {unreadAlertsCount > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
                  {unreadAlertsCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Central Prominent Quick Search Field */}
        <div className="flex-1 max-w-md hidden md:block">
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Track Cargo: Enter Consignment No. / RAIL-IND-28491"
              className="w-full rounded-xl border border-border bg-surface-2/70 py-2 pl-10 pr-20 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:bg-surface focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow hover:bg-blue-700 transition"
            >
              Track
            </button>
          </form>
        </div>

        {/* Right Cluster: Help & User Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Help & Support */}
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-3 transition"
            title="24/7 Rail Freight Helpline & Support"
          >
            <HelpCircle className="size-3.5 text-blue-600" />
            <span className="hidden sm:inline">Help & Support</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 text-left transition hover:bg-surface-2"
            >
              <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-xs">
                {userProfile.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-foreground leading-tight">
                  {userProfile.name}
                </div>
                <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                  {userProfile.role}
                </div>
              </div>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-border bg-surface p-3 shadow-xl backdrop-blur-md z-50 animate-in fade-in zoom-in-95 space-y-3">
                <div className="border-b border-border/80 pb-2.5">
                  <div className="font-bold text-foreground text-xs">{userProfile.name}</div>
                  <div className="text-[11px] text-muted-foreground">{userProfile.email}</div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-blue-600 font-semibold">
                    <span>GSTIN: {userProfile.gstin}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      onOpenProfile();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left hover:bg-surface-2 text-foreground font-medium transition"
                  >
                    <span>Consignor Account Settings</span>
                    <User className="size-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("shipments");
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left hover:bg-surface-2 text-foreground font-medium transition"
                  >
                    <span>My Cargo Bookings ({userProfile.totalShipments2026})</span>
                    <Package className="size-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => {
                      onOpenHelp();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left hover:bg-surface-2 text-foreground font-medium transition"
                  >
                    <span>Indian Railways FOIS Helpline</span>
                    <Phone className="size-3.5 text-emerald-600" />
                  </button>
                </div>

                <div className="border-t border-border/80 pt-2">
                  <Link
                    to="/dashboard"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-xs font-bold text-foreground hover:bg-surface-3 transition"
                  >
                    <Layers className="size-3.5 text-primary" />
                    <span>Open Logistics OS Console</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Tabs Bar */}
      <div className="flex xl:hidden border-t border-border/60 bg-surface px-2 py-1.5 overflow-x-auto text-xs font-semibold gap-1">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 whitespace-nowrap transition ${
            activeTab === "dashboard"
              ? "bg-blue-600 text-white font-bold"
              : "text-muted-foreground hover:bg-surface-2"
          }`}
        >
          <Activity className="size-3.5" />
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab("shipments")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 whitespace-nowrap transition ${
            activeTab === "shipments"
              ? "bg-blue-600 text-white font-bold"
              : "text-muted-foreground hover:bg-surface-2"
          }`}
        >
          <Package className="size-3.5" />
          <span>My Shipments</span>
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 whitespace-nowrap transition ${
            activeTab === "documents"
              ? "bg-blue-600 text-white font-bold"
              : "text-muted-foreground hover:bg-surface-2"
          }`}
        >
          <FileText className="size-3.5" />
          <span>Documents</span>
        </button>
        <button
          onClick={() => setActiveTab("condition")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 whitespace-nowrap transition ${
            activeTab === "condition"
              ? "bg-blue-600 text-white font-bold"
              : "text-muted-foreground hover:bg-surface-2"
          }`}
        >
          <ShieldCheck className="size-3.5" />
          <span>Condition</span>
        </button>
        <button
          onClick={() => setActiveTab("alerts")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 whitespace-nowrap transition ${
            activeTab === "alerts"
              ? "bg-blue-600 text-white font-bold"
              : "text-muted-foreground hover:bg-surface-2"
          }`}
        >
          <Bell className="size-3.5" />
          <span>Alerts ({unreadAlertsCount})</span>
        </button>
      </div>

      {/* Mobile Search Input */}
      <div className="md:hidden border-t border-border/60 bg-surface-2/70 px-4 py-2">
        <form onSubmit={handleSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Track Cargo ID (e.g. RAIL-IND-28491)..."
            className="w-full rounded-xl border border-border bg-surface py-1.5 pl-9 pr-16 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-bold text-white"
          >
            Track
          </button>
        </form>
      </div>
    </header>
  );
}
