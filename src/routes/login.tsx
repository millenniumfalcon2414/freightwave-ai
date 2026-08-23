import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  Truck,
  Train,
  CheckCircle2,
  Sparkles,
  Zap,
  Globe,
  Layers,
  KeyRound,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  UserCheck,
  Fingerprint,
} from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { GoogleAuthModal } from "@/components/auth/GoogleAuthModal";
import { authStore, DEMO_PERSONAS } from "@/lib/auth/authStore";
import { UserRole } from "@/types/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In · FreightWave AI Multimodal Logistics Hub" },
      {
        name: "description",
        content:
          "Sign in to FreightWave AI via Google or corporate credentials to access your individual multimodal logistics, rake scheduling, cargo tracking, or fleet dispatch dashboards.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("rajesh.sengupta@tata-steel.in");
  const [password, setPassword] = useState("EnterpriseRail#2026");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>("cargo_owner");

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtpCode, setForgotOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Credentials Login
  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please provide a valid corporate email or user ID.");
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user = authStore.loginWithCredentials(email, password, selectedRole);
      showToast(`Welcome back, ${user.name}! Directing to ${user.roleTitle} Dashboard...`);

      if (user.role === "cargo_owner") {
        navigate({ to: "/cargo-portal" });
      } else {
        navigate({ to: `/dashboard?role=${user.role}` as "/" });
      }
    }, 700);
  };

  // Handle Google Login Success
  const handleGoogleSuccess = (profile: {
    name: string;
    email: string;
    picture?: string;
    role: UserRole;
  }) => {
    setIsGoogleModalOpen(false);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const user = authStore.loginWithGoogle(profile);
      showToast(`Signed in as ${user.name} via Google! Directing to individual dashboard...`);

      if (user.role === "cargo_owner") {
        navigate({ to: "/cargo-portal" });
      } else {
        navigate({ to: `/dashboard?role=${user.role}` as "/" });
      }
    }, 600);
  };

  // Fast Quick-Login as a Persona
  const handleQuickPersonaLogin = (role: UserRole) => {
    setIsLoading(true);
    const persona = DEMO_PERSONAS.find((p) => p.role === role)!;
    setEmail(persona.email);
    setPassword("EnterpriseRail#2026");
    setSelectedRole(role);

    setTimeout(() => {
      setIsLoading(false);
      const user = authStore.loginWithCredentials(persona.email, "EnterpriseRail#2026", role);
      showToast(`Authenticated as ${user.name} (${user.roleTitle})`);

      if (user.role === "cargo_owner") {
        navigate({ to: "/cargo-portal" });
      } else {
        navigate({ to: `/dashboard?role=${user.role}` as "/" });
      }
    }, 500);
  };

  // Handle Forgot Password submission
  const handleSendForgotOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotOtpSent(true);
    showToast("Recovery OTP sent to " + forgotEmail + ". Use demo code: 582910");
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotPassword(false);
      setForgotSuccess(false);
      setForgotOtpSent(false);
      setPassword("NewSecure#2026");
      showToast("Password reset successfully! You can now sign in.");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col justify-between">
      <SiteNav />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-primary/40 bg-surface/95 px-4 py-3 text-xs font-semibold text-foreground shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="size-4 text-primary shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
        defaultEmail="praghnadr001@gmail.com"
      />

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-lg bg-blue-500/10 text-blue-600">
                  <KeyRound className="size-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Reset Master Password</h3>
                  <p className="text-[11px] text-muted-foreground">
                    National Logistics Network Auth
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {!forgotSuccess ? (
              !forgotOtpSent ? (
                <form onSubmit={handleSendForgotOtp} className="space-y-3 text-xs">
                  <p className="text-muted-foreground">
                    Enter your registered corporate email or Sarathi ID to receive a secure recovery
                    OTP.
                  </p>
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Corporate Email</label>
                    <input
                      type="email"
                      required
                      placeholder="officer@company.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-primary py-2 font-bold text-white hover:brightness-110 shadow-xs"
                  >
                    Send Recovery OTP
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-2.5 text-[11px] text-blue-700 dark:text-blue-300">
                    OTP sent! (Demo code: <strong>582910</strong>)
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="582910"
                      value={forgotOtpCode}
                      onChange={(e) => setForgotOtpCode(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-center font-mono text-base font-bold tracking-widest focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">New Master Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-emerald-600 py-2 font-bold text-white hover:brightness-110 shadow-xs"
                  >
                    Update Password & Save
                  </button>
                </form>
              )
            ) : (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="size-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm text-foreground">Password Successfully Updated</h4>
                <p className="text-xs text-muted-foreground">Redirecting back to login screen...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:py-12 flex-1 flex flex-col justify-center">
        <div className="grid gap-10 lg:grid-cols-12 max-w-6xl mx-auto w-full items-start">
          {/* Left Column: Sign-in Form & Google Auth (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-border/80 bg-surface p-6 sm:p-8 shadow-sm space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  <ShieldCheck className="size-3.5" />
                  <span>Secure Enterprise Access · ULIP & FOIS Integrated</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Sign In to FreightWave AI
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Log in to access your customized role dashboard, live rail & road telematics, and
                  multimodal route optimization.
                </p>
              </div>

              {/* Primary Google Sign-In Button */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setIsGoogleModalOpen(true)}
                  className="w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-surface-2/80 hover:bg-surface-2 p-3 text-xs sm:text-sm font-bold text-foreground shadow-xs transition hover:border-primary/50 active:scale-99"
                >
                  {/* Google SVG Icon */}
                  <svg className="size-5 shrink-0" viewBox="0 0 24 24">
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
                  <span>Continue with Google Workspace</span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-border" />
                  <span className="absolute bg-surface px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Or sign in with credentials
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Credentials Form */}
              <form onSubmit={handleCredentialsLogin} className="space-y-4">
                {/* Email / User ID */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">
                    Corporate Email or Registered Officer ID{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      placeholder="officer@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background pl-9 pr-9 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Target Role Selector */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-foreground">
                    Target Role & Dashboard Allocation
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-primary"
                  >
                    <option value="cargo_owner">
                      🏢 Cargo Owner / Consignor → Dedicated Cargo Portal (/cargo-portal)
                    </option>
                    <option value="fleet_operator">
                      🚛 3PL Road Carrier → Fleet Drayage & FASTag Hub (/dashboard)
                    </option>
                    <option value="train_operator">
                      🚆 Container Train Operator (CTO) → Rake Dispatch (/dashboard)
                    </option>
                    <option value="safety_inspector">
                      🛡️ RDSO Safety Inspector → QA & Inspection Console (/dashboard)
                    </option>
                    <option value="multimodal_planner">
                      ⚡ Central Multimodal Planner → AI Optimizer Hub (/dashboard)
                    </option>
                  </select>
                </div>

                {/* Remember Me & SSO */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="size-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-muted-foreground">Remember this terminal</span>
                  </label>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="size-3.5" />
                    <span>256-bit TLS Encrypted</span>
                  </span>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-md hover:brightness-110 active:scale-98 transition disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In & Enter Dashboard</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Registration Link */}
              <div className="pt-2 border-t border-border/80 text-center text-xs text-muted-foreground">
                Don't have an enterprise account yet?{" "}
                <Link
                  to="/signup"
                  className="font-bold text-primary hover:underline underline-offset-2"
                >
                  Register your Enterprise here →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: One-Click Demo Personas & Individual Dashboards (5 Columns) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Instant Demo Access
                  </h3>
                  <p className="text-xs font-bold text-foreground">
                    One-Click Entry to Individual Dashboards
                  </p>
                </div>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                  5 Roles
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                Click any role to auto-fill credentials and immediately launch into their
                specialized logistics dashboard:
              </p>

              <div className="space-y-2.5">
                {DEMO_PERSONAS.map((p) => {
                  const IconComp =
                    p.role === "cargo_owner"
                      ? Building2
                      : p.role === "fleet_operator"
                        ? Truck
                        : p.role === "train_operator"
                          ? Train
                          : p.role === "safety_inspector"
                            ? ShieldCheck
                            : Sparkles;

                  return (
                    <button
                      key={p.role}
                      type="button"
                      onClick={() => handleQuickPersonaLogin(p.role)}
                      className="w-full text-left p-3 rounded-xl border border-border/70 bg-surface-2/40 hover:bg-surface-2 hover:border-primary/50 transition group flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`grid size-7 place-items-center rounded-lg text-white font-bold text-xs bg-gradient-to-br ${p.avatarBg}`}
                          >
                            <IconComp className="size-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-foreground group-hover:text-primary transition flex items-center gap-1.5">
                              <span>{p.title}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground font-medium">
                              {p.subtitle}
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold bg-surface border border-border px-2 py-0.5 rounded-md text-foreground group-hover:border-primary group-hover:text-primary transition shrink-0">
                          Enter →
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40 font-mono">
                        <span>
                          {p.sampleStats.label1}: <strong>{p.sampleStats.val1}</strong>
                        </span>
                        <span>
                          {p.sampleStats.label2}: <strong>{p.sampleStats.val2}</strong>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Compliance Guarantee */}
            <div className="rounded-2xl border border-border/80 bg-surface p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Globe className="size-4 text-blue-600" />
                <span>Inter-Agency National Logistics Gateway</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                FreightWave AI synchronizes data with Indian Railways (FOIS / CRIS), National
                Logistics Portal (ULIP), GSTN e-Way Bills, and Sarathi Driver Licensing.
              </p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
