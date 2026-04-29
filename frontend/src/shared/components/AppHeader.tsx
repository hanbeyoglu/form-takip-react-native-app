import React from "react";
import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppLocale } from "../../localization/useAppLocale";
import { colors, radius, shadows, spacing, typography } from "../../theme/tokens";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  rightActionLabel?: string;
  onRightActionPress?: () => void;
};

export function AppHeader({
  title,
  subtitle,
  showBackButton = false,
  rightActionLabel,
  onRightActionPress
}: AppHeaderProps): React.JSX.Element {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isRTL, textAlign } = useAppLocale();

  return (
    <View style={[styles.container, { marginTop: Math.max(insets.top * 0.25, 0) }]}>
      <View style={[styles.topRow, isRTL ? styles.topRowRtl : null]}>
        <View style={[styles.side, isRTL ? styles.sideRtl : null]}>
          {showBackButton ? (
            <Pressable
              style={({ pressed }) => [styles.backButton, pressed ? styles.pressed : null]}
              onPress={() => navigation.goBack()}
              hitSlop={8}
            >
              <Text style={styles.backIcon}>{isRTL ? "\u203a" : "\u2039"}</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={[styles.side, isRTL ? styles.sideRtl : null]}>
          {rightActionLabel && onRightActionPress ? (
            <Pressable
              style={({ pressed }) => [styles.rightAction, pressed ? styles.pressed : null]}
              onPress={onRightActionPress}
            >
              <Text style={styles.rightActionText}>{rightActionLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      <Text style={[styles.title, { textAlign }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { textAlign }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md
  },
  topRowRtl: {
    flexDirection: "row-reverse"
  },
  side: {
    minWidth: 88,
    alignItems: "flex-start"
  },
  sideRtl: {
    alignItems: "flex-end"
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.shadowSmall
  },
  backIcon: {
    color: colors.textPrimary,
    fontSize: 26,
    marginTop: -2,
    fontWeight: "700"
  },
  rightAction: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...shadows.shadowSmall
  },
  rightActionText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: typography.helper,
    letterSpacing: 0.2
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }]
  },
  title: {
    fontSize: typography.pageTitle,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.9,
    color: colors.textPrimary
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: typography.helper,
    lineHeight: 18,
    color: colors.textMuted
  }
});
