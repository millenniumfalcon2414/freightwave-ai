import { useState, useEffect } from "react";
import { UserAccount, UserRole, DemoPersona } from "@/types/auth";

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    role: "super_admin",
    title: "Super Administrator",
    subtitle: "Enterprise Control Command · Global Systems",
    email: "superadmin@freightwave.ai",
    name: "Dr. Vikramaditya Sharma",
    company: "FreightWave AI Global Systems HQ",
    avatarLetter: "S",
    avatarBg: "from-purple-600 to-indigo-700",
    targetDashboard: "/dashboard?role=super_admin",
    badge: "Super Admin",
    description:
      "Unrestricted oversight across all rail rakes, road hauler telemetry, AI optimization parameters, user role provisioning, and emergency escalation protocols.",
    sampleStats: {
      label1: "Enterprise Nodes",
      val1: "128 Hubs",
      label2: "System Health",
      val2: "99.98% Uptime",
    },
  },
  {
    role: "dispatcher",
    title: "Central Multimodal Dispatcher",
    subtitle: "Realtime Route Control & Corridor Dispatch",
    email: "dispatcher.central@freightwave.ai",
    name: "Amitabh Banerjee",
    company: "Central Multimodal Dispatch Control",
    avatarLetter: "A",
    avatarBg: "from-blue-600 to-indigo-600",
    targetDashboard: "/dashboard?role=dispatcher",
    badge: "Dispatcher",
    description:
      "Real-time route authorization, 1-click modal rerouting, DFC train slot booking, and active delay mitigation.",
    sampleStats: {
      label1: "Active Corridors",
      val1: "6 Routes",
      label2: "Reroute Efficiency",
      val2: "94.2%",
    },
  },
  {
    role: "analyst",
    title: "Logistics Intelligence Analyst",
    subtitle: "Predictive Analytics & Cost Modeling",
    email: "analyst@freightwave.ai",
    name: "Kavita Ramachandran",
    company: "National Logistics Intelligence Unit",
    avatarLetter: "K",
    avatarBg: "from-teal-600 to-emerald-600",
    targetDashboard: "/dashboard?role=analyst",
    badge: "Analyst",
    description:
      "Corridor demand forecasting, predictive risk distribution, carbon abatement telemetry, and multimodal cost modeling.",
    sampleStats: {
      label1: "Prediction Accuracy",
      val1: "96.4%",
      label2: "CO₂ Saved",
      val2: "142.8 Tonnes",
    },
  },
  {
    role: "viewer",
    title: "Read-Only Executive Viewer",
    subtitle: "Ministry of Commerce & Stakeholder Oversight",
    email: "viewer.ops@freightwave.ai",
    name: "Sneha Nair",
    company: "National Freight Logistics Directorate",
    avatarLetter: "S",
    avatarBg: "from-slate-600 to-gray-700",
    targetDashboard: "/dashboard?role=viewer",
    badge: "Viewer",
    description:
      "Executive overview of national logistics performance, on-time delivery percentages, and live multimodal map telemetry.",
    sampleStats: {
      label1: "On-Time Rate",
      val1: "93.8%",
      label2: "Active Freight",
      val2: "1,512 T",
    },
  },
  {
    role: "logistics_manager",
    title: "Logistics Operations Manager",
    subtitle: "National Multimodal Hub · Blue Dart & CONCOR Grid",
    email: "logistics.mgr@freightwave.ai",
    name: "Priya Sundaram",
    company: "National Freight Corridor Operations",
    avatarLetter: "P",
    avatarBg: "from-blue-600 to-cyan-600",
    targetDashboard: "/dashboard?role=logistics_manager",
    badge: "Logistics Mgr",
    description:
      "Real-time dispatch schedules, DFC rail slot allocations, intermodal transshipment optimization, carbon reduction targets, and carrier SLAs.",
    sampleStats: {
      label1: "Active Shipments",
      val1: "348 Shipments",
      label2: "Modal Split (Rail)",
      val2: "68.4%",
    },
  },
  {
    role: "fleet_operator",
    title: "3PL Fleet & Drayage Operator",
    subtitle: "Highway Drayage · VRL Multimodal Logistics",
    email: "dispatch.mumbai@vrl-logistics.com",
    name: "Vikram R. Lad",
    company: "VRL Multimodal Roadways Ltd.",
    avatarLetter: "V",
    avatarBg: "from-amber-600 to-orange-600",
    targetDashboard: "/dashboard?role=fleet_operator",
    badge: "Fleet Operator",
    description:
      "Intermodal truck fleet tracking, FASTag toll logs, Sarathi driver duty hours, fuel telemetry, and rail yard handover.",
    sampleStats: {
      label1: "Live Road Haulers",
      val1: "42 Prime Movers",
      label2: "FASTag Toll Balance",
      val2: "₹2.84 Lakh",
    },
  },
  {
    role: "driver",
    title: "Highway Fleet Driver / Pilot",
    subtitle: "Western Corridor Drayage · Express Prime Mover",
    email: "driver.sharma@expresslogistics.in",
    name: "Gurpreet Singh Gill",
    company: "Western Express Freight Drivers Guild",
    avatarLetter: "G",
    avatarBg: "from-emerald-600 to-green-600",
    targetDashboard: "/dashboard?role=driver",
    badge: "Fleet Driver",
    description:
      "Turn-by-turn multimodal route guidance, live SOS panic button, rest-break telemetry, digital POD signatures, and weighbridge e-token scanner.",
    sampleStats: {
      label1: "Current Speed",
      val1: "64 km/h (GPS)",
      label2: "Driver Safety Score",
      val2: "98.5 / 100",
    },
  },
  {
    role: "customer",
    title: "Cargo Customer / Consignor",
    subtitle: "Consignor Portal · Tata Steel Ltd.",
    email: "rajesh.sengupta@tata-steel.in",
    name: "Rajeshwar Sengupta",
    company: "Tata Steel BSL Logistics Division",
    avatarLetter: "R",
    avatarBg: "from-blue-600 to-indigo-600",
    targetDashboard: "/cargo-portal",
    badge: "Cargo Customer",
    description:
      "Full visibility into booked rail rakes, live GPS wagons, e-Way bills, temperature/vibration sensors, and delivery proof.",
    sampleStats: {
      label1: "Active Consignments",
      val1: "6 Rakes",
      label2: "Carbon Reduction",
      val2: "58.4%",
    },
  },
  {
    role: "cargo_owner",
    title: "Cargo Owner / Industrial Shipper",
    subtitle: "Consignor Portal · Tata Steel Ltd.",
    email: "rajesh.sengupta@tata-steel.in",
    name: "Rajeshwar Sengupta",
    company: "Tata Steel BSL Logistics Division",
    avatarLetter: "R",
    avatarBg: "from-blue-600 to-indigo-600",
    targetDashboard: "/cargo-portal",
    badge: "Consignor Portal",
    description:
      "Full visibility into booked rail rakes, live GPS wagons, e-Way bills, temperature/vibration sensors, and delivery proof.",
    sampleStats: {
      label1: "Active Consignments",
      val1: "6 Rakes",
      label2: "Carbon Reduction",
      val2: "58.4%",
    },
  },
  {
    role: "train_operator",
    title: "Container Train Operator (CTO)",
    subtitle: "Railway Rake Control · CONCOR India",
    email: "operations.wdfc@concor-india.gov.in",
    name: "Capt. Arvind Swaminathan",
    company: "Container Corporation of India (CONCOR)",
    avatarLetter: "A",
    avatarBg: "from-emerald-600 to-teal-600",
    targetDashboard: "/dashboard?role=train_operator",
    badge: "CTO Licensee",
    description:
      "DFC slot allocation, electric locomotive power consumption, rake wagon composition, axle load sensors, and FOIS sync.",
    sampleStats: {
      label1: "Scheduled Rakes",
      val1: "18 Trains (WDFC)",
      label2: "On-Time Index",
      val2: "97.6%",
    },
  },
  {
    role: "safety_inspector",
    title: "RDSO Safety & QA Inspector",
    subtitle: "Quality Assurance · Indian Railways RDSO",
    email: "inspector.singh@rdso.railnet.gov.in",
    name: "Eng. Manpreet Singh, IRSME",
    company: "Research Designs and Standards Organisation (RDSO)",
    avatarLetter: "M",
    avatarBg: "from-rose-600 to-pink-600",
    targetDashboard: "/dashboard?role=safety_inspector",
    badge: "RDSO Certified",
    description:
      "6-step wagon seal security check, brake mechanical fitness verification, sensor calibration, defect logging, and digital compliance certs.",
    sampleStats: {
      label1: "Wagons Inspected",
      val1: "312 Units",
      label2: "Pass Rate",
      val2: "99.2%",
    },
  },
  {
    role: "multimodal_planner",
    title: "Central Multimodal Dispatcher",
    subtitle: "Freight Operations · FreightWave Command",
    email: "dispatch.central@freightwave.ai",
    name: "Dr. Ananya Iyer",
    company: "National Logistics Operations Command",
    avatarLetter: "A",
    avatarBg: "from-purple-600 to-blue-600",
    targetDashboard: "/dashboard?role=multimodal_planner",
    badge: "Master Dispatcher",
    description:
      "AI-driven modal split optimization, live digital twin telematics, emergency SOS incident command, and multi-corridor telemetry.",
    sampleStats: {
      label1: "Total Tonnage Managed",
      val1: "84,500 MT",
      label2: "AI Optimization Rate",
      val2: "41.8% Cost Cut",
    },
  },
];

