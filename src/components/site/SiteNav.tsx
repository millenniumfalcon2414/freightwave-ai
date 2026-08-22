import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  Layers,
  MapPin,
  TrendingUp,
  Bot,
  Plus,
  Search,
  Train,
  ArrowLeft,
  ChevronLeft,
  SlidersHorizontal,
  UserPlus,
  LogIn,
  LogOut,
  User,
  Building2,
  Truck,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { useAuth, DEMO_PERSONAS } from "@/lib/auth/authStore";
import { UserRole } from "@/types/auth";

export function SiteNav() {
  const routerState = useRouterState();
  const router = useRouter();
  const currentPath = routerState.location.pathname;
  const isNotHome = currentPath !== "/";

  const { user, isAuthenticated, switchPersona, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      router.navigate({ to: "/" });
    }
  };

  const handleSwitchPersona = (role: UserRole) => {
    switchPersona(role);
    setProfileDropdownOpen(false);
    if (role === "cargo_owner") {
      router.navigate({ to: "/cargo-portal" });
    } else {
      router.navigate({ to: `/dashboard?role=${role}` as "/" });
    }
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    router.navigate({ to: "/" });
  };

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case "cargo_owner":
        return <Building2 className="size-3.5" />;
      case "fleet_operator":
        return <Truck className="size-3.5" />;
      case "train_operator":
        return <Train className="size-3.5" />;
      case "safety_inspector":
        return <ShieldCheck className="size-3.5" />;
      default:
        return <Sparkles className="size-3.5" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl shadow-xs">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6">
        {/* Left: Back Button + Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isNotHome && (
            <button
              onClick={handleBack}
              title="Go back to previous page"
              className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-surface/90 px-2.5 py-1.5 text-xs font-semibold text-foreground/80 hover:bg-surface-2 hover:text-foreground hover:border-primary/40 transition shadow-xs active:scale-95"
            >
              <ArrowLeft className="size-3.5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 via-primary to-accent text-primary-foreground shadow-sm">
              <Activity className="size-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-foreground">
                  FreightWave<span className="text-primary">.AI</span>
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
        </div>

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
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* User Profile / Auth Button */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-border/80 bg-surface/90 hover:bg-surface-2 px-2.5 py-1.5 text-xs font-semibold text-foreground transition shadow-xs"
              >
                <div className="flex size-6 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-[11px] shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-none">
                  <span className="font-bold text-foreground text-xs truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-primary font-medium">{user.roleTitle}</span>
                </div>
                <ChevronDown className="size-3 text-muted-foreground" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-border bg-surface p-3 shadow-2xl z-50 text-xs space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="border-b border-border/60 pb-2.5 space-y-1">
                    <div className="font-bold text-foreground text-sm flex items-center justify-between">
                      <span>{user.name}</span>
                      <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold uppercase">
                        {user.authProvider === "google" ? "Google Auth" : "Enterprise ID"}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono truncate">
                      {user.email}
                    </div>
                    <div className="text-[10px] text-foreground font-semibold flex items-center gap-1 pt-0.5">
                      <Building2 className="size-3 text-primary" />
                      <span className="truncate">{user.company}</span>
                    </div>
                  </div>

                  {/* Open specific role dashboard */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Active Workspace
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        if (user.role === "cargo_owner") {
                          router.navigate({ to: "/cargo-portal" });
                        } else {
                          router.navigate({
                            to: `/dashboard?role=${user.role}` as "/",
                          });
                        }
                      }}
                      className="w-full flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/30 p-2 text-primary font-bold hover:bg-primary/20 transition text-left"
                    >
                      <LayoutDashboard className="size-4 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs">Open {user.roleTitle} Dashboard</div>
                        <div className="text-[10px] text-muted-foreground font-normal">
                          {user.role === "cargo_owner" ? "/cargo-portal" : "/dashboard"}
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Switch Persona / Role */}
                  <div className="space-y-1 pt-1 border-t border-border/60">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Switch Role Dashboard
                    </div>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {DEMO_PERSONAS.map((p) => {
                        const isActive = user.role === p.role;
                        return (
                          <button
                            key={p.role}
                            type="button"
                            onClick={() => handleSwitchPersona(p.role)}
                            className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left transition text-[11px] ${
                              isActive
                                ? "bg-primary text-white font-bold"
                                : "hover:bg-surface-2 text-foreground"
                            }`}
                          >
                            <span className="truncate">{p.title}</span>
                            {isActive && <span className="text-[9px] font-mono">ACTIVE</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                    <Link
                      to="/login"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      Login Switch
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-600 font-semibold"
                    >
                      <LogOut className="size-3" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                currentPath === "/login"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "border-border/80 bg-surface/90 text-foreground hover:bg-surface-2 hover:border-primary/40"
              }`}
            >
              <LogIn className="size-3.5 text-primary" />
              <span>Sign In</span>
            </Link>
          )}

          <Link
            to="/signup"
            className={`hidden md:inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              currentPath === "/signup"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "border-border/80 bg-surface/90 text-foreground hover:bg-surface-2 hover:border-primary/40"
            }`}
          >
            <UserPlus className="size-3.5 text-primary" />
            <span>Sign Up</span>
          </Link>

          <Link
            to="/cargo-portal"
            className="hidden lg:inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition"
          >
            <Search className="size-3.5 text-blue-600" />
            <span>Track</span>
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
