import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { requireStaff } from "./staff";

const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

// ponytail: لوکال public/uploads — روی ورسل موقت است؛ CDN بعداً
export async function uploadProductImage(form: FormData): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const gate = await requireStaff();
  if (!gate.ok) return gate;
  const f = form.get("file");
  if (!(f instanceof File)) return { ok: false, error: "فایل نفرستادی" };
  if (f.size > 4 * 1024 * 1024) return { ok: false, error: "حداکثر ۴ مگابایت" };
  const ext = ALLOWED.get(f.type);
  if (!ext) return { ok: false, error: "فقط jpg/png/webp" };
  try {
    const buf = Buffer.from(await f.arrayBuffer());
    const name = `${crypto.randomUUID()}.${ext}`;
    const dir = join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, name), buf);
    return { ok: true, url: `/uploads/${name}` };
  } catch {
    return { ok: false, error: "آپلود ناموفق بود" };
  }
}
