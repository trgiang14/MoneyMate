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

export async function getExchangeRate(from: string, to: string) {
  if (from === to) return 1;
  
  try {
    // Sử dụng ExchangeRate-API (miễn phí, không cần key cho cặp cơ bản hoặc có thể dùng fallback)
    // Lưu ý: Trong thực tế nên dùng API Key và lưu vào .env
    const response = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    const data = await response.json();
    
    if (data.result === "success") {
      return data.rates[to] || 1;
    }
    return 1;
  } catch (error) {
    console.error("Lỗi khi lấy tỷ giá:", error);
    return 1;
  }
}