const DEFAULT_USER: UserAccount = {
  id: "FW-IND-CRG-2849",
  name: "Rajeshwar Sengupta",
  email: "rajesh.sengupta@tata-steel.in",
  phone: "+91 98450 19823",
  company: "Tata Steel BSL Logistics Division",
  role: "cargo_owner",
  roleTitle: "Cargo Owner / Industrial Shipper",
  department: "Industrial Raw Materials & Finished Steel",
  accountType: "Enterprise Platinum Consignor",
  gstin: "27AAACT2727Q1ZB",
  iecCode: "0388019482",
  authProvider: "credentials",
  defaultDashboard: "/cargo-portal",
  dashboardRoleParam: "cargo_owner",
  stats: {
    activeShipments: 6,
    completedThisMonth: 124,
    costSavedInr: "₹42.8 Lakh",
    co2SavedTonnes: 384,
  },
  lastLoginAt: "2026-08-22T00:00:00.000Z",
};

const STORAGE_KEY = "freightwave_auth_account";
const LOGGED_OUT_KEY = "freightwave_logged_out";

type AuthListener = (user: UserAccount | null) => void;
const listeners = new Set<AuthListener>();

function notify(user: UserAccount | null) {
  listeners.forEach((fn) => fn(user));
}

export function getStoredUser(): UserAccount | null {
  if (typeof window === "undefined") return DEFAULT_USER;
  try {
    const isExplicitlyLoggedOut = localStorage.getItem(LOGGED_OUT_KEY) === "true";
    if (isExplicitlyLoggedOut) {
      return null;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_USER;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USER;
  }
}

export const authStore = {
  getUser(): UserAccount | null {
    return getStoredUser();
  },

  loginWithCredentials(email: string, _password: string, role?: UserRole): UserAccount {
    const persona =
      DEMO_PERSONAS.find((p) => p.email.toLowerCase() === email.toLowerCase()) ||
      (role ? DEMO_PERSONAS.find((p) => p.role === role) : null) ||
      DEMO_PERSONAS[0];

    const account: UserAccount = {
      id: `FW-IND-${persona.role.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: persona.name,
      email: email.trim() || persona.email,
      phone: "+91 98450 19823",
      company: persona.company,
      role: persona.role,
      roleTitle: persona.title,
      department: "Logistics & Multimodal Supply Chain",
      accountType: "Enterprise Tier 1 Certified",
      gstin: "27AAACB1234F1Z5",
      authProvider: "credentials",
      defaultDashboard: persona.targetDashboard.startsWith("/cargo-portal")
        ? "/cargo-portal"
        : "/dashboard",
      dashboardRoleParam: persona.role,
      stats: {
        activeShipments: 6,
        completedThisMonth: 124,
        fleetUnitsActive: 42,
        costSavedInr: "₹42.8 Lakh",
        co2SavedTonnes: 384,
      },
      lastLoginAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.removeItem(LOGGED_OUT_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
      // Also update cargo-portal user profile for seamless sync
      localStorage.setItem(
        "freightwave_user_profile",
        JSON.stringify({
          id: account.id,
          name: account.name,
          company: account.company,
          email: account.email,
          phone: account.phone,
          role: account.roleTitle,
          accountType: account.accountType,
          gstin: account.gstin,
          activeShipmentsCount: account.stats.activeShipments,
          totalShipments2026: account.stats.completedThisMonth,
        }),
      );
    }
    notify(account);
    return account;
  },

  loginWithGoogle(googleProfile: {
    name: string;
    email: string;
    picture?: string;
    role?: UserRole;
  }): UserAccount {
    const selectedRole: UserRole = googleProfile.role || "cargo_owner";
    const persona = DEMO_PERSONAS.find((p) => p.role === selectedRole) || DEMO_PERSONAS[0];

    const account: UserAccount = {
      id: `FW-GOOG-${Math.floor(100000 + Math.random() * 900000)}`,
      name: googleProfile.name || "Praghna D. R.",
      email: googleProfile.email,
      avatarUrl: googleProfile.picture,
      phone: "+91 94480 55123",
      company:
        selectedRole === "cargo_owner"
          ? "Praghna Multimodal Steel & Freight Consignor"
          : selectedRole === "fleet_operator"
            ? "Praghna Intermodal Trucking Carrier"
            : selectedRole === "train_operator"
              ? "Praghna Rail CTO Container Lines"
              : "FreightWave Integrated Logistics",
      role: selectedRole,
      roleTitle: persona.title,
      department: "Enterprise Logistics Intelligence",
      accountType: "Google Workspace Enterprise Verified",
      gstin: "29AAACP9912K1Z8",
      authProvider: "google",
      defaultDashboard: selectedRole === "cargo_owner" ? "/cargo-portal" : "/dashboard",
      dashboardRoleParam: selectedRole,
      stats: {
        activeShipments: 8,
        completedThisMonth: 142,
        fleetUnitsActive: 56,
        costSavedInr: "₹54.2 Lakh",
        co2SavedTonnes: 490,
      },
      lastLoginAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.removeItem(LOGGED_OUT_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
      localStorage.setItem(
        "freightwave_user_profile",
        JSON.stringify({
          id: account.id,
          name: account.name,
          company: account.company,
          email: account.email,
          phone: account.phone,
          role: account.roleTitle,
          accountType: account.accountType,
          gstin: account.gstin,
          activeShipmentsCount: account.stats.activeShipments,
          totalShipments2026: account.stats.completedThisMonth,
        }),
      );
    }
    notify(account);
    return account;
  },

  switchPersona(role: UserRole): UserAccount {
    const persona = DEMO_PERSONAS.find((p) => p.role === role) || DEMO_PERSONAS[0];
    const account: UserAccount = {
      id: `FW-IND-${persona.role.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: persona.name,
      email: persona.email,
      phone: "+91 98450 19823",
      company: persona.company,
      role: persona.role,
      roleTitle: persona.title,
      department: "Logistics Operations & Dispatch",
      accountType: "Enterprise Tier 1 Certified",
      gstin: "27AAACB1234F1Z5",
      authProvider: "credentials",
      defaultDashboard: persona.targetDashboard.startsWith("/cargo-portal")
        ? "/cargo-portal"
        : "/dashboard",
      dashboardRoleParam: persona.role,
      stats: {
        activeShipments: 6,
        completedThisMonth: 124,
        fleetUnitsActive: 42,
        costSavedInr: "₹42.8 Lakh",
        co2SavedTonnes: 384,
      },
      lastLoginAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      localStorage.removeItem(LOGGED_OUT_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
      localStorage.setItem(
        "freightwave_user_profile",
        JSON.stringify({
          id: account.id,
          name: account.name,
          company: account.company,
          email: account.email,
          phone: account.phone,
          role: account.roleTitle,
          accountType: account.accountType,
          gstin: account.gstin,
          activeShipmentsCount: account.stats.activeShipments,
          totalShipments2026: account.stats.completedThisMonth,
        }),
      );
    }
    notify(account);
    return account;
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOGGED_OUT_KEY, "true");
      localStorage.removeItem(STORAGE_KEY);
    }
    notify(null);
  },

  subscribe(fn: AuthListener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export function useAuth() {
  const [user, setUser] = useState<UserAccount | null>(DEFAULT_USER);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
    }
    const unsub = authStore.subscribe((updatedUser) => {
      setUser(updatedUser);
    });
    return unsub;
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    loginWithCredentials: authStore.loginWithCredentials,
    loginWithGoogle: authStore.loginWithGoogle,
    switchPersona: authStore.switchPersona,
    logout: authStore.logout,
  };
}
