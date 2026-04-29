import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AppStackParamList } from "../../../app/navigation/types";
import { useAppLocale } from "../../../localization/useAppLocale";
import { AppHeader } from "../../../shared/components/AppHeader";
import { Card } from "../../../shared/components/Card";
import { DietPlanCard } from "../components/DietPlanCard";
import { EmptyPlanState } from "../components/EmptyPlanState";
import { MealList } from "../components/MealList";
import { PrimaryButton } from "../../../shared/components/PrimaryButton";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { LoadingState } from "../../../shared/components/LoadingState";
import { useDietPlanStore } from "../../../store/dietPlan.store";
import { colors, spacing, typography } from "../../../theme/tokens";
import { formatLocalDate, mealAppliesOnDate } from "../../../shared/utils/mealApplicability";

type Props = NativeStackScreenProps<AppStackParamList, "ActiveDietPlan">;

export function ActiveDietPlanScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useAppLocale();
  const activePlan = useDietPlanStore((state) => state.activePlan);
  const isLoading = useDietPlanStore((state) => state.isLoading);
  const error = useDietPlanStore((state) => state.error);
  const fetchActivePlan = useDietPlanStore((state) => state.fetchActivePlan);

  React.useEffect(() => {
    void fetchActivePlan();
  }, [fetchActivePlan]);

  const todayDate = formatLocalDate(new Date());
  const todaysMeals = activePlan?.meals.filter((meal) => mealAppliesOnDate(meal, todayDate)) ?? [];

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title={t("plans.activeTitle")}
          subtitle={t("plans.activeSubtitle")}
          showBackButton
          rightActionLabel={t("plans.historyAction")}
          onRightActionPress={() => navigation.navigate("PlanHistory")}
        />
        {isLoading ? <LoadingState /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!isLoading && !activePlan ? <EmptyPlanState /> : null}
        {activePlan ? (
          <>
            <Card style={styles.overviewCard} variant="elevated">
              <Text style={styles.overviewKicker}>{t("plans.overviewKicker")}</Text>
              <Text style={styles.overviewTitle}>{activePlan.title}</Text>
              <Text style={styles.overviewText}>{t("plans.overviewText", { count: todaysMeals.length })}</Text>
            </Card>
            <DietPlanCard plan={activePlan} />
            <MealList meals={todaysMeals} />
            <View style={styles.actionStack}>
              <PrimaryButton
                label={t("plans.editPlan")}
                onPress={() => navigation.navigate("EditDietPlan", { planId: activePlan.id })}
              />
              <PrimaryButton
                label={t("plans.newPlan")}
                variant="secondary"
                onPress={() => navigation.navigate("AddDietPlan")}
              />
            </View>
          </>
        ) : null}
        {!activePlan && !isLoading ? (
          <PrimaryButton label={t("plans.newPlan")} onPress={() => navigation.navigate("AddDietPlan")} />
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl
  },
  overviewCard: {
    marginBottom: spacing.lg
  },
  overviewKicker: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 0.6
  },
  overviewTitle: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: "800"
  },
  overviewText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.helper,
    lineHeight: 20
  },
  error: {
    marginBottom: spacing.md,
    color: colors.danger,
    fontSize: typography.caption
  },
  actionStack: {
    gap: spacing.sm
  }
});
