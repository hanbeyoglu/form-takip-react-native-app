import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppLocale } from "../../localization/useAppLocale";
import { colors, radius, spacing, typography } from "../../theme/tokens";

export type OptionChipItem<T extends string | number> = {
  label: string;
  value: T;
};

type OptionChipsProps<T extends string | number> = {
  label: string;
  options: OptionChipItem<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function OptionChips<T extends string | number>({
  label,
  options,
  value,
  onChange
}: OptionChipsProps<T>): React.JSX.Element {
  const { isRTL, textAlign } = useAppLocale();
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { textAlign }]}>{label}</Text>
      <View style={[styles.row, isRTL ? styles.rowRtl : null]}>
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <Pressable
              key={String(option.value)}
              onPress={() => onChange(option.value)}
              style={[styles.chip, isSelected ? styles.chipActive : null]}
            >
              <Text style={[styles.chipText, { textAlign }, isSelected ? styles.chipTextActive : null]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg
  },
  label: {
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.helper,
    fontWeight: "700",
    letterSpacing: 0.2
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  rowRtl: {
    flexDirection: "row-reverse"
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceElevated
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  chipText: {
    fontSize: typography.helper,
    color: colors.textPrimary
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: "700"
  }
});
