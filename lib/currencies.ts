export const CURRENCIES = [
  { value: "VND", label: "Việt Nam Đồng (₫)", locale: "vi-VN" },
  { value: "USD", label: "Đô la Mỹ ($)", locale: "en-US" },
  { value: "EUR", label: "Euro (€)", locale: "de-DE" },
  { value: "JPY", label: "Yên Nhật (¥)", locale: "ja-JP" },
  { value: "KRW", label: "Won Hàn Quốc (₩)", locale: "ko-KR" },
];

export function formatCurrency(amount: number, currencyCode: string = "VND") {
  const currency = CURRENCIES.find((c) => c.value === currencyCode) || CURRENCIES[0];
  
  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.value,
    maximumFractionDigits: currency.value === "VND" ? 0 : 2,
  }).format(amount);
}
