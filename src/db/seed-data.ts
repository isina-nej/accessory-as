// از فیگما 708:439 + صفحه محصول (Details/Review)
const CATS = [
  ["necklace", "گردنبند"],
  ["ring", "انگشتر"],
  ["bracelet", "دستبند"],
  ["earring", "گوشواره"],
  ["anklet", "پابند"],
  ["half-set", "نیم‌ست"],
  ["full-set", "ست کامل"],
] as const;

const COLORS = ["طلایی", "صورتی", "نقره‌ای", "بنفش", "آبی", "سفید"];
const SIZES = ["20", "21", "22", "23", "24", "25"];

const DESC = (t: string) =>
  `این ${t} با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است.`;

type P = {
  slug: string; title: string; cat: string; price: number;
  old?: number; off?: number; stock: number; sku: string;
  colors: string[]; sizes: string[]; img: string;
  images?: string[];
};

// بازه فیلتر فیگما: ۲۵۰هزار تا ۲۵میلیون — عکس از public/images (فیگما)
const PRODUCTS: P[] = [
  {
    slug: "full-nagin-ring",
    title: "انگشتر فول نگین زنانه",
    cat: "ring",
    price: 4250000,
    old: 5312500,
    off: 20,
    stock: 12,
    sku: "WC009",
    colors: ["نقره‌ای", "طلایی"],
    sizes: ["20", "21", "22", "23", "24", "25"],
    img: "/images/product-01.webp",
    images: [
      "/images/product-details/product-main-ring.png",
      "/images/product-details/product-thumb-ring-plain.png",
      "/images/product-details/product-thumb-necklace.png",
      "/images/product-details/product-thumb-earring.png",
      "/images/product-details/product-thumb-bracelet.png",
    ],
  },
  { slug: "minimal-steel-ring", title: "انگشتر مینیمال استیل", cat: "ring", price: 1250000, stock: 30, sku: "WC011", colors: ["نقره‌ای"], sizes: ["20", "21", "22", "23", "24"], img: "/images/product-02.webp" },
  { slug: "gold-plated-ring", title: "انگشتر آبکاری طلا", cat: "ring", price: 2980000, old: 3500000, off: 15, stock: 0, sku: "WC012", colors: ["طلایی"], sizes: ["21", "22", "23"], img: "/images/product-03.webp" },
  { slug: "full-nagin-necklace", title: "گردنبند فول نگین زنانه", cat: "necklace", price: 5250000, old: 6562500, off: 20, stock: 5, sku: "WN007", colors: ["طلایی", "نقره‌ای"], sizes: [], img: "/images/product-04.webp" },
  { slug: "minimal-chain-necklace", title: "گردنبند زنجیری مینیمال", cat: "necklace", price: 1890000, stock: 18, sku: "WN008", colors: ["طلایی"], sizes: [], img: "/images/product-05.webp" },
  { slug: "pearl-necklace", title: "گردنبند مروارید", cat: "necklace", price: 7650000, stock: 3, sku: "WN009", colors: ["سفید"], sizes: [], img: "/images/product-06.webp" },
  { slug: "full-nagin-bracelet", title: "دستبند فول نگین", cat: "bracelet", price: 1870000, old: 2337500, off: 20, stock: 8, sku: "WB014", colors: ["طلایی", "نقره‌ای"], sizes: [], img: "/images/product-07.webp" },
  { slug: "cartier-bracelet", title: "دستبند کارتیر", cat: "bracelet", price: 2450000, stock: 10, sku: "WB015", colors: ["طلایی"], sizes: [], img: "/images/product-08.webp" },
  { slug: "bangle-bracelet", title: "دستبند النگویی", cat: "bracelet", price: 3980000, stock: 6, sku: "WB016", colors: ["طلایی"], sizes: [], img: "/images/product-09.webp" },
  { slug: "double-nagin-earring", title: "گوشواره دو عددی فول نگین", cat: "earring", price: 3050000, old: 3812500, off: 20, stock: 15, sku: "WE021", colors: ["نقره‌ای", "طلایی"], sizes: [], img: "/images/product-10.webp" },
  { slug: "hoop-earring", title: "گوشواره حلقه‌ای", cat: "earring", price: 1450000, stock: 22, sku: "WE022", colors: ["طلایی"], sizes: [], img: "/images/product-11.webp" },
  { slug: "pearl-drop-earring", title: "گوشواره مروارید آویز", cat: "earring", price: 2750000, stock: 7, sku: "WE023", colors: ["سفید"], sizes: [], img: "/images/product-12.webp" },
  { slug: "women-anklet", title: "پابند زنانه", cat: "anklet", price: 750000, stock: 20, sku: "WA031", colors: ["نقره‌ای"], sizes: [], img: "/images/product-13.webp" },
  { slug: "chain-anklet", title: "پابند زنجیری طلا", cat: "anklet", price: 1350000, stock: 14, sku: "WA032", colors: ["طلایی"], sizes: [], img: "/images/product-14.webp" },
  { slug: "minimal-anklet", title: "پابند مینیمال", cat: "anklet", price: 280000, stock: 40, sku: "WA033", colors: ["نقره‌ای", "صورتی"], sizes: [], img: "/images/product-13.webp" },
  { slug: "half-set-nagin", title: "نیم‌ست فول نگین", cat: "half-set", price: 6800000, old: 8500000, off: 20, stock: 4, sku: "WH041", colors: ["نقره‌ای"], sizes: [], img: "/images/cat-half-set.webp" },
  { slug: "half-set-pearl", title: "نیم‌ست مروارید", cat: "half-set", price: 9200000, stock: 2, sku: "WH042", colors: ["سفید", "طلایی"], sizes: [], img: "/images/cat-half-set.webp" },
  { slug: "full-set-nagin", title: "ست کامل فول نگین", cat: "full-set", price: 14800000, old: 16400000, off: 10, stock: 2, sku: "WF051", colors: ["نقره‌ای"], sizes: [], img: "/images/cat-full-set.webp" },
  { slug: "full-set-gold", title: "ست کامل طلا", cat: "full-set", price: 23500000, stock: 1, sku: "WF052", colors: ["طلایی"], sizes: [], img: "/images/cat-full-set.webp" },
  { slug: "full-set-minimal", title: "ست کامل مینیمال", cat: "full-set", price: 8950000, stock: 3, sku: "WF053", colors: ["نقره‌ای", "طلایی"], sizes: [], img: "/images/cat-full-set.webp" },
];

