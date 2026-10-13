import { redirect } from "next/navigation";
import { AdminCard, AdminEmpty, AdminTable } from "@/components/admin/ui";
import { AdminPage } from "@/components/admin/Shell";
import { AttrNew, AttrRow } from "@/components/admin/AttributeForms";
import { listAdminAttributes } from "@/server/admin-products";
import { requirePermission } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "ویژگی‌ها | پنل" };

export default async function AdminAttributes() {
  const gate = await requirePermission("attributes.read");
  if (!gate.ok) redirect("/login?next=/admin/attributes");
  const attrs = await listAdminAttributes();
  return (
    <AdminPage active="/admin/attributes" roles={gate.roles}>
      <AdminCard title="ویژگی جدید (رنگ یا سایز)">
        <AttrNew />
      </AdminCard>
      <AdminCard title={`ویژگی‌ها (${attrs.length})`}>
        {attrs.length === 0 ? (
          <AdminEmpty text="هنوز ویژگی‌ای ثبت نشده است. رنگ‌ها و سایزهای محصولات از اینجا ساخته می‌شوند." />
        ) : (
          <AdminTable head={["برچسب", "مقدار", "اتصال به محصول", "ویرایش"]}>
            {attrs.map((a) => (
              <AttrRow key={a.id} {...a} />
            ))}
          </AdminTable>
        )}
      </AdminCard>
    </AdminPage>
  );
}