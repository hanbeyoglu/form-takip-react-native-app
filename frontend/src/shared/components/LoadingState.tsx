import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { colors, spacing } from "../../theme/tokens";

export function LoadingState(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xxl,
    alignItems: "center",
    justifyContent: "center"
  }
});