const SEED_REVIEWS: Record<string, { author: string; rating: number; body: string }[]> = {
  "full-nagin-ring": [
    { author: "حسین کاظمی", rating: 5, body: "کیفیت عالی و متریال استفاده شده بی‌نظیره." },
    { author: "سارا محمدی", rating: 5, body: "بسته‌بندی شیک و ارسال سریع. روی دست خیلی قشنگه." },
    { author: "نگار احمدی", rating: 4, body: "قشنگه ولی حتما راهنمای سایز رو ببینید، قالبش کمی کوچیکه." },
    { author: "امیر رضایی", rating: 5, body: "برای هدیه گرفتم، خیلی راضی بود. برق نگین‌ها عالیه." },
    { author: "مریم کریمی", rating: 4, body: "نسبت به قیمتش کیفیت خوبی داره. ممنون از پشتیبانی." },
  ],
  "full-nagin-necklace": [
    { author: "الهه صادقی", rating: 5, body: "زنجیرش محکمه و نگین‌ها تمیز کار شدن." },
    { author: "رضا مرادی", rating: 4, body: "خوبه، فقط جعبه‌اش می‌تونست شیک‌تر باشه." },
  ],
  "full-nagin-bracelet": [
    { author: "شیما نادری", rating: 5, body: "هم برای مهمونی هم روزمره مناسبه. راضیم." },
  ],
};


export { CATS, COLORS, SIZES, DESC, PRODUCTS, SEED_REVIEWS };
