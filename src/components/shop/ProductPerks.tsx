import { Icon } from "@/components/ui/Icon";

interface PerkItem {
  id: string;
  title: string;
  desc: string;
  descColor?: string;
  icon: string;
}

const PERKS: PerkItem[] = [
  {
    id: "shipping",
    title: "حمل و نقل رایــگان",
    desc: "برای خرید بالای ۵۰۰ هزار تومن",
    descColor: "text-[#4B5563]",
    icon: "icons-20--truck",
  },
  {
    id: "guarantee",
    title: "ضمانت بازگشــت کالا",
    desc: "۷ روز ضمانت بازگشت کالا",
    descColor: "text-[#0A5A55]",
    icon: "icons-20--repeat",
  },
  {
    id: "express",
    title: "تحویل اکسـپرس",
    desc: "تحویل سریع و بی تاخیر",
    descColor: "text-[#4B5563]",
    icon: "icons-20--shopping-bag",
  },
  {
    id: "premium",
    title: "کیفیت پرمیــوم",
    desc: "متریال‌ و کیفیت ساخت بی ‌نقص",
    descColor: "text-[#4B5563]",
    icon: "icons-20--diamond",
  },
];

export function ProductPerks() {
  return (
    <div className="box-border flex w-full flex-col justify-between gap-5 rounded-[10px] border border-[#D6DBDE] bg-white p-4 sm:gap-6 sm:p-6">
      <div className="grid w-full grid-cols-2 gap-4 sm:gap-6">
        {PERKS.map((perk) => (
          <div key={perk.id} className="flex min-w-0 flex-row items-center justify-end gap-2 text-right sm:gap-3">
            <div className="flex min-w-0 flex-col items-end justify-center">
              <span className="block max-w-full truncate text-[11px] font-bold leading-[18px] text-[#161B22] sm:text-[13px] sm:leading-[22px]">
                {perk.title}
              </span>
              <span className={`block max-w-full truncate text-[9px] font-medium leading-[16px] sm:text-[12px] sm:leading-[20px] ${perk.descColor ?? "text-[#4B5563]"}`}>
                {perk.desc}
              </span>
            </div>
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center sm:h-11 sm:w-11">
              <span
                className="pointer-events-none absolute inset-1 rounded-full"
                style={{
                  background:
                    "linear-gradient(149.32deg, rgba(215, 232, 231, 0) 14.89%, #D7E8E7 84.43%)",
                }}
              />
              <Icon name={perk.icon} className="relative z-10 h-5 w-5 text-[#01413E] sm:h-6 sm:w-6" alt="" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
