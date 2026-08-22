export type UserRole =
  | "admin"
  | "super_admin"
  | "fleet_manager"
  | "logistics_manager"
  | "dispatcher"
  | "driver"
  | "analyst"
  | "viewer"
  | "customer"
  | "fleet_operator"
  | "cargo_owner"
  | "train_operator"
  | "safety_inspector"
  | "multimodal_planner";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  company: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  accountType: string;
  gstin?: string;
  iecCode?: string;
  authProvider: "credentials" | "google" | "sso";
  defaultDashboard: "/dashboard" | "/cargo-portal";
  dashboardRoleParam?: UserRole;
  stats: {
    activeShipments: number;
    completedThisMonth: number;
    fleetUnitsActive?: number;
    pendingInspections?: number;
    costSavedInr?: string;
    co2SavedTonnes?: number;
  };
  lastLoginAt: string;
}

export interface DemoPersona {
  role: UserRole;
  title: string;
  subtitle: string;
  email: string;
  name: string;
  company: string;
  avatarLetter: string;
  avatarBg: string;
  targetDashboard: string;
  badge: string;
  description: string;
  sampleStats: {
    label1: string;
    val1: string;
    label2: string;
    val2: string;
  };
}
