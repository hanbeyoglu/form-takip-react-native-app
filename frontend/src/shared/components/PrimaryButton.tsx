import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, shadows, spacing, typography } from "../../theme/tokens";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  isLoading = false,
  variant = "primary"
}: PrimaryButtonProps): React.JSX.Element {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.buttonBase,
        variant === "primary" ? styles.buttonPrimary : styles.buttonSecondary,
        variant === "ghost" ? styles.buttonGhost : null,
        variant === "danger" ? styles.buttonDanger : null,
        pressed && styles.pressed,
        (disabled || isLoading) && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {variant === "primary" ? (
        <>
          <View style={styles.primaryGradientBase} />
          <View style={styles.primaryGradientGlow} />
          <View style={styles.primaryGradientEdge} />
        </>
      ) : null}
      {variant === "danger" ? (
        <>
          <View style={styles.dangerGradientBase} />
          <View style={styles.dangerGradientGlow} />
        </>
      ) : null}
      {isLoading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "danger" ? colors.onPrimary : colors.primary
          }
        />
      ) : (
        <Text
          style={[
            variant === "primary" ? styles.labelPrimary : styles.labelSecondary,
            variant === "ghost" ? styles.labelGhost : null,
            variant === "danger" ? styles.labelDanger : null
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    minHeight: 54,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden"
  },
  buttonPrimary: {
    backgroundColor: colors.primaryDeep,
    borderColor: "rgba(91, 87, 232, 0.55)",
    ...shadows.shadowSmall
  },
  buttonSecondary: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderSoft
  },
  buttonGhost: {
    backgroundColor: "transparent",
    borderColor: colors.borderSoft
  },
  buttonDanger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
    ...shadows.shadowSmall
  },
  primaryGradientBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primaryDeep
  },
  primaryGradientGlow: {
    position: "absolute",
    left: -18,
    right: -18,
    top: -14,
    height: "72%",
    borderRadius: radius.xl,
    backgroundColor: colors.primaryGlow,
    opacity: 0.92
  },
  primaryGradientEdge: {
    position: "absolute",
    right: -18,
    top: 0,
    bottom: -6,
    width: "48%",
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    opacity: 0.72
  },
  dangerGradientBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.danger
  },
  dangerGradientGlow: {
    position: "absolute",
    left: -16,
    right: -8,
    top: -10,
    height: "68%",
    borderRadius: radius.xl,
    backgroundColor: "#EF6B7D",
    opacity: 0.45
  },
  labelPrimary: {
    color: colors.onPrimary,
    fontSize: typography.button,
    fontWeight: "700",
    letterSpacing: 0.2
  },
  labelSecondary: {
    color: colors.textPrimary,
    fontSize: typography.button,
    fontWeight: "700",
    letterSpacing: 0.2
  },
  labelGhost: {
    color: colors.primary
  },
  labelDanger: {
    color: colors.onPrimary
  },
  pressed: {
    opacity: 0.97,
    transform: [{ scale: 0.978 }]
  },
  disabled: {
    opacity: 0.45
  }
});
