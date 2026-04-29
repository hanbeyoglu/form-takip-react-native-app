import React from "react";
import { StyleSheet, Text } from "react-native";

import { useAppLocale } from "../../localization/useAppLocale";
import { colors, spacing, typography } from "../../theme/tokens";

type SectionTitleProps = {
  title: string;
};

export function SectionTitle({ title }: SectionTitleProps): React.JSX.Element {
  const { textAlign } = useAppLocale();
  return <Text style={[styles.title, { textAlign }]}>{title}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.sectionTitle,
    fontWeight: "700",
    letterSpacing: -0.2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.sm
  }
});
