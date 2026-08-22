import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useId } from "react";
import {
  ShieldCheck,
  Building2,
  Train,
  Truck,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  FileText,
  Upload,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Layers,
  MapPin,
  TrendingUp,
  Globe,
  Radio,
  Check,
  KeyRound,
  FileCheck,
  Download,
  ExternalLink,
} from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Enterprise Registration & Sign Up · FreightWave AI" },
      {
        name: "description",
        content:
          "Register your enterprise for FreightWave AI. Seamless onboarding for Cargo Owners, 3PL Fleet Carriers, Container Train Operators (CTO), and Freight Forwarders.",
      },
    ],
  }),
  component: SignUpPage,
});

type AuthMode = "signup" | "signin";
type LogisticsPersona =
  "cargo_owner" | "fleet_operator" | "train_operator" | "port_terminal" | "freight_forwarder";

interface FormData {
  // Step 1: Personal / Account
  fullName: string;
  workEmail: string;
  phone: string;
  otpCode: string;
  isOtpVerified: boolean;
  password: string;
  confirmPassword: string;

  // Step 2: Enterprise Details
  companyName: string;
  businessType: string;
  logisticsPersona: LogisticsPersona;
  gstin: string;
  iecCode: string;
  panNumber: string;
  headquartersCity: string;
  headquartersState: string;

  // Step 3: Operations & Gateways
  monthlyVolume: string;
  primaryCorridors: string[];
  enableUlip: boolean;
  enableFois: boolean;
  enableEwayBill: boolean;
  enableNavicGps: boolean;

  // Step 4: Verification & KYC
  designation: string;
  kycFileName: string | null;
  agreeTerms: boolean;
  agreeDpdp: boolean;
  enableSosAlerts: boolean;
}

const INITIAL_FORM: FormData = {
  fullName: "",
  workEmail: "",
  phone: "",
  otpCode: "",
  isOtpVerified: false,
  password: "",
  confirmPassword: "",

  companyName: "",
  businessType: "Private Limited",
  logisticsPersona: "cargo_owner",
  gstin: "",
  iecCode: "",
  panNumber: "",
  headquartersCity: "Mumbai",
  headquartersState: "Maharashtra",

  monthlyVolume: "5,000 - 25,000 MT",
  primaryCorridors: ["Western Dedicated Freight Corridor (WDFC)", "Golden Quadrilateral Rail Link"],
  enableUlip: true,
  enableFois: true,
  enableEwayBill: true,
  enableNavicGps: true,

  designation: "VP - Supply Chain & Logistics",
  kycFileName: null,
  agreeTerms: false,
  agreeDpdp: true,
  enableSosAlerts: true,
};

const LOGISTICS_PERSONAS = [
  {
    id: "cargo_owner" as LogisticsPersona,
    title: "Cargo Owner / Industrial Shipper",
    desc: "Manufacturing, Steel, Cement, FMCG, Agro, Automotive & Bulk Shippers",
    icon: Building2,
    badge: "Consignor Portal",
  },
  {
    id: "fleet_operator" as LogisticsPersona,
    title: "3PL & Road Fleet Carrier",
    desc: "Intermodal Trucking, Multi-Axle Prime Movers & First/Last-Mile Drayage",
    icon: Truck,
    badge: "Fleet Dispatch",
  },
  {
    id: "train_operator" as LogisticsPersona,
    title: "Private Train Operator / CTO",
    desc: "Container Train Operators, Concessionaires & DFC/IR Block Rake Fleet",
    icon: Train,
    badge: "CTO Licensee",
  },
  {
    id: "port_terminal" as LogisticsPersona,
    title: "Port Terminal & ICD Logistics Agent",
    desc: "JNPT, Mundra, Chennai, CONCOR ICDs, CFS Yards & Coastal Terminals",
    icon: Globe,
    badge: "Terminal Gate",
  },
  {
    id: "freight_forwarder" as LogisticsPersona,
    title: "Freight Forwarder & Customs Broker",
    desc: "Multimodal LCL/FCL Consolidation, CHA, ICEGATE & FOIS Bookings",
    icon: Layers,
    badge: "Multimodal CHA",
  },
];

const MAJOR_CORRIDORS = [
  "Western Dedicated Freight Corridor (WDFC)",
  "Eastern Dedicated Freight Corridor (EDFC)",
  "Delhi–Mumbai Expressway & Multimodal Hub",
  "Golden Quadrilateral Super Rail Link",
  "East Coast Industrial Corridor (Kolkata–Chennai)",
  "Central Transit Link (Nagpur MMLP Cluster)",
];

const GST_STATE_MAP: Record<string, string> = {
  "01": "Jammu & Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "06": "Haryana",
  "07": "Delhi NCR",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "19": "West Bengal",
  "24": "Gujarat",
  "27": "Maharashtra",
  "29": "Karnataka",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "36": "Telangana",
  "37": "Andhra Pradesh",
};

