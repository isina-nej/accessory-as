import Link from "next/link";
import { cn } from "@/lib/cn";
import { toFa } from "@/lib/fa";

export const inputCls = "h-10 w-full rounded-lg border bg-white px-3 text-sm";
export const labelCls = "mb-1 block text-xs text-(--color-muted-fg)";

export function AdminCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
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
  return <input {...rest} value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, rest.className)} />;
}

export function AdminEmpty({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed p-6 text-center text-sm text-(--color-muted-fg)">
      <p>{text}</p>
      {action && <div className="mt-3 flex justify-center">{action}</div>}
    </div>
  );
}

export function AdminErrorState({ text, onRetry }: { text: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-(--color-wine) bg-(--color-wine)/5 p-4 text-center text-sm text-(--color-wine)">
      <p>{text}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 rounded-lg border border-(--color-wine) px-3 py-1 text-xs">
          تلاش دوباره
        </button>
      )}
    </div>
  );
}

export function AdminPager({ basePath, query, page, pages }: { basePath: string; query: URLSearchParams; page: number; pages: number }) {
  if (pages <= 1) return null;
  const link = (nextPage: number) => {
    const params = new URLSearchParams(query);
    params.set("page", String(nextPage));
    return `${basePath}?${params.toString()}`;
  };
  return (
    <nav aria-label="صفحه‌بندی" className="mt-3 flex items-center gap-2 text-sm">
      {page > 1 && <Link className="rounded border px-3 py-1" href={link(page - 1)}>قبلی</Link>}
      <span>{toFa(page)} از {toFa(pages)}</span>
      {page < pages && <Link className="rounded border px-3 py-1" href={link(page + 1)}>بعدی</Link>}
    </nav>
  );
}

export { cn };