import { ChevronDown } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppLocale } from "../../../localization/useAppLocale";
import { colors, radius, spacing, typography } from "../../../theme/tokens";

type ProfileFieldButtonProps = {
  label: string;
  displayValue: string;
  placeholder: string;
  onPress: () => void;
  errorMessage?: string;
  helperText?: string;
};

export function ProfileFieldButton({
  label,
  displayValue,
  placeholder,
  onPress,
  errorMessage,
  helperText
}: ProfileFieldButtonProps): React.JSX.Element {
  const { textAlign, isRTL } = useAppLocale();
  const hasValue = displayValue.trim().length > 0;
  const shown = hasValue ? displayValue : placeholder;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { textAlign }]}>{label}</Text>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.box,
          pressed ? styles.boxPressed : null,
          errorMessage ? styles.boxError : null
        ]}
        accessibilityRole="button"
      >
        <View style={[styles.inner, isRTL ? styles.innerRtl : null]}>
          <Text style={[styles.value, { textAlign }, !hasValue ? styles.placeholder : null]} numberOfLines={1}>
            {shown}
          </Text>
          <ChevronDown color={colors.textMuted} size={20} strokeWidth={2.2} />
        </View>
      </Pressable>
      {!errorMessage && helperText ? (
        <Text style={[styles.helper, { textAlign }]}>{helperText}</Text>
      ) : null}
      {errorMessage ? (
        <Text style={[styles.error, { textAlign }]}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0
  },
  label: {
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.helper,
    fontWeight: "700",
    letterSpacing: 0.2
  },
  box: {
    minHeight: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.lg,
    justifyContent: "center"
  },
  boxPressed: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2
  },
  boxError: {
    borderColor: colors.danger
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  innerRtl: {
    flexDirection: "row-reverse"
  },
  value: {
    flex: 1,
    fontSize: typography.body,
    color: colors.textPrimary,
    fontWeight: "600"
  },
  placeholder: {
    color: colors.textMuted,
    fontWeight: "500"
  },
  helper: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    color: colors.textSecondary,
    lineHeight: 18
  },
  error: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    color: colors.danger
  }
});
