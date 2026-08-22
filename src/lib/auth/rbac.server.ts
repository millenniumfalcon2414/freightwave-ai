import { UserRole } from "@/types/auth";
import { PermissionKey, ROLE_PERMISSIONS } from "@/types/permissions";

export interface ServerAuthContext {
  userId?: string;
  role: UserRole;
  email?: string;
  name?: string;
}

export function authorizeServerAction(
  context: ServerAuthContext,
  requiredPermission: PermissionKey,
): { authorized: boolean; error?: string } {
  const userRole = context.role;
  const permissions = ROLE_PERMISSIONS[userRole] || [];

  if (!permissions.includes(requiredPermission)) {
    return {
      authorized: false,
      error: `Access Denied: Role '${userRole}' lacks permission '${requiredPermission}'`,
    };
  }

  return { authorized: true };
}

export function requireRole(
  context: ServerAuthContext,
  allowedRoles: UserRole[],
): { authorized: boolean; error?: string } {
  if (!allowedRoles.includes(context.role)) {
    return {
      authorized: false,
      error: `Access Denied: Action restricted to roles: ${allowedRoles.join(", ")}`,
    };
  }
  return { authorized: true };
}
