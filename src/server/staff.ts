import { ROLE_FA, STAFF_ROLES } from "../lib/roles";
import type { AdminPermission, StaffRole } from "../lib/roles";

export { ROLE_FA, STAFF_ROLES };
export type { AdminPermission, StaffRole };
export {
  bootstrapAdmin,
  canAccess,
  getMyRoles,
  requireAnyPermission,
  requirePermission,
} from "../lib/staff";
export type { StaffGate } from "../lib/staff";
