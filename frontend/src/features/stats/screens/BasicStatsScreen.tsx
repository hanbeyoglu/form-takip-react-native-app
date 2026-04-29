import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppLocale } from "../../../localization/useAppLocale";
import { AppHeader } from "../../../shared/components/AppHeader";
import { Card } from "../../../shared/components/Card";
import { LoadingState } from "../../../shared/components/LoadingState";
import { PrimaryButton } from "../../../shared/components/PrimaryButton";
import { ScreenContainer } from "../../../shared/components/ScreenContainer";
import { useStatsStore } from "../../../store/stats.store";
import { colors, spacing, typography } from "../../../theme/tokens";

export function BasicStatsScreen(): React.JSX.Element {
  const { t, language, formatDate, formatNumber } = useAppLocale();
  const basic = useStatsStore((state) => state.basic);
  const range = useStatsStore((state) => state.basicRange);
  const isLoading = useStatsStore((state) => state.isBasicLoading);
  const error = useStatsStore((state) => state.basicError);
  const fetchBasic = useStatsStore((state) => state.fetchBasic);
  const fallbacks = getBasicStatsFallbacks(language);

  React.useEffect(() => {
    void fetchBasic(range);
  }, [fetchBasic, range]);

  return (
    <ScreenContainer>
      <AppHeader
        title={t("basicStats.title", { defaultValue: fallbacks.title })}
        subtitle={t("basicStats.subtitle", { defaultValue: fallbacks.subtitle })}
      />
      <View style={styles.toggleRow}>
        <PrimaryButton
          label={t("basicStats.range7d", { defaultValue: fallbacks.range7d })}
          onPress={() => void fetchBasic("7d")}
        />
        <PrimaryButton
          label={t("basicStats.range30d", { defaultValue: fallbacks.range30d })}
          onPress={() => void fetchBasic("30d")}
        />
      </View>
      {isLoading ? <LoadingState /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {basic ? (
        <>
          <Card style={styles.card} variant="elevated">
            <Text style={styles.cardTitle}>
              {t("basicStats.rangeLabel", { defaultValue: fallbacks.rangeLabel })}:{" "}
              {formatDate(basic.from, { day: "2-digit", month: "short" })} -{" "}
              {formatDate(basic.to, { day: "2-digit", month: "short" })}
            </Text>
            <Text style={styles.metricLine}>
              {t("basicStats.totalWaterLogs", { defaultValue: fallbacks.totalWaterLogs })}:{" "}
              {formatNumber(basic.totalWaterLogs)}
            </Text>
            <Text style={styles.metricLine}>
              {t("basicStats.averageDailyWater", { defaultValue: fallbacks.averageDailyWater })}:{" "}
              {formatNumber(basic.averageDailyWaterMl)} ml
            </Text>
            <Text style={styles.metricLine}>
              {t("basicStats.goalHitDays", { defaultValue: fallbacks.goalHitDays })}:{" "}
              {formatNumber(basic.waterGoalHitDays)}
            </Text>
          </Card>
          <Card style={styles.card} variant="elevated">
            <Text style={styles.metricLine}>
              {t("basicStats.firstWeight", { defaultValue: fallbacks.firstWeight })}:{" "}
              {basic.firstWeightInRange ?? "-"}
            </Text>
            <Text style={styles.metricLine}>
              {t("basicStats.latestWeight", { defaultValue: fallbacks.latestWeight })}:{" "}
              {basic.latestWeightInRange ?? "-"}
            </Text>
            <Text style={styles.metricLine}>
              {t("basicStats.weightChange", { defaultValue: fallbacks.weightChange })}:{" "}
              {basic.weightChangeInRange ?? "-"}
            </Text>
          </Card>
        </>
      ) : !isLoading && !error ? (
        <Card style={styles.card} variant="muted">
          <Text style={styles.emptyText}>
            {t("basicStats.empty", { defaultValue: fallbacks.empty })}
          </Text>
        </Card>
      ) : null}
    </ScreenContainer>
  );
}

function getBasicStatsFallbacks(language: string) {
  const map = {
    tr: {
      title: "Temel İstatistikler",
      subtitle: "7 ve 30 günlük görünümü tek ekranda incele.",
      range7d: "7 Gün",
      range30d: "30 Gün",
      rangeLabel: "Aralık",
      totalWaterLogs: "Toplam su kaydı",
      averageDailyWater: "Günlük ortalama su",
      goalHitDays: "Hedefe ulaşılan gün",
      firstWeight: "İlk kilo",
      latestWeight: "Son kilo",
      weightChange: "Kilo değişimi",
      empty: "Bu aralık için henüz temel istatistik yok.",
    },
    en: {
      title: "Core Stats",
      subtitle: "Review your 7-day and 30-day snapshot in one place.",
      range7d: "7 Days",
      range30d: "30 Days",
      rangeLabel: "Range",
      totalWaterLogs: "Total water logs",
      averageDailyWater: "Average daily water",
      goalHitDays: "Goal hit days",
      firstWeight: "First weight",
      latestWeight: "Latest weight",
      weightChange: "Weight change",
      empty: "No core stats yet for this range.",
    },
    de: {
      title: "Kernstatistiken",
      subtitle: "Sieh dir die 7-Tage- und 30-Tage-Übersicht an einem Ort an.",
      range7d: "7 Tage",
      range30d: "30 Tage",
      rangeLabel: "Zeitraum",
      totalWaterLogs: "Gesamte Wassereinträge",
      averageDailyWater: "Täglicher Wasserschnitt",
      goalHitDays: "Tage mit erreichtem Ziel",
      firstWeight: "Erstes Gewicht",
      latestWeight: "Letztes Gewicht",
      weightChange: "Gewichtsveränderung",
      empty: "Für diesen Zeitraum gibt es noch keine Kernstatistiken.",
    },
    ar: {
      title: "الإحصاءات الأساسية",
      subtitle: "راجع ملخص 7 أيام و30 يومًا في مكان واحد.",
      range7d: "7 أيام",
      range30d: "30 يومًا",
      rangeLabel: "الفترة",
      totalWaterLogs: "إجمالي سجلات الماء",
      averageDailyWater: "متوسط الماء اليومي",
      goalHitDays: "أيام تحقيق الهدف",
      firstWeight: "أول وزن",
      latestWeight: "آخر وزن",
      weightChange: "تغيّر الوزن",
      empty: "لا توجد إحصاءات أساسية لهذا النطاق بعد.",
    },
  } as const;
  return map[language as keyof typeof map] ?? map.tr;
}

const styles = StyleSheet.create({
  toggleRow: {
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  card: {
    marginBottom: spacing.md
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: typography.bodyStrong,
    fontWeight: "800",
    marginBottom: spacing.sm
  },
  metricLine: {
    color: colors.textSecondary,
    fontSize: typography.body,
    marginBottom: spacing.xs
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.helper
  },
  error: {
    color: colors.danger,
    fontSize: typography.caption,
    marginBottom: spacing.md
  }
});
