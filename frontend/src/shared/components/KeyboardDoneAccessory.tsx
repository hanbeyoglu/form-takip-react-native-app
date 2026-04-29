import React from "react";
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import { colors, spacing, typography } from "../../theme/tokens";

type KeyboardDoneAccessoryProps = {
  nativeID: string;
  label?: string;
};

export function KeyboardDoneAccessory({
  nativeID,
  label = "Done"
}: KeyboardDoneAccessoryProps): React.JSX.Element | null {
  if (Platform.OS !== "ios") {
    return null;
  }

  return (
    <InputAccessoryView nativeID={nativeID}>
      <View style={styles.bar}>
        <View style={styles.spacer} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          hitSlop={8}
          onPress={() => Keyboard.dismiss()}
          style={styles.button}
        >
          <Text style={styles.label}>{label}</Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  spacer: {
    flex: 1
  },
  button: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  label: {
    color: colors.primary,
    fontSize: typography.bodyStrong,
    fontWeight: "700"
  }
});
