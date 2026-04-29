import React from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

import { colors, radius, spacing } from "../../../theme/tokens";

type AnimatedProgressTrackProps = {
  progress: number;
};

const RUNNER_SIZE = 14;

export function AnimatedProgressTrack({ progress }: AnimatedProgressTrackProps): React.JSX.Element {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const progressAnim = React.useRef(new Animated.Value(clampedProgress)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const [trackWidth, setTrackWidth] = React.useState(0);

  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: clampedProgress,
      duration: 760,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: false
    }).start(() => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.16,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false
        })
      ]).start();
    });
  }, [clampedProgress, progressAnim, pulseAnim]);

  const animatedFillWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"]
  });
  const runnerTranslateX = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(0, trackWidth - RUNNER_SIZE)]
  });

  return (
    <View
      style={styles.track}
      onLayout={(event) => {
        setTrackWidth(event.nativeEvent.layout.width);
      }}
    >
      <Animated.View style={[styles.fill, { width: animatedFillWidth }]}>
        <View style={styles.fillStart} />
        <View style={styles.fillMid} />
        <View style={styles.fillEnd} />
        <View style={styles.fillGloss} />
      </Animated.View>
      {trackWidth > 0 ? (
        <Animated.View
          style={[
            styles.runner,
            {
              transform: [{ translateX: runnerTranslateX }, { scale: pulseAnim }]
            }
          ]}
        />
      ) : null}
      <View style={styles.targetMarkerOuter}>
        <View style={styles.targetMarkerInner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 18,
    borderRadius: radius.pill,
    backgroundColor: "rgba(223, 229, 242, 0.68)",
    marginTop: spacing.md,
    marginBottom: spacing.md,
    overflow: "visible",
    justifyContent: "center"
  },
  fill: {
    height: "100%",
    borderRadius: radius.pill,
    overflow: "hidden",
    flexDirection: "row"
  },
  fillStart: {
    flex: 1.05,
    backgroundColor: colors.primaryGlow
  },
  fillMid: {
    flex: 1,
    backgroundColor: colors.primary
  },
  fillEnd: {
    flex: 0.92,
    backgroundColor: colors.primaryDeep
  },
  fillGloss: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "44%",
    backgroundColor: "rgba(255,255,255,0.18)"
  },
  runner: {
    position: "absolute",
    width: RUNNER_SIZE,
    height: RUNNER_SIZE,
    borderRadius: RUNNER_SIZE / 2,
    backgroundColor: colors.onPrimary,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4
  },
  targetMarkerOuter: {
    position: "absolute",
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center"
  },
  targetMarkerInner: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary
  }
});
