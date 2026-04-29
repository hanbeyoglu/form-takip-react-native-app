import { DefaultTheme, Theme } from "@react-navigation/native";

import { colors } from "./tokens";

export const appTheme: {
  navigation: Theme;
} = {
  navigation: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surfaceElevated,
      text: colors.textPrimary,
      border: colors.borderSoft
    }
  }
};
