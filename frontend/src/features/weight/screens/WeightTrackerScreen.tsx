import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { FlatList, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { z } from "zod";

import { useAppLocale } from "../../../localization/useAppLocale";
import { AppHeader } from "../../../shared/components/AppHeader";
import { Card } from "../../../shared/components/Card";
import { FormTextField } from "../../../shared/components/FormTextField";
import { LoadingState } from "../../../shared/components/LoadingState";
import { PrimaryButton } from "../../../shared/components/PrimaryButton";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { SectionTitle } from "../../../shared/components/SectionTitle";
import { useWeightStore } from "../../../store/weight.store";
import { colors, radius, spacing, typography } from "../../../theme/tokens";

type FormValues = { weightKg: number; note?: string };

export function WeightTrackerScreen(): React.JSX.Element {
  const { t, formatDate } = useAppLocale();
  const { width } = useWindowDimensions();
  const schema = React.useMemo(
    () =>
      z.object({
        weightKg: z.coerce.number().min(30).max(350),
        note: z.string().optional()
      }),
    []
  );
  const logs = useWeightStore((state) => state.logs);
  const isLoading = useWeightStore((state) => state.isLoading);
  const error = useWeightStore((state) => state.error);
  const fetchLogs = useWeightStore((state) => state.fetchLogs);
  const addLog = useWeightStore((state) => state.addLog);
  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      weightKg: undefined,
      note: ""
    }
  });

  React.useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const latest = logs.length > 0 ? logs[0] : null;
  const earliest = logs.length > 1 ? logs[logs.length - 1] : null;
  const trend = latest && earliest ? Number((latest.weightKg - earliest.weightKg).toFixed(2)) : 0;
  const isWide = width >= 420;

  React.useEffect(() => {
    if (latest) {
      reset({ weightKg: latest.weightKg, note: "" });
    }
  }, [latest, reset]);

  const submit = async (values: FormValues): Promise<void> => {
    await addLog({ weightKg: values.weightKg, note: values.note?.trim() });
    reset({ weightKg: values.weightKg, note: "" });
  };

  return (
    <ScreenContainer>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <AppHeader title={t("weightTracker.title")} subtitle={t("weightTracker.subtitle")} showBackButton />
            <View style={styles.summaryRow}>
              <Card style={[styles.summaryCard, isWide ? styles.summaryCardWide : null]} variant="elevated">
                <Text style={styles.summaryLabel}>{t("weightTracker.latest")}</Text>
                <Text style={styles.summaryMetric}>{latest ? `${latest.weightKg}` : "-"}</Text>
                <Text style={styles.summaryUnit}>kg</Text>
              </Card>
              <Card style={[styles.summaryCard, isWide ? styles.summaryCardWide : null]} variant="muted">
                <Text style={styles.summaryLabel}>{t("weightTracker.trend")}</Text>
                <Text style={styles.summaryMetric}>{latest && earliest ? `${trend}` : "-"}</Text>
                <Text style={styles.summaryUnit}>kg</Text>
              </Card>
            </View>

            <SectionTitle title={t("weightTracker.newEntry")} />
            <Card style={styles.formCard} variant="elevated">
              <Text style={styles.formIntroTitle}>{t("weightTracker.introTitle")}</Text>
              <Text style={styles.formIntroText}>{t("weightTracker.introText")}</Text>
              <FormTextField<FormValues>
                control={control}
                name="weightKg"
                label={t("weightTracker.weightLabel")}
                placeholder="Orn. 72.4"
                keyboardType="numeric"
                returnKeyType="done"
                selectTextOnFocus
              />
              <FormTextField<FormValues>
                control={control}
                name="note"
                label={t("weightTracker.noteLabel")}
                helperText={t("weightTracker.noteHelper")}
              />
              <PrimaryButton
                label={t("weightTracker.save")}
                onPress={() => {
                  void handleSubmit(submit)();
                }}
              />
            </Card>
            {isLoading ? <LoadingState /> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <SectionTitle title={t("weightTracker.history")} />
          </>
        }
        renderItem={({ item }) => (
          <Card style={styles.itemCard} variant="muted">
            <View style={styles.itemTopRow}>
              <Text style={styles.itemWeight}>{item.weightKg} kg</Text>
              <Text style={styles.itemDate}>
                {formatDate(item.loggedAt)}
              </Text>
            </View>
            {item.note ? <Text style={styles.itemNote}>{item.note}</Text> : null}
          </Card>
        )}
        ListEmptyComponent={!isLoading ? <Text style={styles.empty}>{t("weightTracker.empty")}</Text> : null}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: spacing.xxxl
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: spacing.xs
  },
  summaryCard: {
    width: "100%",
    marginBottom: spacing.md
  },
  summaryCardWide: {
    width: "48.5%"
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 0.6
  },
  summaryMetric: {
    marginTop: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.cardMetric,
    fontWeight: "800"
  },
  summaryUnit: {
    marginTop: spacing.xs,
    color: colors.primary,
    fontSize: typography.helper,
    fontWeight: "700"
  },
  formCard: {
    marginBottom: spacing.lg
  },
  formIntroTitle: {
    color: colors.textPrimary,
    fontSize: typography.sectionTitle,
    fontWeight: "800",
    marginBottom: spacing.sm
  },
  formIntroText: {
    color: colors.textSecondary,
    fontSize: typography.helper,
    lineHeight: 20,
    marginBottom: spacing.lg
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm
  },
  itemCard: {
    marginBottom: spacing.sm
  },
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  itemWeight: {
    fontWeight: "800",
    color: colors.textPrimary,
    fontSize: typography.bodyStrong
  },
  itemDate: {
    color: colors.primary,
    fontSize: typography.helper,
    fontWeight: "700"
  },
  itemNote: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.helper,
    lineHeight: 19
  },
  empty: {
    color: colors.textSecondary
  }
});
