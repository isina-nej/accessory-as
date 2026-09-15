const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function toFa(input: number | string): string {
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[+d]);
}

export function formatToman(n: number): string {
  return `${toFa(n.toLocaleString("en-US"))} تومن`;
}

export function tomanToRial(toman: number): number {
  return toman * 10;
}
