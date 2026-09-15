import { cn } from "@/lib/cn";

export const inputCls = "h-10 w-full rounded-lg border bg-white px-3 text-sm";
export const labelCls = "mb-1 block text-xs text-(--color-muted-fg)";

export function AdminCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-extrabold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AdminTable({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-160 text-right text-sm">
        <thead>
          <tr className="border-b text-xs text-(--color-muted-fg)">
            {head.map((h) => (
              <th key={h} className="px-2 py-2 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}

export function TextInput({ value, onChange, ...rest }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & { value: string; onChange: (v: string) => void }) {
  return <input {...rest} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} ${rest.className ?? ""}`} />;
}

export { cn };
