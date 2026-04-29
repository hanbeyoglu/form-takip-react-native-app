import React from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

import { useAppLocale } from "../../../localization/useAppLocale";
import { Card } from "../../../shared/components/Card";
import { colors, radius, spacing, typography } from "../../../theme/tokens";

type Gender = "male" | "female" | "other" | undefined;

type WeightJourneyProgressProps = {
  progress: number;
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  gender?: Gender;
};

const TRACK_HEIGHT = 18;
const MARKER_SIZE = 18;

function getMotivationMessage(progressPercent: number): 0 | 25 | 50 | 75 | 100 {
  if (progressPercent >= 100) return 100;
  if (progressPercent >= 75) return 75;
  if (progressPercent >= 50) return 50;
  if (progressPercent >= 25) return 25;
  return 0;
}

function ProgressStatPill({
  label,
  value
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function WeightJourneyBar({
  progress
}: {
  progress: number;
}): React.JSX.Element {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const progressAnim = React.useRef(new Animated.Value(clampedProgress)).current;
  const [trackWidth, setTrackWidth] = React.useState(0);

  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: clampedProgress,
      duration: 760,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: false
    }).start();
  }, [clampedProgress, progressAnim]);

  const animatedFillWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"]
  });

  const markerTranslateX = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(0, trackWidth - MARKER_SIZE)]
  });

  return (
    <View style={styles.barWrap}>
      <View
        style={styles.track}
        onLayout={(event) => {
          setTrackWidth(event.nativeEvent.layout.width);
        }}
      >
        <View style={styles.trackGlass} />
        <Animated.View style={[styles.fill, { width: animatedFillWidth }]}>
          <View style={styles.fillBase} />
          <View style={styles.fillMid} />
          <View style={styles.fillGlow} />
          <View style={styles.fillGloss} />
        </Animated.View>
        {trackWidth > 0 ? (
          <Animated.View
            style={[
              styles.marker,
              {
                transform: [{ translateX: markerTranslateX }]
              }
            ]}
          >
            <View style={styles.markerCore} />
          </Animated.View>
        ) : null}
        <View style={styles.targetMarker}>
          <View style={styles.targetMarkerInner} />
        </View>
      </View>
    </View>
  );
}

export function WeightJourneyProgress({
  progress,
  startWeight,
  currentWeight,
  targetWeight,
  gender
}: WeightJourneyProgressProps): React.JSX.Element {
  const { t } = useAppLocale();
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const progressPercent = Math.round(clampedProgress * 100);
  const remainingWeight = Math.max(0, currentWeight - targetWeight);
  const motivation = t(`weightJourney.motivation.${getMotivationMessage(progressPercent)}`);
  void gender;

  return (
    <Card style={styles.card} variant="elevated">
      <View style={styles.header}>
        <Text style={styles.title}>{t("weightJourney.title")}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{`%${progressPercent}`}</Text>
        </View>
      </View>
      <Text style={styles.metric}>{currentWeight} kg</Text>
      <Text style={styles.sub}>
        {t("weightJourney.completed", { percent: progressPercent, remaining: remainingWeight.toFixed(1) })}
      </Text>
      <Text style={styles.motivation}>{motivation}</Text>
      <WeightJourneyBar progress={clampedProgress} />
      <View style={styles.statsRow}>
        <ProgressStatPill label={t("weightJourney.start")} value={`${startWeight} kg`} />
        <ProgressStatPill label={t("weightJourney.target")} value={`${targetWeight} kg`} />
        <ProgressStatPill label={t("weightJourney.remaining")} value={`${remainingWeight.toFixed(1)} kg`} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sectionTitle,
    fontWeight: "700"
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft
  },
  badgeText: {
    color: colors.primaryDeep,
    fontSize: typography.caption,
    fontWeight: "800",
    letterSpacing: 0.3
  },
  metric: {
    marginTop: spacing.lg,
    color: colors.textPrimary,
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: -1.1
  },
  sub: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 22
  },
  motivation: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 18
  },
  barWrap: {
    marginTop: spacing.xl
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: radius.pill,
    backgroundColor: "rgba(227, 232, 245, 0.88)",
    overflow: "hidden",
    justifyContent: "center"
  },
  trackGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.42)"
  },
  fill: {
    height: "100%",
    borderRadius: radius.pill,
    overflow: "hidden",
    justifyContent: "center"
  },
  fillBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primaryDeep
  },
  fillMid: {
    position: "absolute",
    left: "18%",
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primaryGlow
  },
  fillGlow: {
    position: "absolute",
    right: -18,
    top: -10,
    width: 54,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.16)"
  },
  fillGloss: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "48%",
    backgroundColor: "rgba(255,255,255,0.22)"
  },
  marker: {
    position: "absolute",
    top: (TRACK_HEIGHT - MARKER_SIZE) / 2,
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primaryDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4
  },
  markerCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryDeep
  },
  targetMarker: {
    position: "absolute",
    right: 0,
    top: (TRACK_HEIGHT - 18) / 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "rgba(91, 87, 232, 0.22)",
    backgroundColor: "rgba(255,255,255,0.78)",
    alignItems: "center",
    justifyContent: "center"
  },
  targetMarkerInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryGlow
  },
  statsRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  },
  statPill: {
    minWidth: 92,
    flexGrow: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSoft
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: "600"
  },
  statValue: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontSize: typography.bodyStrong,
    fontWeight: "700"
  }
});
