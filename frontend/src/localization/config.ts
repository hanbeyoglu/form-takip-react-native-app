export const supportedLanguages = ["tr", "en", "de", "ar"] as const;

export type AppLanguage = (typeof supportedLanguages)[number];

/** Dil kodu + yerel ad (endonym); çeviri dosyasından okunmaz, her dil kendi adıyla listelenir. */
export type LanguageOption = {
  code: AppLanguage;
  endonym: string;
};

export const languageOptions: readonly LanguageOption[] = [
  { code: "tr", endonym: "Türkçe" },
  { code: "en", endonym: "English" },
  { code: "de", endonym: "Deutsch" },
  { code: "ar", endonym: "العربية" }
];

export const fallbackLanguage: AppLanguage = "tr";

export const rtlLanguages: AppLanguage[] = ["ar"];

export function isSupportedLanguage(value: string): value is AppLanguage {
  return supportedLanguages.includes(value as AppLanguage);
}
