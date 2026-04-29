import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { useAppLocale } from "../../../localization/useAppLocale";
import { AppHeader } from "../../../shared/components/AppHeader";
import { Card } from "../../../shared/components/Card";
import { LoadingState } from "../../../shared/components/LoadingState";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { SectionTitle } from "../../../shared/components/SectionTitle";
import { WaterProgress } from "../../../shared/components/WaterProgress";
import { useStatsStore } from "../../../store/stats.store";
import { useWaterStore } from "../../../store/water.store";
import { colors, radius, spacing, typography } from "../../../theme/tokens";

type QuickAmount = {
  id: string;
  label: string;
  amount: number;
  caption: string;
};

const quickAmounts: QuickAmount[] = [
  { id: "200", label: "+200 ml", amount: 200, caption: "Standart bardak" },
  { id: "300", label: "+300 ml", amount: 300, caption: "Buyuk bardak" },
  { id: "500", label: "+500 ml", amount: 500, caption: "Sise modu" }
];

export function WaterTrackerScreen(): React.JSX.Element {
  const { t, formatTime } = useAppLocale();
  const { width } = useWindowDimensions();
  const daily = useWaterStore((state) => state.daily);
  const isLoading = useWaterStore((state) => state.isLoading);
  const error = useWaterStore((state) => state.error);
  const fetchDaily = useWaterStore((state) => state.fetchDaily);
  const quickAdd = useWaterStore((state) => state.quickAdd);
  const dashboard = useStatsStore((state) => state.dashboard);
  const fetchDashboard = useStatsStore((state) => state.fetchDashboard);
  const target = dashboard?.dailyWaterTargetMl ?? 2500;
  const consumed = daily?.totalConsumedMl ?? 0;
  const progress = Math.min(100, Math.round((consumed / target) * 100));
  const isWide = width >= 420;

  React.useEffect(() => {
    void Promise.all([fetchDaily(), fetchDashboard()]);
  }, [fetchDaily, fetchDashboard]);

  return (
    <ScreenContainer>
      <FlatList
        data={daily?.logs ?? []}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <AppHeader title={t("waterTracker.title")} subtitle={t("waterTracker.subtitle")} showBackButton />
            <Card style={styles.heroCard} variant="elevated">
              <Text style={styles.heroLabel}>{t("waterTracker.heroToday")}</Text>
              <Text style={styles.heroMetric}>
                {consumed} <Text style={styles.heroMetricSub}>/ {target} ml</Text>
              </Text>
              <Text style={styles.heroText}>{t("waterTracker.heroText", { progress })}</Text>
              <WaterProgress progress={progress} />
              <View style={styles.metaRow}>
                <View style={styles.metaCard}>
                  <Text style={styles.metaLabel}>{t("waterTracker.remaining")}</Text>
                  <Text style={styles.metaValue}>{Math.max(target - consumed, 0)} ml</Text>
                </View>
                <View style={styles.metaCard}>
                  <Text style={styles.metaLabel}>{t("waterTracker.entries")}</Text>
                  <Text style={styles.metaValue}>{t("waterTracker.entryCount", { count: daily?.logs.length ?? 0 })}</Text>
                </View>
              </View>
            </Card>

            <SectionTitle title={t("waterTracker.quickAdd")} />
            <View style={styles.quickGrid}>
              {quickAmounts.map((option) => (
                <Pressable
                  key={option.id}
                  style={({ pressed }) => [
                    styles.quickCard,
                    isWide ? styles.quickCardWide : null,
                    pressed ? styles.pressed : null
                  ]}
                  onPress={() => void quickAdd(option.amount)}
                >
                  <Text style={styles.quickLabel}>{option.label}</Text>
                  <Text style={styles.quickCaption}>{option.caption}</Text>
                </Pressable>
              ))}
            </View>

            {isLoading ? <LoadingState /> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <SectionTitle title={t("waterTracker.dailyLogs")} />
          </>
        }
        renderItem={({ item }) => (
          <Card style={styles.logCard} variant="muted">
            <View style={styles.logTopRow}>
              <Text style={styles.logAmount}>{item.amountMl} ml</Text>
              <Text style={styles.logTime}>
                {formatTime(item.loggedAt)}
              </Text>
            </View>
            <Text style={styles.logHint}>{t("waterTracker.logHint")}</Text>
          </Card>
        )}
        ListEmptyComponent={
          !isLoading ? <Text style={styles.empty}>{t("waterTracker.empty")}</Text> : null
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: spacing.xxxl
  },
  heroCard: {
    marginBottom: spacing.xl
  },
  heroLabel: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 0.6
  },
  heroMetric: {
    marginTop: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.heroMetric,
    lineHeight: 46,
    fontWeight: "800",
    letterSpacing: -1
  },
  heroMetricSub: {
    color: colors.textSecondary,
    fontSize: typography.subtitle,
    fontWeight: "700"
  },
  heroText: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    color: colors.textSecondary,
    fontSize: typography.helper
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  metaCard: {
    flex: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSoft,
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
    fontSize: typography.bodyStrong,
    fontWeight: "800"
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: spacing.lg
  },
  quickCard: {
    width: "100%",
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    marginBottom: spacing.sm
  },
  quickCardWide: {
    width: "48.5%"
  },
  quickLabel: {
    color: colors.textPrimary,
    fontSize: typography.subtitle,
    fontWeight: "800"
  },
  quickCaption: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.helper
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm
  },
  logCard: {
    marginBottom: spacing.sm
  },
  logTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  logAmount: {
    color: colors.textPrimary,
    fontSize: typography.bodyStrong,
    fontWeight: "800"
  },
  logTime: {
    color: colors.primary,
    fontSize: typography.helper,
    fontWeight: "700"
  },
  logHint: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.helper
  },
  empty: {
    color: colors.textSecondary,
    fontSize: typography.helper
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.985 }]
  }
});
