"use client";

import { useRouter } from "next/navigation";
import { ROLE_FA, type StaffRole } from "@/lib/roles";
import { grantRole, revokeRole } from "@/server/admin-users";

const ROLES: StaffRole[] = ["admin", "content", "support"];

export function RoleBtns({ userId, has, role }: { userId: string; has: boolean; role: StaffRole }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        const r = has ? await revokeRole(userId, role) : await grantRole(userId, role);
        if (!r.ok) alert(r.error);
        else router.refresh();
      }}
      className={`rounded-full border px-2 py-0.5 text-[11px] ${has ? "bg-(--color-brand) text-white" : ""}`}
    >
      {ROLE_FA[role]}
    </button>
  );
}

export function RoleCell({ userId, roles }: { userId: string; roles: string }) {
  return (
    <span className="flex flex-wrap gap-1">
      {ROLES.map((r) => (
        <RoleBtns key={r} userId={userId} role={r} has={roles.includes(ROLE_FA[r])} />
      ))}
    </span>
  );
}
