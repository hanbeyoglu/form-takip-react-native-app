import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppLocale } from "../../../localization/useAppLocale";
import { Card } from "../../../shared/components/Card";
import { DietPlan } from "../../../types/diet-plan.types";
import { colors, radius, spacing, typography } from "../../../theme/tokens";

type DietPlanCardProps = {
  plan: DietPlan;
};

export function DietPlanCard({ plan }: DietPlanCardProps): React.JSX.Element {
  const { t, formatDate } = useAppLocale();
  return (
    <Card style={styles.card} variant="elevated">
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{plan.status === "active" ? t("plans.card.active") : t("plans.card.archive")}</Text>
        </View>
        <Text style={styles.version}>v{plan.version}</Text>
      </View>
      <Text style={styles.title}>{plan.title}</Text>
      <Text style={styles.dateRange}>
        {formatDate(plan.weekStartDate)} - {formatDate(plan.weekEndDate)}
      </Text>
      <View style={styles.metaRow}>
        <View style={styles.metaPill}>
          <Text style={styles.metaLabel}>{t("plans.card.meal")}</Text>
          <Text style={styles.metaValue}>{plan.meals.length}</Text>
        </View>
        <View style={styles.metaPill}>
          <Text style={styles.metaLabel}>{t("plans.card.status")}</Text>
          <Text style={styles.metaValue}>{plan.status === "active" ? t("plans.card.ongoing") : t("plans.card.archived")}</Text>
        </View>
      </View>
      {plan.notes ? <Text style={styles.notes}>{plan.notes}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md
  },
  badge: {
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  badgeText: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  title: {
    fontSize: typography.title,
    fontWeight: "800",
    letterSpacing: -0.3,
    color: colors.textPrimary
  },
  version: {
    color: colors.textMuted,
    fontSize: typography.helper,
    fontWeight: "700"
  },
  dateRange: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.helper
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  metaPill: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "700",
    marginBottom: spacing.xs
  },
  metaValue: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: "700"
  },
  notes: {
    marginTop: spacing.lg,
    color: colors.textSecondary,
    fontSize: typography.helper,
    lineHeight: 20
  }
});
