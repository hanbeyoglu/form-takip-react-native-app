import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";

import { AppHeader } from "../../../shared/components/AppHeader";
import { Card } from "../../../shared/components/Card";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { languageOptions } from "../../../localization/config";
import { useAppLocale } from "../../../localization/useAppLocale";
import { useLocalizationStore } from "../../../store/localization.store";
import { colors, spacing, typography } from "../../../theme/tokens";

export function LanguageSettingsScreen(): React.JSX.Element {
  const { t, language, textAlign } = useAppLocale();
  const setLanguage = useLocalizationStore((state) => state.setLanguage);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title={t("profile.languageTitle")}
          subtitle={t("profile.languageSubtitle")}
          showBackButton
        />
        <Card style={styles.heroCard} variant="elevated">
          <Text style={[styles.heroTitle, { textAlign }]}>{t("profile.languageCardTitle")}</Text>
          <Text style={[styles.heroText, { textAlign }]}>{t("profile.languageCardText")}</Text>
        </Card>
        <View style={styles.stack} accessibilityRole="radiogroup">
          {languageOptions.map((option) => {
            const isSelected = option.code === language;
            return (
              <Pressable
                key={option.code}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                onPress={() => void setLanguage(option.code)}
              >
                <Card style={styles.languageCard} variant={isSelected ? "elevated" : "muted"}>
                  <View style={styles.languageRow}>
                    <View style={styles.languageCopy}>
                      <Text style={[styles.languageLabel, { textAlign }]}>{option.endonym}</Text>
                      <Text style={[styles.languageHint, { textAlign }]}>
                        {option.code.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.checkSlot} pointerEvents="none">
                      {isSelected ? (
                        <Check color={colors.primary} size={22} strokeWidth={2.5} />
                      ) : null}
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl
  },
  heroCard: {
    marginBottom: spacing.lg
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: "800"
  },
  heroText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.helper,
    lineHeight: 20
  },
  stack: {
    gap: spacing.sm
  },
  languageCard: {
    paddingVertical: spacing.lg
  },
  languageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md
  },
  languageCopy: {
    flex: 1
  },
  languageLabel: {
    color: colors.textPrimary,
    fontSize: typography.bodyStrong,
    fontWeight: "700"
  },
  languageHint: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700"
  },
  checkSlot: {
    minWidth: 28,
    minHeight: 28,
    alignItems: "center",
    justifyContent: "center"
  }
});
