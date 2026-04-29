import { zodResolver } from "@hookform/resolvers/zod";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { useForm } from "react-hook-form";
import { ScrollView, StyleSheet, Text } from "react-native";
import { z } from "zod";

import { AppStackParamList } from "../../../app/navigation/types";
import { useAppLocale } from "../../../localization/useAppLocale";
import { AppHeader } from "../../../shared/components/AppHeader";
import { Card } from "../../../shared/components/Card";
import { FormDatePickerField } from "../../../shared/components/FormDatePickerField";
import { FormTextField } from "../../../shared/components/FormTextField";
import { MealEditorSection } from "../components/MealEditorSection";
import { MealList } from "../components/MealList";
import { PrimaryButton } from "../../../shared/components/PrimaryButton";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { useDietPlanStore } from "../../../store/dietPlan.store";
import { MealInput, MealItem } from "../../../types/diet-plan.types";
import { colors, spacing, typography } from "../../../theme/tokens";

const schema = z.object({
  title: z.string().min(2),
  weekStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  weekEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional()
});

type FormValues = z.infer<typeof schema>;
type Props = NativeStackScreenProps<AppStackParamList, "EditDietPlan">;

export function EditDietPlanScreen({ route, navigation }: Props): React.JSX.Element {
  const { t } = useAppLocale();
  const selectedPlan = useDietPlanStore((state) => state.selectedPlan);
  const fetchPlanById = useDietPlanStore((state) => state.fetchPlanById);
  const updatePlan = useDietPlanStore((state) => state.updatePlan);
  const isLoading = useDietPlanStore((state) => state.isLoading);
  const [error, setError] = React.useState<string | null>(null);
  const [localMeals, setLocalMeals] = React.useState<MealItem[]>([]);
  const { control, handleSubmit, reset, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      weekStartDate: new Date().toISOString().slice(0, 10),
      weekEndDate: new Date().toISOString().slice(0, 10),
      notes: ""
    }
  });
  const weekStartDate = watch("weekStartDate");
  const weekEndDate = watch("weekEndDate");

  React.useEffect(() => {
    void fetchPlanById(route.params.planId);
  }, [fetchPlanById, route.params.planId]);

  React.useEffect(() => {
    if (selectedPlan?.id === route.params.planId) {
      setLocalMeals(selectedPlan.meals);
      reset({
        title: selectedPlan.title,
        weekStartDate: selectedPlan.weekStartDate,
        weekEndDate: selectedPlan.weekEndDate,
        notes: selectedPlan.notes ?? ""
      });
    }
  }, [route.params.planId, selectedPlan]);

  const toMinuteOfDay = (time: string): number => {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
  };

  const normalizeMealOrders = (items: MealItem[]): MealItem[] => {
    return [...items]
      .sort((a, b) => {
        const timeDiff = toMinuteOfDay(a.time) - toMinuteOfDay(b.time);
        if (timeDiff !== 0) {
          return timeDiff;
        }
        return a.name.localeCompare(b.name, "tr");
      })
      .map((meal, index) => ({
        ...meal,
        order: index + 1
      }));
  };

  const addLocalMeal = (meal: MealInput): void => {
    const tempMeal: MealItem = {
      mealId: `local-${Date.now()}-${Math.random()}`,
      ...meal
    };
    setLocalMeals((prev) => normalizeMealOrders([...prev, tempMeal]));
  };

  const submit = async (form: FormValues): Promise<void> => {
    try {
      await updatePlan(route.params.planId, {
        title: form.title.trim(),
        weekStartDate: form.weekStartDate,
        weekEndDate: form.weekEndDate,
        notes: form.notes?.trim(),
        meals: localMeals.map((meal) => ({
          mealId: meal.mealId.startsWith("local-") ? undefined : meal.mealId,
          name: meal.name,
          time: meal.time,
          note: meal.note,
          order: meal.order,
          appliesToType: meal.appliesToType,
          appliesToDates: meal.appliesToDates
        }))
      });
      navigation.replace("DietPlanDetail", { planId: route.params.planId });
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : t("dietPlanForm.validation.updateFailed")
      );
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title={t("dietPlanForm.editTitle")}
          subtitle={t("dietPlanForm.editSubtitle")}
          showBackButton
        />
        <Card style={styles.heroCard} variant="elevated">
          <Text style={styles.heroKicker}>{t("dietPlanForm.editHeroKicker")}</Text>
          <Text style={styles.heroTitle}>{t("dietPlanForm.editHeroTitle")}</Text>
          <Text style={styles.heroText}>{t("dietPlanForm.editHeroText")}</Text>
        </Card>
        <Card style={styles.sectionCard}>
          <FormTextField<FormValues> control={control} name="title" label={t("dietPlanForm.title")} />
          <FormDatePickerField<FormValues>
            control={control}
            name="weekStartDate"
            label={t("dietPlanForm.startDate")}
          />
          <FormDatePickerField<FormValues>
            control={control}
            name="weekEndDate"
            label={t("dietPlanForm.endDate")}
          />
          <FormTextField<FormValues> control={control} name="notes" label={t("dietPlanForm.notes")} />
        </Card>
        <MealEditorSection
          meals={localMeals}
          onAddMeal={addLocalMeal}
          weekStartDate={weekStartDate}
          weekEndDate={weekEndDate}
        />
        <MealList meals={localMeals} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label={t("dietPlanForm.editFinish")}
          isLoading={isLoading}
          onPress={() => {
            void handleSubmit(submit)();
          }}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  heroCard: {
    marginBottom: spacing.lg,
  },
  heroKicker: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '800',
  },
  heroText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.helper,
    lineHeight: 20,
  },
  sectionCard: {
    marginBottom: spacing.lg,
  },
  error: {
    marginVertical: spacing.md,
    color: colors.danger,
    fontSize: typography.caption
  }
});
