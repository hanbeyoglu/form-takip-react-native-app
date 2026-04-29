import React from "react";
import { StyleSheet, ViewStyle, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLocalizationStore } from "../../store/localization.store";
import { colors, spacing } from "../../theme/tokens";

type ScreenContainerProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function ScreenContainer({
  children,
  style
}: ScreenContainerProps): React.JSX.Element {
  const { width } = useWindowDimensions();
  const isRTL = useLocalizationStore((state) => state.isRTL);
  const horizontalPadding = Math.min(24, Math.max(18, width * 0.055));

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[
        styles.container,
        { paddingHorizontal: horizontalPadding, direction: isRTL ? "rtl" : "ltr" },
        style
      ]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.sm
  }
});