export function SignUpPage() {
  const navigate = useNavigate();
  const formId = useId();

  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP State
  const [otpSending, setOtpSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Sign In State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);

  // Registration Complete State
  const [isCompleted, setIsCompleted] = useState(false);
  const [generatedAccountId, setGeneratedAccountId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passwordScore = getPasswordStrength(formData.password);

  // Detected state from GSTIN
  const detectedGstState =
    formData.gstin.length >= 2 ? GST_STATE_MAP[formData.gstin.slice(0, 2)] : null;

  // Handle OTP send
  const handleSendOtp = () => {
    if (!formData.phone || formData.phone.length < 10) {
      setErrors((prev) => ({
        ...prev,
        phone: "Please enter a valid 10-digit mobile number.",
      }));
      return;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next.phone;
      return next;
    });
    setOtpSending(true);
    setTimeout(() => {
      setOtpSending(false);
      setOtpSent(true);
      setOtpTimer(45);
      showToast("OTP sent to +91 " + formData.phone + ". Use demo code: 749201");
      // Countdown
      const interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 800);
  };

  const handleVerifyOtp = () => {
    if (formData.otpCode === "749201" || formData.otpCode.length === 6) {
      setFormData((prev) => ({ ...prev, isOtpVerified: true }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.otpCode;
        return next;
      });
      showToast("Mobile number verified successfully!");
    } else {
      setErrors((prev) => ({
        ...prev,
        otpCode: "Invalid code. Please enter the 6-digit OTP (Demo code: 749201)",
      }));
    }
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) errs.fullName = "Full name is required.";
      if (!formData.workEmail.trim()) {
        errs.workEmail = "Work email is required.";
      } else if (!formData.workEmail.includes("@") || !formData.workEmail.includes(".")) {
        errs.workEmail = "Please enter a valid business email address.";
      }
      if (!formData.phone.trim() || formData.phone.replace(/\D/g, "").length < 10) {
        errs.phone = "Valid 10-digit phone number is required.";
      }
      if (!formData.password) {
        errs.password = "Password is required.";
      } else if (formData.password.length < 8) {
        errs.password = "Password must be at least 8 characters.";
      }
      if (formData.password !== formData.confirmPassword) {
        errs.confirmPassword = "Passwords do not match.";
      }
    }

    if (step === 2) {
      if (!formData.companyName.trim()) errs.companyName = "Company name is required.";
      if (formData.gstin && formData.gstin.length !== 15) {
        errs.gstin = "GSTIN must be 15 alphanumeric characters (e.g. 27AAACB1234F1Z5).";
      }
      if (formData.panNumber && formData.panNumber.length !== 10) {
        errs.panNumber = "Corporate PAN must be 10 characters (e.g. AAACB1234F).";
      }
    }

    if (step === 4) {
      if (!formData.agreeTerms) {
        errs.agreeTerms = "You must agree to the Master Services Agreement to proceed.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    // Generate simulated FreightWave Account
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const accountId = `FW-IND-${formData.logisticsPersona.toUpperCase().slice(0, 3)}-${randomSuffix}`;
    setGeneratedAccountId(accountId);

    // Save profile to localStorage for seamless cross-portal access
    try {
      const userProfile = {
        id: accountId,
        name: formData.fullName,
        company: formData.companyName || "Bharat Heavy Multimodal Logistics Ltd.",
        email: formData.workEmail,
        phone: "+91 " + formData.phone,
        role:
          LOGISTICS_PERSONAS.find((p) => p.id === formData.logisticsPersona)?.title ||
          "Cargo Owner",
        accountType: "Enterprise Multimodal Platinum",
        gstin: formData.gstin || "27AAACB1234F1Z5",
        activeShipmentsCount: 6,
        totalShipments2026: 124,
      };
      localStorage.setItem("freightwave_user_profile", JSON.stringify(userProfile));
    } catch {
      // Ignore storage errors
    }

    setIsCompleted(true);
  };

  // Sign In Handler
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInLoading(true);
    setTimeout(() => {
      setSignInLoading(false);
      showToast("Signed in successfully! Redirecting to Command Hub...");
      navigate({ to: "/dashboard" });
    }, 900);
  };

  const handleFillDemoUser = (role: "cargo" | "operator" | "forwarder") => {
    if (role === "cargo") {
      setSignInEmail("rajesh.sengupta@tata-steel.in");
      setSignInPassword("EnterpriseRail#2026");
    } else if (role === "operator") {
      setSignInEmail("operations@concor-india.gov.in");
      setSignInPassword("FreightRake#2026");
    } else {
      setSignInEmail("dispatch@vrl-logistics.com");
      setSignInPassword("Multimodal#2026");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col justify-between">
      <SiteNav />

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-primary/40 bg-surface/95 px-4 py-3 text-xs font-semibold text-foreground shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3">
          <Sparkles className="size-4 text-primary shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:py-12 flex-1">
        {/* Top Header Banner */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <ShieldCheck className="size-3.5" />
            <span>National Logistics Portal (ULIP) & FOIS Ready</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            {authMode === "signup"
              ? "Enterprise Onboarding & Account Creation"
              : "Sign In to FreightWave Logistics Command Hub"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {authMode === "signup"
              ? "Join India's leading AI-orchestrated rail and road freight intelligence network. Optimize modal splits, book block trains, and track live consignments."
              : "Access your active freight consignments, Dedicated Freight Corridor rake bookings, and real-time GNSS telematics."}
          </p>

          {/* Auth Switcher */}
          <div className="pt-3 flex justify-center">
            <div className="inline-flex rounded-xl border border-border/80 bg-surface-2 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setIsCompleted(false);
                }}
                className={`rounded-lg px-4 py-2 transition ${
                  authMode === "signup"
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Create Enterprise Account
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("signin")}
                className={`rounded-lg px-4 py-2 transition ${
                  authMode === "signin"
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In to Existing Account
              </button>
            </div>
          </div>
        </div>

        {/* ================= SIGN UP FLOW ================= */}
        {authMode === "signup" && !isCompleted && (
          <div className="grid gap-8 lg:grid-cols-12 max-w-6xl mx-auto">
            {/* Left Col: Step Navigation & Enterprise Value Prop (4 Cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Stepper Card */}
              <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Registration Progress
                </div>

                <div className="space-y-3">
                  {[
                    {
                      step: 1,
                      title: "Account Identity",
                      desc: "Name, Work Email & Mobile OTP",
                    },
                    {
                      step: 2,
                      title: "Enterprise Profile",
                      desc: "GSTIN, Role & Organization Type",
                    },
                    {
                      step: 3,
                      title: "Logistics Gateways",
                      desc: "ULIP, FOIS & Corridor Routing",
                    },
                    {
                      step: 4,
                      title: "KYC & Verification",
                      desc: "Compliance & Agreement",
                    },
                  ].map((s) => {
                    const isDone = currentStep > s.step;
                    const isCurrent = currentStep === s.step;
                    return (
                      <div
                        key={s.step}
                        className={`flex items-start gap-3 p-2.5 rounded-xl border transition ${
                          isCurrent
                            ? "bg-primary/10 border-primary/40 text-foreground"
                            : isDone
                              ? "bg-emerald-500/5 border-emerald-500/20 text-foreground"
                              : "bg-surface-2/40 border-transparent text-muted-foreground opacity-70"
                        }`}
                      >
                        <div
                          className={`grid size-7 shrink-0 place-items-center rounded-lg font-mono text-xs font-bold ${
                            isDone
                              ? "bg-emerald-600 text-white"
                              : isCurrent
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isDone ? <Check className="size-4 stroke-[3]" /> : s.step}
                        </div>
                        <div className="text-xs">
                          <div className="font-bold flex items-center gap-1.5">
                            <span>{s.title}</span>
                            {isCurrent && (
                              <span className="text-[10px] text-primary font-semibold">
                                (Active)
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground leading-tight">
                            {s.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Enterprise Guarantee & Compliance Card */}
              <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Enterprise Infrastructure
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2.5 text-foreground">
                    <div className="grid size-6 place-items-center rounded-md bg-blue-500/10 text-blue-600">
                      <Zap className="size-3.5" />
                    </div>
                    <span>
                      Direct API Link to <strong>ULIP & FOIS Gateways</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-foreground">
                    <div className="grid size-6 place-items-center rounded-md bg-emerald-500/10 text-emerald-600">
                      <TrendingUp className="size-3.5" />
                    </div>
                    <span>
                      Average <strong>38% to 42% Freight Cost Savings</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-foreground">
                    <div className="grid size-6 place-items-center rounded-md bg-amber-500/10 text-amber-600">
                      <ShieldCheck className="size-3.5" />
                    </div>
                    <span>RDSO G-95 Safety & DPDP Act 2023 Compliant</span>
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-surface-2 p-3 text-[11px] text-muted-foreground space-y-1">
                  <div className="font-bold text-foreground">Need Assistance?</div>
                  <p>
                    Enterprise desk is active 24/7 for custom bulk train charters and SLA setup.
                  </p>
                  <div className="font-mono text-primary font-semibold">
                    1800-419-RAIL (Toll Free)
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Multi-step Form Card (8 Cols) */}
            <div className="lg:col-span-8">
              <div className="rounded-2xl border border-border/80 bg-surface p-6 sm:p-8 shadow-sm">
                <form onSubmit={handleFinalSubmit} className="space-y-6">
                  {/* STEP 1: Account Identity */}
                  {currentStep === 1 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-2">
                      <div className="border-b border-border/60 pb-3">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                          <User className="size-5 text-primary" />
                          <span>Primary Officer & Account Credentials</span>
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Enter your professional identity for official dispatch and consignment
                          authorization.
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Full Name */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">
                            Full Name <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                            <input
                              type="text"
                              required
                              placeholder="e.g. Rajeshwar Sengupta"
                              value={formData.fullName}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                              }
                              className={`w-full rounded-xl border bg-background pl-9 pr-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                                errors.fullName ? "border-rose-500" : "border-border"
                              }`}
                            />
                          </div>
                          {errors.fullName && (
                            <div className="text-[11px] text-rose-500 flex items-center gap-1 mt-1">
                              <AlertCircle className="size-3" />
                              <span>{errors.fullName}</span>
                            </div>
                          )}
                        </div>

                        {/* Work Email */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">
                            Corporate Work Email <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                            <input
                              type="email"
                              required
                              placeholder="r.sengupta@company.com"
                              value={formData.workEmail}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, workEmail: e.target.value }))
                              }
                              className={`w-full rounded-xl border bg-background pl-9 pr-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                                errors.workEmail ? "border-rose-500" : "border-border"
                              }`}
                            />
                          </div>
                          {errors.workEmail && (
                            <div className="text-[11px] text-rose-500 flex items-center gap-1 mt-1">
                              <AlertCircle className="size-3" />
                              <span>{errors.workEmail}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Phone & OTP Verification */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground">
                          Mobile Number (SMS / WhatsApp Dispatch Alerts){" "}
                          <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <div className="relative flex-1 min-w-[200px]">
                            <div className="absolute left-3 top-2.5 flex items-center gap-1 text-muted-foreground text-xs font-bold">
                              <span>🇮🇳 +91</span>
                            </div>
                            <input
                              type="tel"
                              maxLength={10}
                              placeholder="98450 19823"
                              value={formData.phone}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  phone: e.target.value.replace(/\D/g, ""),
                                }))
                              }
                              className={`w-full rounded-xl border bg-background pl-16 pr-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                                errors.phone ? "border-rose-500" : "border-border"
                              }`}
                            />
                          </div>

                          {!formData.isOtpVerified ? (
                            <button
                              type="button"
                              disabled={otpSending || otpTimer > 0}
                              onClick={handleSendOtp}
                              className="rounded-xl border border-primary bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-white transition disabled:opacity-50 shrink-0"
                            >
                              {otpSending
                                ? "Sending..."
                                : otpTimer > 0
                                  ? `Resend in ${otpTimer}s`
                                  : otpSent
                                    ? "Resend OTP"
                                    : "Send OTP"}
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-xs font-bold text-emerald-600 shrink-0">
                              <CheckCircle2 className="size-4" />
                              <span>Verified</span>
                            </div>
                          )}
                        </div>
                        {errors.phone && (
                          <div className="text-[11px] text-rose-500 flex items-center gap-1">
                            <AlertCircle className="size-3" />
                            <span>{errors.phone}</span>
                          </div>
                        )}

                        {/* OTP Input field if sent */}
                        {otpSent && !formData.isOtpVerified && (
                          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 space-y-2 mt-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-foreground">
                                Enter 6-Digit OTP Code
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                (Demo OTP:{" "}
                                <strong className="text-primary font-mono">749201</strong>)
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                maxLength={6}
                                placeholder="749201"
                                value={formData.otpCode}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    otpCode: e.target.value.replace(/\D/g, ""),
                                  }))
                                }
                                className="w-44 rounded-xl border border-border bg-background px-3 py-1.5 text-center font-mono text-base font-bold tracking-widest focus:outline-none focus:border-primary"
                              />
                              <button
                                type="button"
                                onClick={handleVerifyOtp}
                                className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:brightness-110 transition"
                              >
                                Verify Code
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    otpCode: "749201",
                                  }));
                                }}
                                className="text-xs text-primary underline underline-offset-2 ml-1"
                              >
                                Auto-Fill Demo
                              </button>
                            </div>
                            {errors.otpCode && (
                              <div className="text-[11px] text-rose-500 flex items-center gap-1">
                                <AlertCircle className="size-3" />
                                <span>{errors.otpCode}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Password Fields */}
                      <div className="grid gap-4 sm:grid-cols-2 pt-2">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">
                            Master Account Password <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              placeholder="••••••••••••"
                              value={formData.password}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, password: e.target.value }))
                              }
                              className={`w-full rounded-xl border bg-background pl-9 pr-9 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                                errors.password ? "border-rose-500" : "border-border"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? (
                                <EyeOff className="size-4" />
                              ) : (
                                <Eye className="size-4" />
                              )}
                            </button>
                          </div>

                          {/* Strength Bar */}
                          {formData.password && (
                            <div className="space-y-1 pt-1">
                              <div className="flex gap-1 h-1.5 w-full">
                                {[1, 2, 3, 4].map((idx) => (
                                  <div
                                    key={idx}
                                    className={`flex-1 rounded-full transition-all ${
                                      passwordScore >= idx
                                        ? idx === 1
                                          ? "bg-rose-500"
                                          : idx === 2
                                            ? "bg-amber-500"
                                            : idx === 3
                                              ? "bg-blue-500"
                                              : "bg-emerald-500"
                                        : "bg-border"
                                    }`}
                                  />
                                ))}
                              </div>
                              <div className="text-[10px] text-muted-foreground flex justify-between">
                                <span>Password strength</span>
                                <span className="font-semibold text-foreground">
                                  {passwordScore <= 1
                                    ? "Weak"
                                    : passwordScore === 2
                                      ? "Fair"
                                      : passwordScore === 3
                                        ? "Good"
                                        : "Strong (Recommended)"}
                                </span>
                              </div>
                            </div>
                          )}

                          {errors.password && (
                            <div className="text-[11px] text-rose-500 flex items-center gap-1">
                              <AlertCircle className="size-3" />
                              <span>{errors.password}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">
                            Confirm Password <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              required
                              placeholder="••••••••••••"
                              value={formData.confirmPassword}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  confirmPassword: e.target.value,
                                }))
                              }
                              className={`w-full rounded-xl border bg-background pl-9 pr-9 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                                errors.confirmPassword ? "border-rose-500" : "border-border"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="size-4" />
                              ) : (
                                <Eye className="size-4" />
                              )}
                            </button>
                          </div>
                          {errors.confirmPassword && (
                            <div className="text-[11px] text-rose-500 flex items-center gap-1">
                              <AlertCircle className="size-3" />
                              <span>{errors.confirmPassword}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Enterprise Details & Persona */}
                  {currentStep === 2 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-2">
                      <div className="border-b border-border/60 pb-3">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                          <Building2 className="size-5 text-primary" />
                          <span>Enterprise Profile & Logistics Persona</span>
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Define your operational role in the Indian freight ecosystem for
                          personalized corridor allocations.
                        </p>
                      </div>

                      {/* Persona Select Grid */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground">
                          Select Your Primary Logistics Role{" "}
                          <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          {LOGISTICS_PERSONAS.map((p) => {
                            const isSelected = formData.logisticsPersona === p.id;
                            const IconComponent = p.icon;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({ ...prev, logisticsPersona: p.id }))
                                }
                                className={`text-left p-3.5 rounded-xl border transition flex flex-col justify-between gap-2 ${
                                  isSelected
                                    ? "bg-primary/10 border-primary shadow-xs ring-1 ring-primary"
                                    : "bg-surface border-border hover:border-primary/40 hover:bg-surface-2"
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`grid size-7 place-items-center rounded-lg ${
                                        isSelected
                                          ? "bg-primary text-white"
                                          : "bg-surface-2 text-foreground"
                                      }`}
                                    >
                                      <IconComponent className="size-4" />
                                    </div>
                                    <span className="text-xs font-bold text-foreground">
                                      {p.title}
                                    </span>
                                  </div>
                                  <span
                                    className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                                      isSelected
                                        ? "bg-primary text-white"
                                        : "bg-surface-2 text-muted-foreground"
                                    }`}
                                  >
                                    {p.badge}
                                  </span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-snug">
                                  {p.desc}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Company Name & Entity Type */}
                      <div className="grid gap-4 sm:grid-cols-2 pt-1">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">
                            Registered Enterprise / Company Name{" "}
                            <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Tata Steel BSL Ltd."
                            value={formData.companyName}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, companyName: e.target.value }))
                            }
                            className={`w-full rounded-xl border bg-background px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                              errors.companyName ? "border-rose-500" : "border-border"
                            }`}
                          />
                          {errors.companyName && (
                            <div className="text-[11px] text-rose-500 flex items-center gap-1">
                              <AlertCircle className="size-3" />
                              <span>{errors.companyName}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">
                            Legal Entity Type
                          </label>
                          <select
                            value={formData.businessType}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, businessType: e.target.value }))
                            }
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-primary"
                          >
                            <option value="Private Limited">Private Limited (Pvt Ltd)</option>
                            <option value="Public Limited">Public Limited (Ltd)</option>
                            <option value="LLP">Limited Liability Partnership (LLP)</option>
                            <option value="Partnership / Proprietorship">
                              Partnership / Proprietorship
                            </option>
                            <option value="Govt PSU / Port Trust">
                              Public Sector Unit (PSU) / Port Trust
                            </option>
                          </select>
                        </div>
                      </div>

                      {/* GSTIN, IEC, PAN Identifiers */}
                      <div className="grid gap-4 sm:grid-cols-3 pt-1">
                        {/* GSTIN */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-foreground">
                              GSTIN Number
                            </label>
                            {detectedGstState && (
                              <span className="text-[10px] text-emerald-600 font-bold">
                                ● {detectedGstState}
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            maxLength={15}
                            placeholder="27AAACB1234F1Z5"
                            value={formData.gstin}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                gstin: e.target.value.toUpperCase(),
                              }))
                            }
                            className={`w-full font-mono rounded-xl border bg-background px-3 py-2 text-xs sm:text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                              errors.gstin ? "border-rose-500" : "border-border"
                            }`}
                          />
                          {errors.gstin && (
                            <div className="text-[10px] text-rose-500 flex items-center gap-1">
                              <AlertCircle className="size-3" />
                              <span>{errors.gstin}</span>
                            </div>
                          )}
                        </div>

                        {/* IEC Code */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">
                            DGFT IEC Code (Optional)
                          </label>
                          <input
                            type="text"
                            maxLength={10}
                            placeholder="0391029481"
                            value={formData.iecCode}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                iecCode: e.target.value.toUpperCase(),
                              }))
                            }
                            className="w-full font-mono rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm font-bold uppercase focus:outline-none focus:border-primary"
                          />
                        </div>

                        {/* Corporate PAN */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">Corporate PAN</label>
                          <input
                            type="text"
                            maxLength={10}
                            placeholder="AAACB1234F"
                            value={formData.panNumber}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                panNumber: e.target.value.toUpperCase(),
                              }))
                            }
                            className={`w-full font-mono rounded-xl border bg-background px-3 py-2 text-xs sm:text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                              errors.panNumber ? "border-rose-500" : "border-border"
                            }`}
                          />
                          {errors.panNumber && (
                            <div className="text-[10px] text-rose-500 flex items-center gap-1">
                              <AlertCircle className="size-3" />
                              <span>{errors.panNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Location Hub */}
                      <div className="grid gap-4 sm:grid-cols-2 pt-1">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">
                            Headquarters / Key Logistics Hub City
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Mumbai / Navi Mumbai (JNPT)"
                            value={formData.headquartersCity}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                headquartersCity: e.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-primary"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">
                            State Jurisdiction
                          </label>
                          <select
                            value={formData.headquartersState}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                headquartersState: e.target.value,
                              }))
                            }
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-primary"
                          >
                            {Object.values(GST_STATE_MAP).map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Logistics Gateways & Corridors */}
                  {currentStep === 3 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-2">
                      <div className="border-b border-border/60 pb-3">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                          <Layers className="size-5 text-primary" />
                          <span>National Freight Gateways & Corridor Coring</span>
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Enable instant interoperability with Indian Railways, National Highways,
                          and ULIP APIs.
                        </p>
                      </div>

                      {/* Monthly Freight Volume */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground">
                          Estimated Monthly Freight Throughput
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            "< 500 MT",
                            "500 - 5,000 MT",
                            "5,000 - 25,000 MT",
                            "25,000+ MT (Full Train Rakes)",
                          ].map((vol) => (
                            <button
                              key={vol}
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({ ...prev, monthlyVolume: vol }))
                              }
                              className={`p-2.5 rounded-xl border text-xs font-bold text-center transition ${
                                formData.monthlyVolume === vol
                                  ? "bg-primary text-white border-primary shadow-xs"
                                  : "bg-surface-2 text-foreground border-border hover:border-primary/40"
                              }`}
                            >
                              {vol}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Primary Corridors Multi-Select */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground">
                          Select Operating Dedicated Freight Corridors (DFCs)
                        </label>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {MAJOR_CORRIDORS.map((corridor) => {
                            const isIncluded = formData.primaryCorridors.includes(corridor);
                            return (
                              <button
                                key={corridor}
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => {
                                    const next = isIncluded
                                      ? prev.primaryCorridors.filter((c) => c !== corridor)
                                      : [...prev.primaryCorridors, corridor];
                                    return { ...prev, primaryCorridors: next };
                                  });
                                }}
                                className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-semibold transition ${
                                  isIncluded
                                    ? "bg-blue-500/10 border-blue-500/40 text-blue-700 dark:text-blue-300 font-bold"
                                    : "bg-surface border-border text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <div
                                  className={`grid size-5 place-items-center rounded-md text-xs ${
                                    isIncluded
                                      ? "bg-blue-600 text-white"
                                      : "border border-muted-foreground/40"
                                  }`}
                                >
                                  {isIncluded && <Check className="size-3 stroke-[3]" />}
                                </div>
                                <span className="truncate">{corridor}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* National Integrations Toggles */}
                      <div className="space-y-3 pt-2">
                        <label className="text-xs font-bold text-foreground">
                          National Logistics Gateway Sync (Zero-Setup Auto Connector)
                        </label>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {/* ULIP */}
                          <div className="flex items-start justify-between p-3 rounded-xl border border-border/80 bg-surface-2/60">
                            <div className="space-y-0.5 pr-2">
                              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <span>ULIP Gateway</span>
                                <span className="bg-primary/20 text-primary text-[9px] px-1.5 py-0.2 rounded-md font-mono">
                                  DPIIT
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                Unified Logistics Interface Platform for fast-track customs & port
                                clearances.
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.enableUlip}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, enableUlip: e.target.checked }))
                              }
                              className="size-4 mt-1 accent-primary"
                            />
                          </div>

                          {/* FOIS */}
                          <div className="flex items-start justify-between p-3 rounded-xl border border-border/80 bg-surface-2/60">
                            <div className="space-y-0.5 pr-2">
                              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <span>Indian Railways FOIS</span>
                                <span className="bg-blue-500/20 text-blue-700 dark:text-blue-300 text-[9px] px-1.5 py-0.2 rounded-md font-mono">
                                  CRIS
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                Live rake allocation, wagon telemetry, and electronic Railway
                                Receipt (e-RR).
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.enableFois}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, enableFois: e.target.checked }))
                              }
                              className="size-4 mt-1 accent-primary"
                            />
                          </div>

                          {/* E-Way Bill */}
                          <div className="flex items-start justify-between p-3 rounded-xl border border-border/80 bg-surface-2/60">
                            <div className="space-y-0.5 pr-2">
                              <div className="text-xs font-bold text-foreground">
                                e-Way Bill & FASTag RFID
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                Automated vehicle transshipment logs and interstate checkpost
                                clearance.
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.enableEwayBill}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  enableEwayBill: e.target.checked,
                                }))
                              }
                              className="size-4 mt-1 accent-primary"
                            />
                          </div>

                          {/* NavIC GNSS */}
                          <div className="flex items-start justify-between p-3 rounded-xl border border-border/80 bg-surface-2/60">
                            <div className="space-y-0.5 pr-2">
                              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <span>NavIC / AIS-140 GPS</span>
                                <span className="bg-emerald-500/20 text-emerald-700 text-[9px] px-1.5 py-0.2 rounded-md font-mono">
                                  ISRO
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                High-precision indigenous satellite tracking with 15-second
                                telemetry polling.
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.enableNavicGps}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  enableNavicGps: e.target.checked,
                                }))
                              }
                              className="size-4 mt-1 accent-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: KYC Verification & Compliance */}
                  {currentStep === 4 && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-2">
                      <div className="border-b border-border/60 pb-3">
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                          <FileCheck className="size-5 text-primary" />
                          <span>KYC Verification & Master Agreement</span>
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Upload enterprise authorization documents or choose instant digital
                          verification.
                        </p>
                      </div>

                      {/* Designation */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">
                          Authorized Officer Designation
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Chief Logistics Officer / General Manager Supply Chain"
                          value={formData.designation}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, designation: e.target.value }))
                          }
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-primary"
                        />
                      </div>

                      {/* KYC Document Dropzone */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground">
                          Upload Enterprise KYC Document (GST Certificate / PAN / MSME Udyam)
                        </label>
                        <div className="rounded-2xl border-2 border-dashed border-border/80 bg-surface-2/40 p-6 text-center hover:border-primary/60 transition">
                          {formData.kycFileName ? (
                            <div className="flex flex-col items-center gap-2">
                              <div className="grid size-12 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
                                <FileCheck className="size-6" />
                              </div>
                              <div className="text-xs font-bold text-foreground">
                                {formData.kycFileName}
                              </div>
                              <span className="text-[11px] text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                Ready for Verification (4.2 MB)
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({ ...prev, kycFileName: null }))
                                }
                                className="text-xs text-rose-500 hover:underline mt-1"
                              >
                                Remove File
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                                <Upload className="size-6" />
                              </div>
                              <div className="text-xs font-bold text-foreground">
                                Drag & Drop your Certificate PDF/JPG here
                              </div>
                              <p className="text-[11px] text-muted-foreground max-w-sm">
                                Max size: 25 MB. Supports GSTIN Registration (Form REG-06), IEC
                                Certificate, or Corporate PAN.
                              </p>
                              <div className="flex gap-2 mt-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      kycFileName: `${formData.companyName.replace(/[^a-zA-Z0-9]/g, "_") || "Enterprise"}_GST_Certificate_2026.pdf`,
                                    }))
                                  }
                                  className="rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition"
                                >
                                  Attach Sample KYC PDF
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Compliance Toggles */}
                      <div className="space-y-3 pt-2">
                        <div className="space-y-2 rounded-xl border border-border/80 bg-surface-2/40 p-4">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              required
                              checked={formData.agreeTerms}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  agreeTerms: e.target.checked,
                                }))
                              }
                              className="size-4 mt-0.5 accent-primary"
                            />
                            <div className="text-xs leading-relaxed text-muted-foreground">
                              I accept the{" "}
                              <strong className="text-foreground">
                                FreightWave Master Services Agreement
                              </strong>
                              , Multimodal Tariff Schedule, and Indian Railways FOIS Integration
                              terms.
                            </div>
                          </label>
                          {errors.agreeTerms && (
                            <div className="text-[11px] text-rose-500 flex items-center gap-1 pl-7">
                              <AlertCircle className="size-3" />
                              <span>{errors.agreeTerms}</span>
                            </div>
                          )}

                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.agreeDpdp}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  agreeDpdp: e.target.checked,
                                }))
                              }
                              className="size-4 mt-0.5 accent-primary"
                            />
                            <div className="text-xs leading-relaxed text-muted-foreground">
                              I consent to digital logistics data synchronization compliant with the{" "}
                              <strong className="text-foreground">
                                Digital Personal Data Protection (DPDP) Act 2023
                              </strong>
                              .
                            </div>
                          </label>

                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.enableSosAlerts}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  enableSosAlerts: e.target.checked,
                                }))
                              }
                              className="size-4 mt-0.5 accent-primary"
                            />
                            <div className="text-xs leading-relaxed text-muted-foreground">
                              Enable high-priority SMS/Call broadcast for RDSO Emergency SOS &
                              accident telemetry events.
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/60">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-foreground hover:bg-surface-2 transition"
                      >
                        <ArrowLeft className="size-3.5" />
                        <span>Previous Step</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    {currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground hover:brightness-110 shadow-md transition"
                      >
                        <span>Continue to Step {currentStep + 1}</span>
                        <ArrowRight className="size-3.5" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md transition"
                      >
                        <ShieldCheck className="size-4" />
                        <span>Create Enterprise Account & Activate</span>
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ================= REGISTRATION SUCCESS BANNER ================= */}
        {authMode === "signup" && isCompleted && (
          <div className="max-w-2xl mx-auto rounded-3xl border border-emerald-500/30 bg-surface p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95">
            <div className="grid size-16 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 mx-auto">
              <CheckCircle2 className="size-10" />
            </div>

            <div className="space-y-2">
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600">
                Enterprise Account Provisioned
              </span>
              <h2 className="text-2xl font-extrabold text-foreground">
                Welcome to FreightWave AI, {formData.fullName}!
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Your enterprise credentials have been verified and synchronized with the National
                Logistics Portal (ULIP) & FOIS gateways.
              </p>
            </div>

            {/* Account Card */}
            <div className="rounded-2xl border border-border/80 bg-surface-2 p-5 text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Account Identifier:</span>
                <span className="font-bold text-primary text-sm">{generatedAccountId}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Organization:</span>
                <span className="font-bold text-foreground">
                  {formData.companyName || "Bharat Heavy Multimodal Logistics Ltd."}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Logistics Role:</span>
                <span className="font-bold text-emerald-600">
                  {LOGISTICS_PERSONAS.find((p) => p.id === formData.logisticsPersona)?.title}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Authorized Email:</span>
                <span className="font-bold text-foreground">{formData.workEmail}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link
                to="/cargo-portal"
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition"
              >
                <Train className="size-4" />
                <span>Launch Cargo Owner Tracking Portal</span>
              </Link>

              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground shadow-md hover:brightness-110 transition"
              >
                <Layers className="size-4" />
                <span>Open Operations Command Hub</span>
              </Link>
            </div>
          </div>
        )}

        {/* ================= SIGN IN FLOW ================= */}
        {authMode === "signin" && (
          <div className="max-w-md mx-auto">
            <div className="rounded-2xl border border-border/80 bg-surface p-6 sm:p-8 shadow-sm space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold text-foreground">Sign In to Your Workspace</h2>
                <p className="text-xs text-muted-foreground">
                  Enter your registered work email and password to access the platform.
                </p>
              </div>

              {/* Demo 1-Click Credentials */}
              <div className="rounded-xl border border-border/60 bg-surface-2 p-3 space-y-2">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Quick Demo Credentials (1-Click Fill)
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleFillDemoUser("cargo")}
                    className="p-1.5 rounded-lg border border-border bg-background text-[10px] font-bold text-foreground hover:border-primary/40 hover:text-primary transition"
                  >
                    🏭 Cargo Owner
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemoUser("operator")}
                    className="p-1.5 rounded-lg border border-border bg-background text-[10px] font-bold text-foreground hover:border-primary/40 hover:text-primary transition"
                  >
                    🚆 Train Operator
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillDemoUser("forwarder")}
                    className="p-1.5 rounded-lg border border-border bg-background text-[10px] font-bold text-foreground hover:border-primary/40 hover:text-primary transition"
                  >
                    🚛 Fleet Carrier
                  </button>
                </div>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Corporate Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      placeholder="r.sengupta@tata-steel.in"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">Password</label>
                    <a
                      href="#forgot"
                      onClick={(e) => {
                        e.preventDefault();
                        showToast("Password reset link sent to your registered work email.");
                      }}
                      className="text-[11px] text-primary hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background pl-9 pr-9 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-primary"
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

                <button
                  type="submit"
                  disabled={signInLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:brightness-110 transition disabled:opacity-50"
                >
                  {signInLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <KeyRound className="size-4" />
                      <span>Sign In to Hub</span>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center text-xs text-muted-foreground">
                Don't have an enterprise account yet?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className="font-bold text-primary hover:underline"
                >
                  Register your company
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
