"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROLE_FA, type StaffRole } from "@/lib/roles";
import { grantRole, revokeRole } from "@/server/admin-users";

const ROLES: StaffRole[] = ["admin", "content", "support"];

export function RoleBtns({ userId, has, role }: { userId: string; has: boolean; role: StaffRole }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          if (has && !confirm(`نقش «${ROLE_FA[role]}» از این کاربر حذف شود؟`)) return;
          setBusy(true);
          const r = has ? await revokeRole(userId, role) : await grantRole(userId, role);
          setBusy(false);
          if (!r.ok) setMsg(r.error);
          else {
            setMsg(null);
            router.refresh();
          }
        }}
        className={`rounded-full border px-2 py-0.5 text-[11px] disabled:opacity-50 ${has ? "bg-(--color-brand) text-white" : ""}`}
        aria-pressed={has}
      >
        {ROLE_FA[role]}
      </button>
      {msg && <span className="text-[11px] text-(--color-wine)">{msg}</span>}
    </span>
  );
}

export function RoleCell({ userId, roles }: { userId: string; roles: StaffRole[] }) {
  return (
    <span className="flex flex-wrap gap-1">
      {ROLES.map((r) => (
        <RoleBtns key={r} userId={userId} role={r} has={roles.includes(r)} />
      ))}
    </span>
  );
}