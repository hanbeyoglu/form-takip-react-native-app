import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { colors, radius, shadows, spacing } from "../../theme/tokens";

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: "default" | "muted" | "elevated";
};

export function Card({
  children,
  style,
  variant = "default"
}: CardProps): React.JSX.Element {
  return (
    <View
      style={[
        styles.card,
        variant === "muted" ? styles.cardMuted : null,
        variant === "elevated" ? styles.cardElevated : null,
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl2,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadows.shadowCard
  },
  cardMuted: {
    backgroundColor: colors.surfaceMuted,
    borderColor: "rgba(223, 229, 242, 0.8)",
    ...shadows.shadowSmall
  },
  cardElevated: {
    backgroundColor: colors.surfaceElevated,
    ...shadows.shadowHero
  }
});
