const TURKISH_MOBILE_REGEX = /^(\+90)?5\d{9}$/;

export function normalizePhoneNumber(input: string): string {
  const rawDigits = input.replace(/\D/g, "");
  const withoutLeadingZero = rawDigits.startsWith("0")
    ? rawDigits.slice(1)
    : rawDigits;
  const withCountryCode = withoutLeadingZero.startsWith("90")
    ? withoutLeadingZero
    : `90${withoutLeadingZero}`;
  return `+${withCountryCode}`;
}

export function isValidTurkishMobile(phoneNumber: string): boolean {
  return TURKISH_MOBILE_REGEX.test(phoneNumber);
}

export function formatTurkishPhoneInput(input: string): string {
  const digitsOnly = input.replace(/\D/g, "").slice(0, 10);
  const part1 = digitsOnly.slice(0, 3);
  const part2 = digitsOnly.slice(3, 6);
  const part3 = digitsOnly.slice(6, 8);
  const part4 = digitsOnly.slice(8, 10);
  return [part1, part2, part3, part4].filter(Boolean).join(" ");
}
