import { cn } from "@/lib/cn";

/**
 * آیکن فیگما — از public/icons/ رندر می‌شود.
 * مثال: <Icon name="icons-20--search" className="h-5 w-5" />
 */
export function Icon({
  name,
  className,
  alt = "",
}: {
  name: string;
  className?: string;
  alt?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/icons/${name}.svg`}
      alt={alt}
      className={cn("inline-block", className)}
      draggable={false}
    />
  );
}

/**
 * عکس فیگما از public/images/ — برای بنرها و پس‌زمینه‌ها
 */
export function FigImg({
  src,
  alt = "",
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      draggable={false}
      loading="lazy"
    />
  );
}
