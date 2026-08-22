import React, { useState } from "react";
import {
  Check,
  Shield,
  Globe,
  Building2,
  Truck,
  Train,
  ShieldCheck,
  Sparkles,
  X,
  ChevronRight,
} from "lucide-react";
import { UserRole } from "@/types/auth";

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: { name: string; email: string; picture?: string; role: UserRole }) => void;
  defaultEmail?: string;
}

export function GoogleAuthModal({
  isOpen,
  onClose,
  onSuccess,
  defaultEmail,
}: GoogleAuthModalProps) {
  const [selectedAccountIndex, setSelectedAccountIndex] = useState<number>(0);
  const [selectedRole, setSelectedRole] = useState<UserRole>("cargo_owner");
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const accounts = [
    {
      name: "Praghna D. R.",
      email: defaultEmail || "praghnadr001@gmail.com",
      avatarBg: "bg-blue-600",
      letter: "P",
      roleDesc: "Primary Google Account (AI Studio / Workspace)",
    },
    {
      name: "Logistics Supply Head",
      email: "logistics.enterprise@gmail.com",
      avatarBg: "bg-emerald-600",
      letter: "L",
      roleDesc: "Enterprise Multimodal Shipper ID",
    },
  ];

  const roles: {
    id: UserRole;
    title: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    targetDashboard: string;
  }[] = [
    {
      id: "cargo_owner",
      title: "Cargo Owner / Industrial Consignor",
      desc: "Live GPS train wagons, goods status, e-Way bills, sensor telemetry & e-RR documents.",
      icon: Building2,
      targetDashboard: "Cargo Owner Portal (/cargo-portal)",
    },
    {
      id: "fleet_operator",
      title: "3PL & Road Fleet Carrier",
      desc: "FASTag toll logs, Sarathi driver telemetry, highway truck haulers & yard drayage.",
      icon: Truck,
      targetDashboard: "Road Fleet Dispatch (/dashboard)",
    },
    {
      id: "train_operator",
      title: "Container Train Operator (CTO)",
      desc: "DFC electric rake scheduling, wagon formation, siding allocations & FOIS clearance.",
      icon: Train,
      targetDashboard: "Railway Rake Command (/dashboard)",
    },
    {
      id: "safety_inspector",
      title: "RDSO Safety & QA Inspector",
      desc: "Wagon seal checks, brake fitness signoff, sensor calibration & safety certificates.",
      icon: ShieldCheck,
      targetDashboard: "RDSO QA Console (/dashboard)",
    },
    {
      id: "multimodal_planner",
      title: "Multimodal Dispatcher",
      desc: "AI modal-split optimizer, corridor congestion digital twin & emergency incident console.",
      icon: Sparkles,
      targetDashboard: "AI Command Hub (/dashboard)",
    },
  ];

  const handleContinue = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      let chosenName = accounts[selectedAccountIndex].name;
      let chosenEmail = accounts[selectedAccountIndex].email;

      if (showAddAccount && customEmail) {
        chosenEmail = customEmail;
        chosenName = customName || customEmail.split("@")[0];
      }

      setIsAuthenticating(false);
      onSuccess({
        name: chosenName,
        email: chosenEmail,
        role: selectedRole,
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-2xl space-y-5 text-foreground">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground transition"
          title="Close dialog"
        >
          <X className="size-4" />
        </button>

        {/* Google Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-surface shadow-xs border border-border/80 mx-auto">
            {/* Google G SVG */}
            <svg className="size-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Sign in with Google</h2>
          <p className="text-xs text-muted-foreground">
            to continue to{" "}
            <strong className="text-foreground">FreightWave AI Command Network</strong>
          </p>
        </div>

        {/* Account Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Choose an account
          </label>
          <div className="space-y-1.5">
            {accounts.map((acc, idx) => {
              const isSelected = selectedAccountIndex === idx && !showAddAccount;
              return (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setSelectedAccountIndex(idx);
                    setShowAddAccount(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition text-left ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border/80 bg-surface-2/60 hover:bg-surface-2 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid size-9 place-items-center rounded-full text-white font-bold text-sm ${acc.avatarBg}`}
                    >
                      {acc.letter}
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-foreground">{acc.name}</div>
                      <div className="text-muted-foreground font-mono text-[11px]">{acc.email}</div>
                      <div className="text-[10px] text-primary">{acc.roleDesc}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="size-4 text-primary font-bold" />}
                </button>
              );
            })}

            {/* Custom Google Account Option */}
            {showAddAccount ? (
              <div className="p-3.5 rounded-xl border border-primary/40 bg-primary/5 space-y-2 text-xs">
                <div className="font-bold text-foreground">Use another Google account</div>
                <input
                  type="email"
                  placeholder="name@gmail.com or Workspace ID"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Officer / User Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-primary"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddAccount(true)}
                className="w-full text-left text-xs font-bold text-primary hover:underline px-2 py-1"
              >
                + Use another Google account
              </button>
            )}
          </div>
        </div>

        {/* Dashboard Persona Selection */}
        <div className="space-y-2 pt-1 border-t border-border/70">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Select Destination Dashboard & Role
            </label>
            <span className="text-[10px] text-primary font-medium">Automatic role routing</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 max-h-48 overflow-y-auto pr-1">
            {roles.map((r) => {
              const isSelected = selectedRole === r.id;
              const IconComp = r.icon;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRole(r.id)}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1 ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border/70 bg-surface-2/40 hover:bg-surface-2"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`grid size-6 place-items-center rounded-md ${
                        isSelected ? "bg-primary text-white" : "bg-surface text-foreground"
                      }`}
                    >
                      <IconComp className="size-3.5" />
                    </div>
                    <span className="text-xs font-bold text-foreground leading-tight truncate">
                      {r.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{r.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Permissions & DPDP Consent */}
        <div className="rounded-xl border border-border/70 bg-surface-2/50 p-2.5 text-[11px] text-muted-foreground flex items-center gap-2">
          <Shield className="size-4 text-emerald-600 shrink-0" />
          <span>
            Google OAuth 2.0 verified. FreightWave AI will access your basic profile & email for
            logistics dispatch credentials.
          </span>
        </div>

        {/* Submit & Cancel Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/80">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-2 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isAuthenticating}
            onClick={handleContinue}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:brightness-110 active:scale-98 transition disabled:opacity-50"
          >
            {isAuthenticating ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In & Open Dashboard</span>
                <ChevronRight className="size-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
