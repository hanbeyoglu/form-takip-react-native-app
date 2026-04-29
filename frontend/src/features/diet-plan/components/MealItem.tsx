import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppLocale } from "../../../localization/useAppLocale";
import { Card } from "../../../shared/components/Card";
import { MealItem as MealItemType } from "../../../types/diet-plan.types";
import { colors, spacing, typography } from "../../../theme/tokens";
import { formatReadablePlanDate } from "../../../shared/utils/mealApplicability";

type MealItemProps = {
  meal: MealItemType;
  isLast?: boolean;
};

export function MealItem({ meal, isLast = false }: MealItemProps): React.JSX.Element {
  const { t, language } = useAppLocale();
  const applicabilityText =
    meal.appliesToType === "selected_dates" && (meal.appliesToDates?.length ?? 0) > 0
      ? meal.appliesToDates!.map((date) => formatReadablePlanDate(date, language)).join(" • ")
      : t("plans.mealEveryDay");

  return (
    <Card style={[styles.container, !isLast ? styles.withSpacing : null]} variant="muted">
      <View style={styles.row}>
        <View style={styles.timePill}>
          <Text style={styles.time}>{meal.time}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{meal.name}</Text>
          <Text style={styles.order}>{t("plans.mealOrder", { order: meal.order })}</Text>
        </View>
      </View>
      <Text style={styles.applicability}>{applicabilityText}</Text>
      {meal.note ? <Text style={styles.note}>{meal.note}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg
  },
  withSpacing: {
    marginBottom: spacing.sm
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  content: {
    flex: 1
  },
  timePill: {
    minWidth: 68,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  order: {
    color: colors.textMuted,
    fontSize: typography.caption,
    marginTop: spacing.xs
  },
  name: {
    fontSize: typography.body,
    color: colors.textPrimary,
    fontWeight: "700"
  },
  time: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: typography.caption,
    textAlign: "center"
  },
  note: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.helper,
    lineHeight: 19
  },
  applicability: {
    marginTop: spacing.md,
    color: colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 17
  }
});
