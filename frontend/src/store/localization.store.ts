import { create } from "zustand";
import { NativeModules, Platform } from "react-native";

import { storageService } from "../services/storage/storage.service";
import { AppLanguage, fallbackLanguage, isSupportedLanguage, rtlLanguages } from "../localization/config";
import { i18n } from "../localization/i18n";

const LANGUAGE_STORAGE_KEY = "app.language";

type LocalizationState = {
  language: AppLanguage;
  isRTL: boolean;
  isReady: boolean;
  initializeLanguage: () => Promise<void>;
  setLanguage: (language: AppLanguage) => Promise<void>;
};

function getBestAvailableLocale(): string | undefined {
  const settingsManager = NativeModules.SettingsManager as
    | {
        settings?: {
          AppleLocale?: string;
          AppleLanguages?: string[];
        };
      }
    | undefined;

  if (Platform.OS === "ios") {
    const appleLocale = settingsManager?.settings?.AppleLocale;
    if (appleLocale) {
      return appleLocale;
    }

    const appleLanguage = settingsManager?.settings?.AppleLanguages?.[0];
    if (appleLanguage) {
      return appleLanguage;
    }
  }

  const localeFromIntl = Intl.DateTimeFormat().resolvedOptions().locale;
  if (localeFromIntl) {
    return localeFromIntl;
  }

  return undefined;
}

function resolveDeviceLanguage(): AppLanguage {
  const rawLocale = getBestAvailableLocale();
  const candidate = rawLocale?.split(/[-_]/)[0]?.toLowerCase() ?? fallbackLanguage;
  return isSupportedLanguage(candidate) ? candidate : fallbackLanguage;
}

export const useLocalizationStore = create<LocalizationState>((set) => ({
  language: fallbackLanguage,
  isRTL: rtlLanguages.includes(fallbackLanguage),
  isReady: false,
  initializeLanguage: async () => {
    const storedLanguage = await storageService.getItem(LANGUAGE_STORAGE_KEY);
    const nextLanguage =
      storedLanguage && isSupportedLanguage(storedLanguage)
        ? storedLanguage
        : resolveDeviceLanguage();

    await i18n.changeLanguage(nextLanguage);
    set({
      language: nextLanguage,
      isRTL: rtlLanguages.includes(nextLanguage),
      isReady: true
    });
  },
  setLanguage: async (language) => {
    await storageService.setItem(LANGUAGE_STORAGE_KEY, language);
    await i18n.changeLanguage(language);
    set({
      language,
      isRTL: rtlLanguages.includes(language)
    });
  }
}));
