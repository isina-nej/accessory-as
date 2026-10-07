import Link from "next/link";

export function Breadcrumb({ trail }: { trail: { href?: string; label: string }[] }) {
  return (
    <p className="text-xs font-medium text-[#8A9398]">
      {trail.map((t, i) => (
        <span key={t.label}>
          {i > 0 && " / "}
          {t.href ? (
            <Link href={t.href} className="hover:text-(--color-brand)">
              {t.label}
            </Link>
          ) : (
            <span>{t.label}</span>
          )}
        </span>
      ))}
    </p>
  );
}
