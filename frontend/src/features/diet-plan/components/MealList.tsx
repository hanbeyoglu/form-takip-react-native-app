import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppLocale } from "../../../localization/useAppLocale";
import { SectionTitle } from "../../../shared/components/SectionTitle";
import { MealItem as MealItemType } from "../../../types/diet-plan.types";
import { colors, spacing, typography } from "../../../theme/tokens";
import { MealItem } from "./MealItem";

type MealListProps = {
  meals: MealItemType[];
};

export function MealList({ meals }: MealListProps): React.JSX.Element {
  const { t } = useAppLocale();
  const sortedMeals = meals.slice().sort((a, b) => a.order - b.order);
  return (
    <View style={styles.container}>
      <SectionTitle title={t("plans.mealListTitle")} />
      {sortedMeals.length === 0 ? (
        <Text style={styles.emptyText}>{t("plans.mealListEmpty")}</Text>
      ) : null}
      {sortedMeals.map((meal, index) => (
        <MealItem key={meal.mealId} meal={meal} isLast={index === sortedMeals.length - 1} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl
  },
  emptyText: {
    marginBottom: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.helper,
    lineHeight: 20
  }
});
