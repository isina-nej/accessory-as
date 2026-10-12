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
    <div className="box-border w-full bg-white border border-[#D6DBDE] rounded-[10px] p-6 flex flex-col justify-between gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {PERKS.map((perk) => (
          <div key={perk.id} className="flex flex-row items-center justify-end gap-3 text-right">
            <div className="flex flex-col justify-center items-end">
              <span className="text-[13px] font-bold text-[#161B22] leading-[22px]">
                {perk.title}
              </span>
              <span className={`text-[12px] font-medium leading-[20px] ${perk.descColor ?? "text-[#4B5563]"}`}>
                {perk.desc}
              </span>
            </div>
            <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
              <span
                className="absolute inset-1 rounded-full pointer-events-none"
                style={{
                  background:
                    "linear-gradient(149.32deg, rgba(215, 232, 231, 0) 14.89%, #D7E8E7 84.43%)",
                }}
              />
              <Icon name={perk.icon} className="relative z-10 w-6 h-6 text-[#01413E]" alt="" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
