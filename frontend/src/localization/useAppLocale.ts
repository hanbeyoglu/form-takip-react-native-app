import React from "react";
import type { TOptions } from "i18next";
import { useTranslation } from "react-i18next";

import { fallbackLanguage } from "./config";
import { resources } from "./i18n";
import { useLocalizationStore } from "../store/localization.store";

export function useAppLocale() {
  const { t: rawT, i18n } = useTranslation();
  const language = useLocalizationStore((state) => state.language);
  const isRTL = useLocalizationStore((state) => state.isRTL);

  const t = React.useCallback(
    (key: string, options?: TOptions): string => {
      if (i18n.exists(key, options)) {
        return rawT(key, options);
      }

      const fallbackValue = rawT(key, {
        lng: fallbackLanguage,
        ...options
      });
      if (fallbackValue !== key) {
        return fallbackValue;
      }

      if (typeof options?.defaultValue === "string" && options.defaultValue.length > 0) {
        return options.defaultValue;
      }

      const fallbackTree = resources[fallbackLanguage]?.translation as Record<string, unknown>;
      const leaf = key.split(".").reduce<unknown>((acc, part) => {
        if (typeof acc === "object" && acc !== null && part in acc) {
          return (acc as Record<string, unknown>)[part];
        }
        return undefined;
      }, fallbackTree);

      if (typeof leaf === "string" && leaf.length > 0) {
        return leaf;
      }

      return "";
    },
    [i18n, rawT]
  );

  const formatNumber = React.useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string =>
      new Intl.NumberFormat(language, options).format(value),
    [language]
  );

  const formatDate = React.useCallback(
    (value: Date | string, options?: Intl.DateTimeFormatOptions): string => {
      const date = typeof value === "string" ? new Date(value) : value;
      return new Intl.DateTimeFormat(language, options).format(date);
    },
    [language]
  );

  const formatTime = React.useCallback(
    (value: Date | string, options?: Intl.DateTimeFormatOptions): string => {
      const date = typeof value === "string" ? new Date(value) : value;
      return new Intl.DateTimeFormat(language, {
        hour: "2-digit",
        minute: "2-digit",
        ...options
      }).format(date);
    },
    [language]
  );

  return {
    t,
    i18n,
    language,
    isRTL,
    textAlign: isRTL ? ("right" as const) : ("left" as const),
    rowDirection: isRTL ? ("row-reverse" as const) : ("row" as const),
    formatNumber,
    formatDate,
    formatTime
  };
}
