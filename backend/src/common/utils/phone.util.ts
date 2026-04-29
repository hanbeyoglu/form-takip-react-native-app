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
