import { UserRole } from "@/types/auth";

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: "tracking" | "rail" | "fleet" | "emergency" | "analytics" | "admin" | "orders";
}

export type PermissionKey =
  | "view_live_map"
  | "view_road_tracking"
  | "view_rail_tracking"
  | "book_rail_slots"
  | "manage_fleet_health"
  | "schedule_maintenance"
  | "trigger_sos"
  | "manage_emergency_dispatch"
  | "view_financial_analytics"
  | "manage_user_roles"
  | "manage_system_settings"
  | "create_shipments"
  | "sign_delivery_proof"
  | "manage_drivers";

export const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  admin: [
    "view_live_map",
    "view_road_tracking",
    "view_rail_tracking",
    "book_rail_slots",
    "manage_fleet_health",
    "schedule_maintenance",
    "trigger_sos",
    "manage_emergency_dispatch",
    "view_financial_analytics",
    "manage_user_roles",
    "manage_system_settings",
    "create_shipments",
    "sign_delivery_proof",
    "manage_drivers",
  ],
  super_admin: [
    "view_live_map",
    "view_road_tracking",
    "view_rail_tracking",
    "book_rail_slots",
    "manage_fleet_health",
    "schedule_maintenance",
    "trigger_sos",
    "manage_emergency_dispatch",
    "view_financial_analytics",
    "manage_user_roles",
    "manage_system_settings",
    "create_shipments",
    "sign_delivery_proof",
    "manage_drivers",
  ],
  fleet_manager: [
    "view_live_map",
    "view_road_tracking",
    "view_rail_tracking",
    "manage_fleet_health",
    "schedule_maintenance",
    "trigger_sos",
    "manage_emergency_dispatch",
    "sign_delivery_proof",
    "manage_drivers",
    "create_shipments",
  ],
  dispatcher: [
    "view_live_map",
    "view_road_tracking",
    "view_rail_tracking",
    "book_rail_slots",
    "trigger_sos",
    "manage_emergency_dispatch",
    "create_shipments",
    "sign_delivery_proof",
  ],
  analyst: [
    "view_live_map",
    "view_road_tracking",
    "view_rail_tracking",
    "view_financial_analytics",
  ],
  viewer: ["view_live_map", "view_road_tracking", "view_rail_tracking"],
  logistics_manager: [
    "view_live_map",
    "view_road_tracking",
    "view_rail_tracking",
    "book_rail_slots",
    "manage_fleet_health",
    "schedule_maintenance",
    "trigger_sos",
    "manage_emergency_dispatch",
    "view_financial_analytics",
    "create_shipments",
    "sign_delivery_proof",
    "manage_drivers",
  ],
  fleet_operator: [
    "view_live_map",
    "view_road_tracking",
    "view_rail_tracking",
    "manage_fleet_health",
    "schedule_maintenance",
    "trigger_sos",
    "manage_emergency_dispatch",
    "sign_delivery_proof",
    "manage_drivers",
  ],
  driver: ["view_live_map", "view_road_tracking", "trigger_sos", "sign_delivery_proof"],
  customer: ["view_live_map", "view_road_tracking", "view_rail_tracking", "create_shipments"],
  // Backwards compatibility mappings for legacy roles
  cargo_owner: [
    "view_live_map",
    "view_road_tracking",
    "view_rail_tracking",
    "create_shipments",
    "trigger_sos",
  ],
  train_operator: ["view_live_map", "view_rail_tracking", "book_rail_slots", "trigger_sos"],
  safety_inspector: [
    "view_live_map",
    "view_rail_tracking",
    "manage_fleet_health",
    "schedule_maintenance",
    "trigger_sos",
    "manage_emergency_dispatch",
  ],
  multimodal_planner: [
    "view_live_map",
    "view_road_tracking",
    "view_rail_tracking",
    "book_rail_slots",
    "manage_fleet_health",
    "trigger_sos",
    "manage_emergency_dispatch",
    "view_financial_analytics",
    "create_shipments",
  ],
};

export function hasPermission(role: UserRole | undefined, permission: PermissionKey): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function getRoleDisplayName(role?: UserRole): string {
  switch (role) {
    case "admin":
    case "super_admin":
      return "Administrator";
    case "fleet_manager":
    case "fleet_operator":
      return "Fleet Manager";
    case "dispatcher":
      return "Dispatch Controller";
    case "analyst":
      return "Logistics Analyst";
    case "viewer":
      return "Read-Only Viewer";
    case "logistics_manager":
      return "Logistics Manager";
    case "driver":
      return "Fleet Driver / Pilot";
    case "customer":
      return "Customer / Cargo Consignor";
    case "cargo_owner":
      return "Cargo Consignor";
    case "train_operator":
      return "Rail Train Operator (CTO)";
    case "safety_inspector":
      return "Safety & RDSO Inspector";
    case "multimodal_planner":
      return "Multimodal Planner";
    default:
      return "Enterprise User";
  }
}
