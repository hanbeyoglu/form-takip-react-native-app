import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "./locales/ar.json";
import de from "./locales/de.json";
import en from "./locales/en.json";
import tr from "./locales/tr.json";
import { fallbackLanguage } from "./config";

export const resources = {
  tr: { translation: tr },
  en: { translation: en },
  de: { translation: de },
  ar: { translation: ar }
} as const;

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    compatibilityJSON: "v4",
    resources,
    lng: fallbackLanguage,
    fallbackLng: fallbackLanguage,
    interpolation: {
      escapeValue: false
    }
  });
}

export { i18n };
