import Link from "next/link";

export function Breadcrumb({ trail }: { trail: { href?: string; label: string }[] }) {
  return (
    <p className="text-sm text-(--color-muted-fg)">
      {trail.map((t, i) => (
        <span key={t.label}>
          {i > 0 && " / "}
          {t.href ? (
            <Link href={t.href} className="hover:text-(--color-brand)">
              {t.label}
            </Link>
          ) : (
            <span className="text-(--color-ink)">{t.label}</span>
          )}
        </span>
      ))}
    </p>
  );
}
