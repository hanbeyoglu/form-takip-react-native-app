import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { useAppLocale } from "../../localization/useAppLocale";
import { colors, radius, spacing, typography } from "../../theme/tokens";

type TextFieldProps = TextInputProps & {
  label: string;
  errorMessage?: string;
  helperText?: string;
  inputRef?: React.RefObject<TextInput>;
};

export function TextField({
  label,
  errorMessage,
  helperText,
  inputRef,
  ...inputProps
}: TextFieldProps): React.JSX.Element {
  const [isFocused, setIsFocused] = React.useState(false);
  const { textAlign } = useAppLocale();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { textAlign }]}>{label}</Text>
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          { textAlign },
          isFocused ? styles.inputFocused : null,
          errorMessage ? styles.inputError : null
        ]}
        placeholderTextColor={colors.textMuted}
        onFocus={(event) => {
          setIsFocused(true);
          inputProps.onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          inputProps.onBlur?.(event);
        }}
        {...inputProps}
      />
      {!errorMessage && helperText ? <Text style={[styles.helper, { textAlign }]}>{helperText}</Text> : null}
      {errorMessage ? <Text style={[styles.error, { textAlign }]}>{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg
  },
  label: {
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.helper,
    fontWeight: "700",
    letterSpacing: 0.2
  },
  input: {
    minHeight: 56,
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.body,
    color: colors.textPrimary
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 2
  },
  inputError: {
    borderColor: colors.danger
  },
  helper: {
    marginTop: spacing.sm,
    fontSize: typography.helper,
    color: colors.textSecondary
  },
  error: {
    marginTop: spacing.sm,
    fontSize: typography.caption,
    color: colors.danger
  }
});
