import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppLocale } from "../../localization/useAppLocale";
import { colors, spacing, typography } from "../../theme/tokens";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({
  title,
  description
}: EmptyStateProps): React.JSX.Element {
  const { textAlign } = useAppLocale();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { textAlign }]}>{title}</Text>
      <Text style={[styles.description, { textAlign }]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xl
  },
  title: {
    fontSize: typography.sectionTitle,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.sm
  },
  description: {
    textAlign: "center",
    fontSize: typography.helper,
    lineHeight: 20,
    color: colors.textSecondary
  }
});
