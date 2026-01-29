// Complete Currency Mapping for Bank Account Form
// Use this in apps/seller-ui/src/shared/modules/auth/bank-account-form.tsx

export const currencyMap: Record<string, string> = {
  // Asia
  IN: "INR", // India
  PK: "PKR", // Pakistan
  BD: "BDT", // Bangladesh
  LK: "LKR", // Sri Lanka
  NP: "NPR", // Nepal
  SG: "SGD", // Singapore
  MY: "MYR", // Malaysia
  TH: "THB", // Thailand
  PH: "PHP", // Philippines
  ID: "IDR", // Indonesia
  VN: "VND", // Vietnam
  JP: "JPY", // Japan
  CN: "CNY", // China
  HK: "HKD", // Hong Kong
  TW: "TWD", // Taiwan
  KR: "KRW", // South Korea

  // Middle East & Africa
  AE: "AED", // United Arab Emirates
  SA: "SAR", // Saudi Arabia
  QA: "QAR", // Qatar
  KW: "KWD", // Kuwait
  OM: "OMR", // Oman
  JO: "JOD", // Jordan
  EG: "EGP", // Egypt
  ZA: "ZAR", // South Africa
  NG: "NGN", // Nigeria
  KE: "KES", // Kenya

  // Europe
  GB: "GBP", // United Kingdom
  EU: "EUR", // European Union
  DE: "EUR", // Germany
  FR: "EUR", // France
  IT: "EUR", // Italy
  ES: "EUR", // Spain
  NL: "EUR", // Netherlands
  SE: "SEK", // Sweden
  NO: "NOK", // Norway
  CH: "CHF", // Switzerland
  PL: "PLN", // Poland
  CZ: "CZK", // Czech Republic
  RU: "RUB", // Russia
  TR: "TRY", // Turkey

  // Americas
  US: "USD", // United States
  CA: "CAD", // Canada
  MX: "MXN", // Mexico
  BR: "BRL", // Brazil
  AR: "ARS", // Argentina
  CL: "CLP", // Chile
  CO: "COP", // Colombia
  PE: "PEN", // Peru

  // Oceania
  AU: "AUD", // Australia
  NZ: "NZD", // New Zealand
};

// Usage:
// const currency = currencyMap[selectedCountry] || "USD";
