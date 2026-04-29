import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AppStackParamList } from "../../../app/navigation/types";
import { useAppLocale } from "../../../localization/useAppLocale";
import { AppHeader } from "../../../shared/components/AppHeader";
import { Card } from "../../../shared/components/Card";
import { DietPlanCard } from "../components/DietPlanCard";
import { MealList } from "../components/MealList";
import { PrimaryButton } from "../../../shared/components/PrimaryButton";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { LoadingState } from "../../../shared/components/LoadingState";
import { useDietPlanStore } from "../../../store/dietPlan.store";
import { colors, spacing, typography } from "../../../theme/tokens";

type Props = NativeStackScreenProps<AppStackParamList, "DietPlanDetail">;

export function DietPlanDetailScreen({ route, navigation }: Props): React.JSX.Element {
  const { t } = useAppLocale();
  const selectedPlan = useDietPlanStore((state) => state.selectedPlan);
  const fetchPlanById = useDietPlanStore((state) => state.fetchPlanById);
  const activatePlan = useDietPlanStore((state) => state.activatePlan);
  const isLoading = useDietPlanStore((state) => state.isLoading);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    void fetchPlanById(route.params.planId);
  }, [fetchPlanById, route.params.planId]);

  const handleActivate = async (): Promise<void> => {
    try {
      await activatePlan(route.params.planId);
      await fetchPlanById(route.params.planId);
    } catch (activationError) {
      setError(
        activationError instanceof Error ? activationError.message : t("plans.activateFailed")
      );
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title={t("plans.detailTitle")} subtitle={t("plans.detailSubtitle")} showBackButton />
        {isLoading ? <LoadingState /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {selectedPlan ? (
          <>
            <Card style={styles.infoCard} variant="elevated">
              <Text style={styles.infoKicker}>{t("plans.detailKicker")}</Text>
              <Text style={styles.infoTitle}>{selectedPlan.title}</Text>
              <Text style={styles.infoText}>{t("plans.detailText")}</Text>
            </Card>
            <DietPlanCard plan={selectedPlan} />
            <MealList meals={selectedPlan.meals} />
            <View style={styles.actionStack}>
              <PrimaryButton
                label={t("plans.editPlan")}
                onPress={() => navigation.navigate("EditDietPlan", { planId: selectedPlan.id })}
              />
              {selectedPlan.status === "archived" ? (
                <PrimaryButton label={t("plans.activate")} variant="secondary" onPress={() => void handleActivate()} />
              ) : null}
            </View>
          </>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl
  },
  infoCard: {
    marginBottom: spacing.lg
  },
  infoKicker: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 0.6
  },
  infoTitle: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: "800"
  },
  infoText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.helper,
    lineHeight: 20
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
    fontSize: typography.caption
  },
  actionStack: {
    gap: spacing.sm
  }
});
