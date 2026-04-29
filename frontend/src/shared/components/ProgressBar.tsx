import React from "react";
import { StyleSheet, View } from "react-native";

import { colors, radius, shadows } from "../../theme/tokens";

type ProgressBarProps = {
  progress: number;
};

export function ProgressBar({ progress }: ProgressBarProps): React.JSX.Element {
  const safeProgress = Math.max(0, Math.min(100, progress));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${safeProgress}%` }]}>
        <View style={styles.fillStart} />
        <View style={styles.fillMid} />
        <View style={styles.fillEnd} />
        <View style={styles.fillGloss} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 16,
    borderRadius: radius.pill,
    backgroundColor: "rgba(223, 229, 242, 0.7)",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: "hidden",
    ...shadows.shadowSmall
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
    height: "45%",
    backgroundColor: "rgba(255,255,255,0.18)"
  }
});
