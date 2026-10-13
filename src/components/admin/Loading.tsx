import { AdminCard } from "@/components/admin/ui";

export function AdminLoading({ title = "در حال بارگذاری" }: { title?: string }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-(--color-mist)" dir="rtl" aria-busy="true" aria-live="polite">
      <span className="sr-only">{title}</span>
      <div className="h-22 border-b bg-white" />
      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-4 px-4 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="h-64 animate-pulse rounded-2xl border bg-white p-4" aria-hidden="true">
          <div className="h-3 w-20 rounded bg-black/10" />
          <div className="mt-5 space-y-3">
            {["w-full", "w-11/12", "w-10/12", "w-9/12", "w-full", "w-11/12", "w-10/12"].map((width, index) => (
              <div key={index} className={`h-9 ${width} rounded-lg bg-black/5`} />
            ))}
          </div>
        </aside>
        <div className="min-w-0 space-y-4" aria-hidden="true">
          <AdminCard title={title}>
            <div className="animate-pulse space-y-4">
              <div className="h-10 w-full rounded-lg bg-black/5" />
              <div className="h-10 w-2/3 rounded-lg bg-black/5" />
              <div className="overflow-hidden rounded-xl border">
                {["w-11/12", "w-10/12", "w-full", "w-9/12", "w-11/12"].map((width, index) => (
                  <div key={index} className="flex gap-3 border-b p-3 last:border-b-0">
                    <div className="h-4 w-20 rounded bg-black/10" />
                    <div className={`h-4 ${width} rounded bg-black/5`} />
                  </div>
                ))}
              </div>
            </div>
          </AdminCard>
        </div>
      </main>
    </div>
  );
}